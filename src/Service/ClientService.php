<?php

namespace App\Service;

use App\Entity\Client;
use App\Repository\ClientRepository;
use Psr\Log\LoggerInterface;

class ClientService
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly ClientRepository $clientRepository
    )
    {
    }

    public function add(Client $client, bool $flush = true): Client
    {
        return $this->clientRepository->add($client, $flush);
    }
}
