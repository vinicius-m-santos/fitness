<?php

namespace App\Repository;

use App\Entity\Exercise;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Exercise>
 */
class ExerciseRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;
    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, Exercise::class);
        $this->em = $em;
    }

    public function add(Exercise $exercise, bool $flush = true): Exercise
    {
        $this->em->persist($exercise);

        if ($flush) {
            $this->em->flush();
        }

        return $exercise;
    }

    /**
     * @return Exercise[] Returns an array of Exercise objects
     */
    public function findAllWithRelationsByUser(int $userId): array
    {
        $conn = $this->getEntityManager()->getConnection();

        $sqlDefaults = 'SELECT deleted_default_exercises 
            FROM personal p 
            INNER JOIN users u ON u.id = p.user_id 
            WHERE u.id = :userId
        ';

        $stmt = $conn->prepare($sqlDefaults);
        $result = $stmt->executeQuery(['userId' => $userId])->fetchAssociative();

        $excludedIds = [];
        if (!empty($result['deleted_default_exercises'])) {
            $decoded = json_decode($result['deleted_default_exercises'], true);
            if (is_array($decoded)) {
                $excludedIds = array_map(fn($e) => (int) $e, $decoded);
            }
        }

        $qb = $this->createQueryBuilder('e')
            ->leftJoin('e.exerciseCategory', 'c')
            ->addSelect('c')
            ->leftJoin('e.personal', 'p')
            ->leftJoin('p.user', 'u')
            ->where('u.id = :userId OR e.personal IS NULL')
            ->setParameter('userId', $userId)
            ->orderBy('e.name', 'ASC');

        if (!empty($excludedIds)) {
            $qb->andWhere('e.id NOT IN (:excludedIds)')
                ->setParameter('excludedIds', $excludedIds);
        }

        return $qb->getQuery()->getResult();
    }




    //    /**
    //     * @return Exercise[] Returns an array of Exercise objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('e.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Exercise
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
