<?php

namespace App\Controller;

use App\Entity\Client;
use App\Entity\Measurement;
use App\Repository\ClientRepository;
use App\Service\MeasurementService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/measurement')]
class MeasurementController extends AbstractController
{
    public function __construct(
        private readonly ValidatorInterface $validator,
        private readonly NormalizerInterface $normalizer,
        private readonly MeasurementService $measurementService,
        private readonly ClientRepository $clientRepository
    )
    {
    }

    #[Route('/client/{id}', name: 'measurement_get_by_client', methods: ['GET'])]
    public function getByClient(Client $client): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Usuário não encontrado');
        }

        $measurements = $this->measurementService->findByClient($client->getId());

        $normalizedData = $this->normalizer->normalize($measurements, 'json', ['groups' => ['measurement_all']]);

        return new JsonResponse([
            'success' => true,
            'data' => $normalizedData
        ], 200);
    }

    #[Route('/client/{id}', name: 'measurement_create_by_client', methods: ['POST'])]
    public function createByClient(Client $client, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Usuário não encontrado');
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            throw new UnprocessableEntityHttpException('Dados inválidos');
        }

        $measurement = $this->measurementService->createMeasurement($client, $data);

        $errors = $this->validator->validate($measurement);
        if (count($errors) > 0) {
            throw new UnprocessableEntityHttpException($errors[0]->getMessage());
        }

        $normalizedData = $this->normalizer->normalize($measurement, 'json', ['groups' => ['measurement_all']]);

        return new JsonResponse([
            'success' => true,
            'data' => $normalizedData
        ], 201);
    }

    #[Route('/{id}', name: 'measurement_update', methods: ['PUT'])]
    public function update(Measurement $measurement, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Usuário não encontrado');
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            throw new UnprocessableEntityHttpException('Dados inválidos');
        }

        $measurement = $this->measurementService->updateMeasurement($measurement, $data);

        $errors = $this->validator->validate($measurement);
        if (count($errors) > 0) {
            throw new UnprocessableEntityHttpException($errors[0]->getMessage());
        }

        $normalizedData = $this->normalizer->normalize($measurement, 'json', ['groups' => ['measurement_all']]);

        return new JsonResponse([
            'success' => true,
            'data' => $normalizedData
        ], 200);
    }

    #[Route('/{id}', name: 'measurement_delete', methods: ['DELETE'])]
    public function delete(Measurement $measurement): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Usuário não encontrado');
        }

        $this->measurementService->delete($measurement);

        return new JsonResponse([
            'success' => true,
            'message' => 'Medição excluída com sucesso'
        ], 200);
    }
}
