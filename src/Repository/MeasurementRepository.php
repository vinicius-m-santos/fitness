<?php

namespace App\Repository;

use App\Entity\Measurement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Measurement>
 */
class MeasurementRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, Measurement::class);
        $this->em = $em;
    }

    public function add(Measurement $measurement, bool $flush = true): Measurement
    {
        $this->em->persist($measurement);

        if ($flush) {
            $this->em->flush();
        }

        return $measurement;
    }

    public function delete(Measurement $measurement): void
    {
        $this->em->remove($measurement);
        $this->em->flush();
    }

    /**
     * @return Measurement[]
     */
    public function findByClient(int $clientId, ?array $orderBy = null): array
    {
        $qb = $this->createQueryBuilder('m')
            ->where('m.client = :clientId')
            ->setParameter('clientId', $clientId);

        if ($orderBy) {
            foreach ($orderBy as $field => $direction) {
                $qb->addOrderBy('m.' . $field, $direction);
            }
        } else {
            $qb->orderBy('m.createdAt', 'ASC');
        }

        return $qb->getQuery()->getResult();
    }
}
