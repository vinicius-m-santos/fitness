<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Personal;
use App\Entity\User;
use App\Repository\ClientRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class ClientService
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly ClientRepository $clientRepository,
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private readonly UserRepository $userRepository
    )
    {
    }

    public function add(Client $client, bool $flush = true): Client
    {
        return $this->clientRepository->add($client, $flush);
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
}
