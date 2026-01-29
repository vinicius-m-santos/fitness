<?php

namespace App\Repository;

use App\Entity\Personal;
use App\Entity\Training;
use App\Entity\TrainingStandard;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<TrainingStandard> */
class TrainingStandardRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry, private EntityManagerInterface $em)
    {
        parent::__construct($registry, TrainingStandard::class);
    }

    public function add(TrainingStandard $entity, bool $flush = true): TrainingStandard
    {
        $this->em->persist($entity);
        if ($flush) {
            $this->em->flush();
        }
        return $entity;
    }

    /** @return TrainingStandard[] */
    public function findWithRelationsByPersonal(Personal $personal): array
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.periods', 'p')->addSelect('p')
            ->leftJoin('p.periodExercises', 'pe')->addSelect('pe')
            ->leftJoin('pe.exercise', 'e')->addSelect('e')
            ->where('t.personal = :personal')
            ->setParameter('personal', $personal)
            ->orderBy('t.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findOneWithRelationsByPersonal(int $id, Personal $personal): ?TrainingStandard
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

    public function findOneByTraining(Training $training): ?TrainingStandard
    {
        return $this->createQueryBuilder('t')
            ->where('t.training = :training')
            ->setParameter('training', $training)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Busca um treino padrão por id e personal, com a relação training já carregada.
     */
    public function findOneWithTrainingByPersonal(int $id, Personal $personal): ?TrainingStandard
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.training', 'tr')->addSelect('tr')
            ->where('t.personal = :personal')
            ->andWhere('t.id = :id')
            ->setParameter('personal', $personal)
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
