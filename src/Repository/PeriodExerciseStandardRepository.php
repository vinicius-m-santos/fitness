<?php

namespace App\Repository;

use App\Entity\PeriodExerciseStandard;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<PeriodExerciseStandard> */
class PeriodExerciseStandardRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry, private EntityManagerInterface $em)
    {
        parent::__construct($registry, PeriodExerciseStandard::class);
    }

    public function add(PeriodExerciseStandard $entity, bool $flush = true): PeriodExerciseStandard
    {
        $this->em->persist($entity);
        if ($flush) {
            $this->em->flush();
        }
        return $entity;
    }
}
