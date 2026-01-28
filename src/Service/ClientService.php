<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Personal;
use App\Entity\User;
use App\Repository\ClientRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class ClientService
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly ClientRepository $clientRepository,
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private readonly UserRepository $userRepository,
        private readonly S3Service $s3Service
    ) {}

    public function add(Client $client, bool $flush = true): Client
    {
        return $this->clientRepository->add($client, $flush);
    }

    public function saveClientProfileImage(File $file, User $user, Client $client): string
    {
        $clientOriginalName = trim($file->getClientOriginalName() ?? '');

        if (empty($clientOriginalName)) {
            throw new UnprocessableEntityHttpException('Nome de arquivo inválido');
        }

        $filename = sprintf('%s-%s', uniqid(), $clientOriginalName);
        $filePath = sprintf('%s/clients/%s/%s', $user->getUuid(), $client->getId(), $filename);

        $this->s3Service->saveFile($file, $filePath);

        $clientUser = $client->getUser();
        if (!$clientUser) {
            throw new UnprocessableEntityHttpException('Cliente não possui usuário associado');
        }

        $key = $clientUser->getAvatarKey();
        if (!empty($key)) {
            $this->s3Service->deleteObject($key);
        }

        $clientUser->setAvatarKey($filePath);
        $url = $this->s3Service->generateFileUrl($filePath) ?? '';

        if (empty($url)) {
            throw new UnprocessableEntityHttpException('Erro ao salvar imagem');
        }

        $clientUser->setAvatarUrl($url);
        $this->userRepository->add($clientUser, false);
        $this->add($client);

        return $url;
    }

    public function createClient(Personal $personal, Client $client, ?array $data = null): Client
    {
        $user = new User();

        $email = null;
        if ($data && isset($data['email']) && !empty($data['email'])) {
            $email = $data['email'];
        } else {
            $email = $client->getUser()?->getEmail();
        }

        if (empty($email)) {
            throw new UnprocessableEntityHttpException('Email é obrigatório para criar cliente');
        }

        $user->setEmail($email);
        $user->setFirstName($client->getName());
        $user->setLastName($client->getLastName());
        $user->setRoles(['ROLE_CLIENT']);
        $user->setPassword($this->passwordHasher->hashPassword($user, $email));

        // Se os dados foram fornecidos, setar phone, avatarKey e avatarUrl do array
        if ($data) {
            if (isset($data['phone']) && !empty($data['phone'])) {
                $user->setPhone($data['phone']);
            }
            if (isset($data['avatarKey']) && !empty($data['avatarKey'])) {
                $user->setAvatarKey($data['avatarKey']);
            }
            if (isset($data['avatarUrl']) && !empty($data['avatarUrl'])) {
                $user->setAvatarUrl($data['avatarUrl']);
            }
        }

        $this->userRepository->add($user, false);

        $client->setUser($user);
        $client->setPersonal($personal);
        $this->add($client);

        $personal->addClient($client);

        return $client;
    }

    public function find(int $clientId): ?Client
    {
        return $this->clientRepository->find($clientId);
    }

    public function findOneBy(array $criteria, array|null $orderBy = null): ?Client
    {
        return $this->clientRepository->findOneBy($criteria, $orderBy);
    }
}
