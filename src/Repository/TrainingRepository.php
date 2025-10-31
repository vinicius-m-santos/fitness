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
         return $this->createQueryBuilder('t')
            ->where('t.client = :client')
            ->andWhere('t.personal = :personal')
            ->setParameter('client', $client)
            ->setParameter('personal', $personal)
            ->getQuery()
            ->getArrayResult();
    }
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
