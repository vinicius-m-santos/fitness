<?php

namespace App\Service;

use App\Entity\PeriodExercise;
use App\Entity\Personal;
use App\Entity\User;
use App\Repository\PeriodExerciseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class PeriodExerciseService
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly PeriodExerciseRepository $periodExerciseRepository,
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher
    )
    {
    }

    public function add(PeriodExercise $periodExercise, bool $flush = true): PeriodExercise
    {
        return $this->periodExerciseRepository->add($periodExercise, $flush);
    }

    public function find(int $periodExerciseId): ?PeriodExercise
    {   
        return $this->periodExerciseRepository->find($periodExerciseId);
    }

}
