<?php

namespace App\Repository;

use App\Entity\Client;
use App\Entity\Training;
use App\Entity\TrainingExecution;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TrainingExecution>
 */
class TrainingExecutionRepository extends ServiceEntityRepository
{
    public function __construct(
        ManagerRegistry $registry,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct($registry, TrainingExecution::class);
    }

    public function add(TrainingExecution $entity, bool $flush = true): TrainingExecution
    {
        $this->em->persist($entity);
        if ($flush) {
            $this->em->flush();
        }
        return $entity;
    }

    public function findLastRestSecondsByClient(Client $client): ?int
    {
        $conn = $this->em->getConnection();
        $sql = 'SELECT se.rest_seconds FROM set_executions se
            INNER JOIN exercise_executions ee ON ee.id = se.exercise_execution_id
            INNER JOIN training_executions te ON te.id = ee.training_execution_id
            WHERE te.client_id = :clientId AND se.rest_seconds IS NOT NULL
            ORDER BY te.started_at DESC LIMIT 1';
        $result = $conn->executeQuery($sql, ['clientId' => $client->getId()])->fetchOne();
        return $result !== false ? (int) $result : null;
    }

    public function findLastFinishedAtByTraining(Training $training): ?\DateTimeImmutable
    {
        $te = $this->createQueryBuilder('te')
            ->where('te.training = :training')
            ->andWhere('te.finishedAt IS NOT NULL')
            ->setParameter('training', $training)
            ->orderBy('te.finishedAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
        return $te?->getFinishedAt();
    }

    public function findLastByClientAndTraining(Client $client, Training $training): ?TrainingExecution
    {
        return $this->createQueryBuilder('te')
            ->leftJoin('te.exerciseExecutions', 'ee')->addSelect('ee')
            ->leftJoin('ee.periodExercise', 'pe')->addSelect('pe')
            ->leftJoin('pe.trainingPeriod', 'tp')->addSelect('tp')
            ->where('te.client = :client')
            ->andWhere('te.training = :training')
            ->setParameter('client', $client)
            ->setParameter('training', $training)
            ->orderBy('te.startedAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
