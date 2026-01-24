<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Measurement;
use App\Repository\MeasurementRepository;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class MeasurementService
{
    public function __construct(
        private readonly MeasurementRepository $measurementRepository
    ) {}

    public function add(Measurement $measurement, bool $flush = true): Measurement
    {
        return $this->measurementRepository->add($measurement, $flush);
    }

    public function delete(Measurement $measurement): void
    {
        $this->measurementRepository->delete($measurement);
    }

    /**
     * @return Measurement[]
     */
    public function findByClient(int $clientId): array
    {
        return $this->measurementRepository->findByClient($clientId, ['date' => 'ASC']);
    }

    public function findById(int $id): ?Measurement
    {
        return $this->measurementRepository->find($id);
    }

    public function createMeasurement(Client $client, array $data): Measurement
    {
        if (empty($data['date'])) {
            throw new UnprocessableEntityHttpException('Data é obrigatória');
        }

        if (
            !isset($data['rightArm']) ||
            !isset($data['leftArm']) ||
            !isset($data['waist']) ||
            !isset($data['rightLeg']) ||
            !isset($data['leftLeg']) ||
            !isset($data['chest'])
        ) {
            throw new UnprocessableEntityHttpException('Todas as medidas são obrigatórias');
        }

        $measurement = new Measurement();
        $measurement->setClient($client);
        $measurement->getDataFromArray($data);

        return $this->add($measurement);
    }

    public function updateMeasurement(Measurement $measurement, array $data): Measurement
    {
        if (empty($data['date'])) {
            throw new UnprocessableEntityHttpException('Data é obrigatória');
        }

        if (
            !isset($data['rightArm']) ||
            !isset($data['leftArm']) ||
            !isset($data['waist']) ||
            !isset($data['rightLeg']) ||
            !isset($data['leftLeg']) ||
            !isset($data['chest'])
        ) {
            throw new UnprocessableEntityHttpException('Todas as medidas são obrigatórias');
        }

        $measurement->getDataFromArray($data);

        return $this->add($measurement);
    }
}
