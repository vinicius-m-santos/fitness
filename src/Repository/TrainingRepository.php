<?php

namespace App\Repository;

use App\Entity\Client;
use App\Entity\Personal;
use App\Entity\Training;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Training>
 */
class TrainingRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;
    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, Training::class);
        $this->em = $em;
    }

    public function add(Training $training, bool $flush = true): Training
    {
        $this->em->persist($training);

        if($flush){
            $this->em->flush();
        }

        return $training;
    }

    public function findWithRelations(Client $client, Personal $personal): mixed
    {
        $qb = $this->createQueryBuilder('t');

        $qb->leftJoin('t.periods', 'p')
            ->leftJoin('p.periodExercises', 'pe')
            ->leftJoin('pe.exercise', 'e')
            ->addSelect(['p', 'pe', 'e'])
            ->where('t.client = :client')
            ->andWhere('t.personal = :personal')
            ->setParameter('client', $client)
            ->setParameter('personal', $personal)
            ->orderBy('t.createdAt', 'DESC')
            ->addOrderBy('p.id', 'ASC')
            ->addOrderBy('pe.id', 'ASC');
        
        return $qb->getQuery()->getResult();
    }

    public function findOneWithRelations(int $id, Personal $personal): ?Training
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.periods', 'p')->addSelect('p')
            ->leftJoin('p.periodExercises', 'pe')->addSelect('pe')
            ->leftJoin('pe.exercise', 'e')->addSelect('e')
            ->where('t.personal = :personal')
            ->andWhere('t.id = :id')
            ->setParameter('personal', $personal)
            ->setParameter('id', $id)
            ->addOrderBy('p.id', 'ASC')
            ->addOrderBy('pe.id', 'ASC')
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Active training (last created as of date) per client with period count.
     * Only clients that have at least one training with created_at <= asOf are returned.
     *
     * @param int[] $clientIds
     * @return array<int, array{trainingId: int, periodCount: int}>
     */
    public function findActiveTrainingWithPeriodCountByClientAsOf(int $personalId, array $clientIds, \DateTimeImmutable $asOf): array
    {
        if (empty($clientIds)) {
            return [];
        }
        $conn = $this->em->getConnection();
        $asOfStr = $asOf->format('Y-m-d H:i:s');
        $clientPlaceholders = implode(',', array_fill(0, count($clientIds), '?'));
        $sql = "SELECT t.client_id, t.id AS training_id, COUNT(tp.id) AS period_count
                FROM training t
                LEFT JOIN training_periods tp ON tp.training_id = t.id
                WHERE t.personal_id = ? AND t.client_id IN ($clientPlaceholders) AND t.created_at <= ?
                  AND t.created_at = (
                    SELECT MAX(t2.created_at) FROM training t2
                    WHERE t2.client_id = t.client_id AND t2.personal_id = t.personal_id AND t2.created_at <= ?
                  )
                GROUP BY t.client_id, t.id";
        $params = array_merge([$personalId], $clientIds, [$asOfStr, $asOfStr]);
        $rows = $conn->executeQuery($sql, $params)->fetchAllAssociative();
        $out = [];
        foreach ($rows as $row) {
            $out[(int) $row['client_id']] = [
                'trainingId' => (int) $row['training_id'],
                'periodCount' => (int) $row['period_count'],
            ];
        }
        return $out;
    }

    /**
     * Trainings (non-standard) with dueDate between from and to (inclusive), for personal's clients.
     *
     * @return Training[]
     */
    public function findExpiringBetween(Personal $personal, \DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.client', 'c')->addSelect('c')
            ->where('t.personal = :personal')
            ->andWhere('t.isStandard = false')
            ->andWhere('t.dueDate IS NOT NULL')
            ->andWhere('t.dueDate >= :from')
            ->andWhere('t.dueDate <= :to')
            ->setParameter('personal', $personal)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('t.dueDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    // public function findWithRelations(Client $client, Personal $personal): mixed
    // {
    //      return $this->createQueryBuilder('t')
    //         ->leftJoin('t.periods', 'p')
    //         ->addSelect('p')
    //         ->leftJoin('p.periodExercises', 'pe')
    //         ->addSelect('pe')
    //         ->leftJoin('pe.exercise', 'e')
    //         ->addSelect('e')
    //         ->where('t.client = :client')
    //         ->andWhere('t.personal = :personal')
    //         ->setParameter('client', $client)
    //         ->setParameter('personal', $personal)
    //         ->getQuery()
    //         ->getArrayResult();
    // }
    //    /**
    //     * @return Training[] Returns an array of Training objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('t')
    //            ->andWhere('t.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('t.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Training
    //    {
    //        return $this->createQueryBuilder('t')
    //            ->andWhere('t.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
