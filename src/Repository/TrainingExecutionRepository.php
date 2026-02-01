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
     * When $activePairs is provided, only counts executions of (client_id, training_id) in the list (treino ativo).
     *
     * @param array<int, array{0: int, 1: int}> $activePairs list of [clientId, trainingId]
     */
    public function countFinishedInWeek(Personal $personal, \DateTimeImmutable $weekStart, \DateTimeImmutable $weekEnd, array $activePairs = []): int
    {
        if (empty($activePairs)) {
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
        return $this->countFinishedInWeekFiltered($personal->getId(), $weekStart, $weekEnd, $activePairs);
    }

    /**
     * @param array<int, array{0: int, 1: int}> $activePairs
     */
    private function countFinishedInWeekFiltered(int $personalId, \DateTimeImmutable $weekStart, \DateTimeImmutable $weekEnd, array $activePairs): int
    {
        $conn = $this->em->getConnection();
        $conditions = [];
        $params = [
            'personalId' => $personalId,
            'weekStart' => $weekStart->setTime(0, 0, 0)->format('Y-m-d H:i:s'),
            'weekEnd' => $weekEnd->setTime(23, 59, 59)->format('Y-m-d H:i:s'),
        ];
        foreach ($activePairs as $i => $p) {
            $conditions[] = "(te.client_id = :c$i AND te.training_id = :t$i)";
            $params["c$i"] = $p[0];
            $params["t$i"] = $p[1];
        }
        $sql = 'SELECT COUNT(te.id) FROM training_executions te
                INNER JOIN training t ON t.id = te.training_id
                WHERE t.personal_id = :personalId AND te.finished_at IS NOT NULL
                  AND te.finished_at >= :weekStart AND te.finished_at <= :weekEnd
                  AND (' . implode(' OR ', $conditions) . ')';
        return (int) $conn->executeQuery($sql, $params)->fetchOne();
    }

    /**
     * Client IDs that had at least one finished execution in the week.
     * When $activePairs is provided, only considers executions of treino ativo.
     *
     * @param array<int, array{0: int, 1: int}> $activePairs
     * @return int[]
     */
    public function findClientIdsFinishedInWeek(Personal $personal, \DateTimeImmutable $weekStart, \DateTimeImmutable $weekEnd, array $activePairs = []): array
    {
        if (empty($activePairs)) {
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
        $conn = $this->em->getConnection();
        $conditions = [];
        $params = [
            'personalId' => $personal->getId(),
            'weekStart' => $weekStart->setTime(0, 0, 0)->format('Y-m-d H:i:s'),
            'weekEnd' => $weekEnd->setTime(23, 59, 59)->format('Y-m-d H:i:s'),
        ];
        foreach ($activePairs as $i => $p) {
            $conditions[] = "(te.client_id = :c$i AND te.training_id = :t$i)";
            $params["c$i"] = $p[0];
            $params["t$i"] = $p[1];
        }
        $sql = 'SELECT DISTINCT te.client_id FROM training_executions te
                INNER JOIN training t ON t.id = te.training_id
                WHERE t.personal_id = :personalId AND te.finished_at IS NOT NULL
                  AND te.finished_at >= :weekStart AND te.finished_at <= :weekEnd
                  AND (' . implode(' OR ', $conditions) . ')';
        $result = $conn->executeQuery($sql, $params)->fetchFirstColumn();
        return array_map('intval', $result);
    }

    /**
     * Last finished_at per client for personal's clients (clients who never finished return null).
     *
     * @return array<int, \DateTimeImmutable|null> clientId => lastFinishedAt
     */
    public function findLastFinishedAtByPersonalClients(int $personalId): array
    {
        return $this->findLastFinishedAtByPersonalClientsBeforeOrOn($personalId, new \DateTimeImmutable('now'));
    }

    /**
     * Last finished_at per client for personal's clients, only considering executions
     * with finished_at <= beforeOrOn. When $activeMap is provided (clientId => trainingId),
     * only considers executions of treino ativo.
     *
     * @param array<int, int> $activeMap clientId => trainingId
     * @return array<int, \DateTimeImmutable|null> clientId => lastFinishedAt
     */
    public function findLastFinishedAtByPersonalClientsBeforeOrOn(int $personalId, \DateTimeImmutable $beforeOrOn, array $activeMap = []): array
    {
        $conn = $this->em->getConnection();
        if (empty($activeMap)) {
            $sql = 'SELECT te.client_id, MAX(te.finished_at) AS last_finished
                    FROM training_executions te
                    INNER JOIN training t ON t.id = te.training_id
                    WHERE t.personal_id = :personalId AND te.finished_at IS NOT NULL AND te.finished_at <= :beforeOrOn
                    GROUP BY te.client_id';
            $rows = $conn->executeQuery($sql, [
                'personalId' => $personalId,
                'beforeOrOn' => $beforeOrOn->format('Y-m-d H:i:s'),
            ])->fetchAllAssociative();
        } else {
            $conditions = [];
            $params = ['personalId' => $personalId, 'beforeOrOn' => $beforeOrOn->format('Y-m-d H:i:s')];
            foreach ($activeMap as $i => $tid) {
                $conditions[] = "(te.client_id = :c$i AND te.training_id = :t$i)";
                $params["c$i"] = $i;
                $params["t$i"] = $tid;
            }
            $sql = 'SELECT te.client_id, MAX(te.finished_at) AS last_finished
                    FROM training_executions te
                    INNER JOIN training t ON t.id = te.training_id
                    WHERE t.personal_id = :personalId AND te.finished_at IS NOT NULL AND te.finished_at <= :beforeOrOn
                      AND (' . implode(' OR ', $conditions) . ')
                    GROUP BY te.client_id';
            $rows = $conn->executeQuery($sql, $params)->fetchAllAssociative();
        }
        $out = [];
        foreach ($rows as $row) {
            $out[(int) $row['client_id']] = $row['last_finished']
                ? new \DateTimeImmutable($row['last_finished']) : null;
        }
        return $out;
    }

    /**
     * Count of finished training executions per training period in the week.
     * When $activePairs is provided, only counts executions of treino ativo.
     *
     * @param array<int, array{0: int, 1: int}> $activePairs
     * @return array<int, array{periodId: int, periodName: string, trainingName: string, count: int}>
     */
    public function countExecutionsByPeriodInWeek(Personal $personal, \DateTimeImmutable $weekStart, \DateTimeImmutable $weekEnd, array $activePairs = []): array
    {
        $conn = $this->em->getConnection();
        $params = [
            'personalId' => $personal->getId(),
            'weekStart' => $weekStart->setTime(0, 0, 0)->format('Y-m-d H:i:s'),
            'weekEnd' => $weekEnd->setTime(23, 59, 59)->format('Y-m-d H:i:s'),
        ];
        $activeFilter = '';
        if (!empty($activePairs)) {
            $conditions = [];
            foreach ($activePairs as $i => $p) {
                $conditions[] = "(te.client_id = :c$i AND te.training_id = :t$i)";
                $params["c$i"] = $p[0];
                $params["t$i"] = $p[1];
            }
            $activeFilter = ' AND (' . implode(' OR ', $conditions) . ')';
        }
        $sql = 'SELECT tp.id AS period_id, tp.name AS period_name, t.name AS training_name,
                       COUNT(DISTINCT te.id) AS execution_count
                FROM training_executions te
                INNER JOIN training t ON t.id = te.training_id
                INNER JOIN exercise_executions ee ON ee.training_execution_id = te.id
                INNER JOIN period_exercises pe ON pe.id = ee.period_exercise_id
                INNER JOIN training_periods tp ON tp.id = pe.training_period_id
                WHERE t.personal_id = :personalId AND te.finished_at IS NOT NULL
                  AND te.finished_at >= :weekStart AND te.finished_at <= :weekEnd' . $activeFilter . '
                GROUP BY tp.id, tp.name, t.name
                ORDER BY execution_count DESC';
        $rows = $conn->executeQuery($sql, $params)->fetchAllAssociative();
        $out = [];
        foreach ($rows as $row) {
            $out[] = [
                'periodId' => (int) $row['period_id'],
                'periodName' => (string) $row['period_name'],
                'trainingName' => (string) $row['training_name'],
                'count' => (int) $row['execution_count'],
            ];
        }
        return $out;
    }

    /**
     * Average execution duration in the week (finished_at - started_at). Only finished executions.
     * When $activePairs is provided, only executions of treino ativo.
     *
     * @param array<int, array{0: int, 1: int}> $activePairs
     * @return array{totalSeconds: int, count: int}
     */
    public function getAverageExecutionDurationInWeek(Personal $personal, \DateTimeImmutable $weekStart, \DateTimeImmutable $weekEnd, array $activePairs = []): array
    {
        $conn = $this->em->getConnection();
        $params = [
            'personalId' => $personal->getId(),
            'weekStart' => $weekStart->setTime(0, 0, 0)->format('Y-m-d H:i:s'),
            'weekEnd' => $weekEnd->setTime(23, 59, 59)->format('Y-m-d H:i:s'),
        ];
        $activeFilter = '';
        if (!empty($activePairs)) {
            $conditions = [];
            foreach ($activePairs as $i => $p) {
                $conditions[] = "(te.client_id = :c$i AND te.training_id = :t$i)";
                $params["c$i"] = $p[0];
                $params["t$i"] = $p[1];
            }
            $activeFilter = ' AND (' . implode(' OR ', $conditions) . ')';
        }
        $sql = 'SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (te.finished_at - te.started_at))::int), 0) AS total_seconds,
                       COUNT(te.id) AS cnt
                FROM training_executions te
                INNER JOIN training t ON t.id = te.training_id
                WHERE t.personal_id = :personalId AND te.finished_at IS NOT NULL
                  AND te.finished_at >= :weekStart AND te.finished_at <= :weekEnd' . $activeFilter;
        $row = $conn->executeQuery($sql, $params)->fetchAssociative();
        return [
            'totalSeconds' => (int) ($row['total_seconds'] ?? 0),
            'count' => (int) ($row['cnt'] ?? 0),
        ];
    }

    /**
     * @param Client $client
     * @param int $limit
     * @return list<TrainingExecution>
     */
    public function findFinishedByClientOrderByFinishedAtDesc(Client $client, int $limit = 30): array
    {
        $results = $this->createQueryBuilder('te')
            ->leftJoin('te.training', 't')->addSelect('t')
            ->leftJoin('te.exerciseExecutions', 'ee')->addSelect('ee')
            ->leftJoin('ee.periodExercise', 'pe')->addSelect('pe')
            ->leftJoin('pe.exercise', 'e')->addSelect('e')
            ->leftJoin('pe.trainingPeriod', 'tp')->addSelect('tp')
            ->leftJoin('ee.setExecutions', 'se')->addSelect('se')
            ->where('te.client = :client')
            ->andWhere('te.finishedAt IS NOT NULL')
            ->setParameter('client', $client)
            ->orderBy('te.finishedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
        return array_values($results);
    }
}
