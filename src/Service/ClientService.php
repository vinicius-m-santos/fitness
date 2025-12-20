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
    )
    {
    }

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

        $key = $client->getAvatarKey();
        if (!empty($key)) {
            $this->s3Service->deleteObject($key);
        }

        $client->setAvatarKey($filePath);
        $url = $this->s3Service->generateFileUrl($filePath) ?? '';

        if (empty($url)) {
            throw new UnprocessableEntityHttpException('Erro ao salvar imagem');
        }

        $client->setAvatarUrl($url);
        $this->add($client);

        return $url;
    }

    public function createClient(Personal $personal, Client $client): Client
    {
        $user = new User();
        $user->setEmail($client->getEmail());
        $user->setFirstName($client->getName());
        $user->setLastName($client->getLastName());
        $user->setRoles(['ROLE_CLIENT']);
        $user->setPassword($this->passwordHasher->hashPassword($user, $client->getEmail()));

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
