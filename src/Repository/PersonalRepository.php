<?php

namespace App\Repository;

use App\Entity\Company;
use App\Entity\Personal;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Personal>
 */
class PersonalRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, Personal::class);
        $this->em = $em;
    }

    public function add(Personal $personal, bool $flush = true): void
    {
        $this->em->persist($personal);

        if ($flush) {
            $this->em->flush();
        }
    }

    public function findById(int $id): Personal|null
    {
        return $this->createQueryBuilder('u')
            ->where('u.id = :personal_id')
            ->setParameter('personal_id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findOneByUserUuid(string $uuid): mixed
    {
        return $this->createQueryBuilder('p')
            ->innerJoin('p.user', 'u')
            ->where('u.uuid = :uuid')
            ->setParameter('uuid', $uuid)
            ->getQuery()
            ->getOneOrNullResult();
    }

//    /**
//     * @return Personal[] Returns an array of Personal objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('u')
//            ->andWhere('u.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('u.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Personal
//    {
//        return $this->createQueryBuilder('u')
//            ->andWhere('u.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
