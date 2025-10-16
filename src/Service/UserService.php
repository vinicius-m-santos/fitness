<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Psr\Log\LoggerInterface;

class UserService
{
    private LoggerInterface $logger;
    private UserRepository $userRepository;

    public function __construct(LoggerInterface $logger, UserRepository $userRepository)
    {
        $this->logger = $logger;
        $this->userRepository = $userRepository;
    }

    public function add(User $user, bool $flush = true): void
    {
        $this->userRepository->add($user, $flush);
    }

    public function get(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }

    public function send(string $to, string $subject, string $message): void
    {
        // Just log for this example
        $this->logger->info("Sending email to $to: $subject - $message");

        // In real use, integrate with MailerInterface
    }
}
