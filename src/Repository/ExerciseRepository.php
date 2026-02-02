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
            ->where('e.isStandard = true OR u.id = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('e.name', 'ASC');

        if (!empty($excludedIds)) {
            $qb->andWhere('e.id NOT IN (:excludedIds)')
                ->setParameter('excludedIds', $excludedIds);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @param int[]|null $favoriteIds IDs of exercises favorited by current personal (for ordering)
     * @return array{0: Exercise[], 1: int}
     */
    public function findPaginatedByUser(int $userId, ?int $personalId, int $page = 1, int $limit = 20, bool $favoritesOnly = false, ?array $favoriteIds = null, string $search = '', string $order = 'newest', bool $ownOnly = false, ?int $categoryId = null, ?int $muscleGroupId = null): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $sqlDefaults = 'SELECT deleted_default_exercises FROM personal p INNER JOIN users u ON u.id = p.user_id WHERE u.id = :userId';
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
            ->leftJoin('e.muscleGroup', 'm')
            ->addSelect('m')
            ->leftJoin('e.personal', 'p')
            ->leftJoin('p.user', 'u')
            ->where('e.isStandard = true OR u.id = :userId')
            ->setParameter('userId', $userId);

        if ($ownOnly && $personalId !== null) {
            $qb->andWhere('e.personal = :personalId')
                ->setParameter('personalId', $personalId);
        }

        if (!empty($excludedIds)) {
            $qb->andWhere('e.id NOT IN (:excludedIds)')
                ->setParameter('excludedIds', $excludedIds);
        }

        // Apply search filter: all words must be present in the same field (e.g. "puxada pronada" matches "puxada fechada pronada")
        if (!empty($search)) {
            $words = array_filter(preg_split('/\s+/', trim($search), -1, PREG_SPLIT_NO_EMPTY));
            if (!empty($words)) {
                $fieldOrs = [];
                foreach (['e.name', 'c.name', 'm.name'] as $field) {
                    $ands = [];
                    foreach ($words as $i => $word) {
                        $param = 'sw_' . str_replace('.', '_', $field) . '_' . $i;
                        $ands[] = "LOWER({$field}) LIKE :{$param}";
                        $qb->setParameter($param, '%' . strtolower($word) . '%');
                    }
                    $fieldOrs[] = '(' . implode(' AND ', $ands) . ')';
                }
                $qb->andWhere('(' . implode(' OR ', $fieldOrs) . ')');
            }
        }

        if ($categoryId !== null) {
            $qb->andWhere('c.id = :categoryId')
                ->setParameter('categoryId', $categoryId);
        }

        if ($muscleGroupId !== null) {
            $qb->andWhere('m.id = :muscleGroupId')
                ->setParameter('muscleGroupId', $muscleGroupId);
        }

        if ($favoritesOnly && $personalId !== null) {
            $idsForFilter = $favoriteIds ?? $this->getExerciseIdsFavoritedByPersonal($personalId);
            if (empty($idsForFilter)) {
                return [[], 0];
            }
            $qb->andWhere('e.id IN (:favoriteIds)')
                ->setParameter('favoriteIds', $idsForFilter);
        }

        $totalQb = clone $qb;
        $total = (int) $totalQb->select('COUNT(e.id)')->getQuery()->getSingleScalarResult();

        // Apply ordering
        if (!empty($favoriteIds)) {
            $qb->addOrderBy('CASE WHEN e.id IN (:orderFavoriteIds) THEN 0 ELSE 1 END', 'ASC')
                ->setParameter('orderFavoriteIds', $favoriteIds);
        }

        switch ($order) {
            case 'name-asc':
                $qb->addOrderBy('e.name', 'ASC');
                break;
            case 'name-desc':
                $qb->addOrderBy('e.name', 'DESC');
                break;
            case 'oldest':
                $qb->addOrderBy('e.createdAt', 'ASC');
                break;
            case 'newest':
            default:
                $qb->addOrderBy('e.createdAt', 'DESC');
                break;
        }

        $offset = ($page - 1) * $limit;
        $exercises = $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return [$exercises, $total];
    }

    /**
     * @return int[]
     */
    public function getExerciseIdsFavoritedByPersonal(int $personalId): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $sql = "SELECT id FROM exercises WHERE favorite IS NOT NULL AND favorite::jsonb @> to_jsonb(:personalId::int)";
        $result = $conn->executeQuery($sql, ['personalId' => $personalId]);
        $rows = $result->fetchAllAssociative();
        $ids = [];
        foreach ($rows as $row) {
            $ids[] = (int) $row['id'];
        }
        return $ids;
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
