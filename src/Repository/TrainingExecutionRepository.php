<?php

namespace App\Repository;

use App\Entity\Client;
use App\Entity\Personal;
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

    /**
     * Count finished training executions in week for personal's clients.
     */
    public function countFinishedInWeek(Personal $personal, \DateTimeImmutable $weekStart, \DateTimeImmutable $weekEnd): int
    {
        $qb = $this->createQueryBuilder('te')
            ->select('COUNT(te.id)')
            ->innerJoin('te.training', 't')
            ->where('t.personal = :personal')
            ->andWhere('te.finishedAt IS NOT NULL')
            ->andWhere('te.finishedAt >= :weekStart')
            ->andWhere('te.finishedAt <= :weekEnd')
            ->setParameter('personal', $personal)
            ->setParameter('weekStart', $weekStart->setTime(0, 0, 0))
            ->setParameter('weekEnd', $weekEnd->setTime(23, 59, 59));
        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Client IDs that had at least one finished execution in the week.
     *
     * @return int[]
     */
    public function findClientIdsFinishedInWeek(Personal $personal, \DateTimeImmutable $weekStart, \DateTimeImmutable $weekEnd): array
    {
        $qb = $this->createQueryBuilder('te')
            ->select('DISTINCT IDENTITY(te.client)')
            ->innerJoin('te.training', 't')
            ->where('t.personal = :personal')
            ->andWhere('te.finishedAt IS NOT NULL')
            ->andWhere('te.finishedAt >= :weekStart')
            ->andWhere('te.finishedAt <= :weekEnd')
            ->setParameter('personal', $personal)
            ->setParameter('weekStart', $weekStart->setTime(0, 0, 0))
            ->setParameter('weekEnd', $weekEnd->setTime(23, 59, 59));
        $result = $qb->getQuery()->getSingleColumnResult();
        return array_map('intval', $result);
    }

    /**
     * Last finished_at per client for personal's clients (clients who never finished return null).
     *
     * @return array<int, \DateTimeImmutable|null> clientId => lastFinishedAt
     */
    public function findLastFinishedAtByPersonalClients(int $personalId): array
    {
        $conn = $this->em->getConnection();
        $sql = 'SELECT te.client_id, MAX(te.finished_at) AS last_finished
                FROM training_executions te
                INNER JOIN training t ON t.id = te.training_id
                WHERE t.personal_id = :personalId AND te.finished_at IS NOT NULL
                GROUP BY te.client_id';
        $rows = $conn->executeQuery($sql, ['personalId' => $personalId])->fetchAllAssociative();
        $out = [];
        foreach ($rows as $row) {
            $out[(int) $row['client_id']] = $row['last_finished']
                ? new \DateTimeImmutable($row['last_finished']) : null;
        }
        return $out;
    }
}
