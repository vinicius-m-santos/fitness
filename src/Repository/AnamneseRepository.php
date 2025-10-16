<?php

namespace App\Repository;

use App\Entity\Anamnese;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Anamnese>
 */
class AnamneseRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, Anamnese::class);

        $this->em = $em;
    }

    public function add(Anamnese $anamnese, bool $flush = true): Anamnese
    {
        $this->em->persist($anamnese);

        if ($flush) {
            $this->em->flush();
        }

        return $anamnese;
    }

    public function delete(Anamnese $anamnese): void
    {
        $this->em->remove($anamnese);
        $this->em->flush();
    }

//    /**
//     * @return Anamnese[] Returns an array of Anamnese objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('p.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Anamnese
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
