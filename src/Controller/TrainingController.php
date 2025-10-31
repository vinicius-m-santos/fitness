<?php

namespace App\Controller;

use App\Repository\ExerciseRepository;
use App\Repository\PersonalRepository;
use App\Repository\TrainingRepository;
use App\Service\TrainingService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

#[Route('/api/training')]
final class TrainingController extends AbstractController
{
    public function __construct(
        private readonly PersonalRepository $personalRepository,
        private readonly ExerciseRepository $exerciseRepository,
        private readonly TrainingService $trainingService,
        private readonly NormalizerInterface $normalizer,
        private readonly TrainingRepository $trainingRepository,
    ) {}

    #[Route('/create', name: 'create_training', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['name'], $data['client'], $data['periods'])) {
            return $this->json(['error' => 'Dados inválidos'], 400);
        }

        $training = $this->trainingService->createTraining($user, $data);
        $normalizedData = $this->normalizer->normalize($training, 'json', ['groups' => ['training_client']]);

        return $this->json($normalizedData);
    }

    #[Route('/{id}', name: 'update_training', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);

        try {
            $this->trainingService->updateTraining($user, $data, $id);
            return new JsonResponse(['message' => 'Treino atualizado com sucesso']);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/all/{clientId}', name: 'get_all_trainings', methods: ['GET'])]
    public function getAllTrainings(int $clientId): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $trainings = $this->trainingService->getTrainingsByClient($clientId, $user->getId());

        // $normalized = $this->normalizer->normalize($trainings, 'json', [
        //     'groups' => ['training_client']
        // ]);
        $data = $this->trainingRepository->createQueryBuilder('t')
                ->select('t.id', 't.name')
                ->setMaxResults(5)
                ->getQuery()
                ->getArrayResult();

            return new JsonResponse([
                'count' => count($data),
                'data' => $data,
            ]);
        return $this->json(['trainings' => $trainings]);
    }

    #[Route('/{id}', name: 'delete_training', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        try {
            $this->trainingService->deleteTraining($id, $user);

            return new JsonResponse([
                'message' => 'Exercício deletado com sucesso'
            ], 200);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
