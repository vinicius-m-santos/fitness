<?php

namespace App\Repository;

use App\Entity\TrainingPeriodStandard;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<TrainingPeriodStandard> */
class TrainingPeriodStandardRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry, private EntityManagerInterface $em)
    {
        parent::__construct($registry, TrainingPeriodStandard::class);
    }

    public function add(TrainingPeriodStandard $entity, bool $flush = true): TrainingPeriodStandard
    {
        $this->em->persist($entity);
        if ($flush) {
            $this->em->flush();
        }
        return $entity;
    }
}
