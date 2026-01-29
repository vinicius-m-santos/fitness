<?php

namespace App\Repository;

use App\Entity\Client;
use App\Entity\SetExecution;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<SetExecution>
 */
class SetExecutionRepository extends ServiceEntityRepository
{
    public function __construct(
        ManagerRegistry $registry,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct($registry, SetExecution::class);
    }

    public function add(SetExecution $entity, bool $flush = true): SetExecution
    {
        $this->em->persist($entity);
        if ($flush) {
            $this->em->flush();
        }
        return $entity;
    }

    public function findLastLoadKgByClientAndPeriodExercise(Client $client, int $periodExerciseId): ?float
    {
        $conn = $this->em->getConnection();
        $sql = 'SELECT se.load_kg FROM set_executions se
            INNER JOIN exercise_executions ee ON ee.id = se.exercise_execution_id
            INNER JOIN training_executions te ON te.id = ee.training_execution_id
            WHERE te.client_id = :clientId AND ee.period_exercise_id = :periodExerciseId AND se.load_kg IS NOT NULL
            ORDER BY te.started_at DESC, se.set_number DESC LIMIT 1';
        $result = $conn->executeQuery($sql, [
            'clientId' => $client->getId(),
            'periodExerciseId' => $periodExerciseId,
        ])->fetchOne();
        return $result !== false ? (float) $result : null;
    }

    /**
     * @return array<int, array{setNumber: int, loadKg: float|null}>
     */
    public function findLastLoadsByClientAndPeriodExercise(Client $client, int $periodExerciseId): array
    {
        $conn = $this->em->getConnection();
        $sql = 'SELECT ee.id as ee_id FROM exercise_executions ee
            INNER JOIN training_executions te ON te.id = ee.training_execution_id
            INNER JOIN set_executions se ON se.exercise_execution_id = ee.id AND se.load_kg IS NOT NULL
            WHERE te.client_id = :clientId AND ee.period_exercise_id = :periodExerciseId
            ORDER BY te.started_at DESC LIMIT 1';
        $row = $conn->executeQuery($sql, [
            'clientId' => $client->getId(),
            'periodExerciseId' => $periodExerciseId,
        ])->fetchAssociative();
        if (!$row || !isset($row['ee_id'])) {
            return [];
        }
        $eeId = (int) $row['ee_id'];
        $sql2 = 'SELECT set_number, load_kg FROM set_executions WHERE exercise_execution_id = :eeId ORDER BY set_number';
        $rows = $conn->executeQuery($sql2, ['eeId' => $eeId])->fetchAllAssociative();
        $result = [];
        foreach ($rows as $r) {
            $result[(int) $r['set_number']] = [
                'setNumber' => (int) $r['set_number'],
                'loadKg' => $r['load_kg'] !== null ? (float) $r['load_kg'] : null,
            ];
        }
        return $result;
    }
}
