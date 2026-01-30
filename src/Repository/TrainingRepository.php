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
            ->orderBy('t.createdAt', 'DESC');
        
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
            ->getQuery()
            ->getOneOrNullResult();
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
