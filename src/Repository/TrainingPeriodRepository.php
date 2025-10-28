<?php

namespace App\Repository;

use App\Entity\Exercise;
use App\Entity\Training;
use App\Entity\TrainingPeriod;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TrainingPeriod>
 */
class TrainingPeriodRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;
    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, Training::class);
        $this->em = $em;
    }

    public function add(TrainingPeriod $trainingPeriod, bool $flush = true): TrainingPeriod
    {
        $this->em->persist($trainingPeriod);

        if($flush){
            $this->em->flush();
        }

        return $trainingPeriod;
    }
    //    /**
    //     * @return TrainingPeriod[] Returns an array of TrainingPeriod objects
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

    //    public function findOneBySomeField($value): ?TrainingPeriod
    //    {
    //        return $this->createQueryBuilder('t')
    //            ->andWhere('t.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
