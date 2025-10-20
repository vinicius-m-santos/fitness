<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Personal;
use App\Entity\User;
use App\Repository\ClientRepository;
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
        private UserPasswordHasherInterface $passwordHasher
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
        $user->setEmail(sprintf('%s%s@dummy.com', $client->getName(), $client->getLastName()));
        $user->setFirstName($client->getName());
        $user->setLastName($client->getLastName());
        $user->setRoles(['ROLE_CLIENT']);
        $user->setPassword($this->passwordHasher->hashPassword($user, sprintf('%s%s@dummy.com', $client->getName(), $client->getLastName())));

        $this->em->persist($user);

        $client->setUser($user);
        $client->setPersonal($personal);
        $this->em->persist($client);
        $this->em->flush();

        $personal->addClient($client);

        return $client;
    }
}
