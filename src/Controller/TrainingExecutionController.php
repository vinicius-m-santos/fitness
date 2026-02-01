<?php

namespace App\Controller;

use App\Service\TrainingExecutionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/training-execution')]
final class TrainingExecutionController extends AbstractController
{
    public function __construct(
        private readonly TrainingExecutionService $trainingExecutionService,
    ) {}

    private function getClientOrFail(): \App\Entity\Client
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user) {
            throw $this->createAccessDeniedException('Unauthorized');
        }
        $client = $user->getClient();
        if (!$client) {
            throw $this->createAccessDeniedException('Apenas alunos podem executar treinos');
        }
        return $client;
    }

    #[Route('/execution-context', name: 'training_execution_context', methods: ['GET'])]
    public function executionContext(Request $request): JsonResponse
    {
        $client = $this->getClientOrFail();
        $trainingId = $request->query->getInt('trainingId');
        $periodId = $request->query->getInt('periodId');
        if (!$trainingId || !$periodId) {
            return $this->json(['error' => 'trainingId e periodId são obrigatórios'], 400);
        }
        $context = $this->trainingExecutionService->getExecutionContext($client, $trainingId, $periodId);
        return $this->json($context);
    }

    #[Route('/start', name: 'training_execution_start', methods: ['POST'])]
    public function start(Request $request): JsonResponse
    {
        $client = $this->getClientOrFail();
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['trainingId'])) {
            return $this->json(['error' => 'trainingId é obrigatório'], 400);
        }
        $trainingId = (int) $data['trainingId'];
        $execution = $this->trainingExecutionService->start($client, $trainingId);
        return $this->json([
            'id' => $execution->getId(),
            'startedAt' => $execution->getStartedAt()->format(\DateTimeInterface::ATOM),
        ]);
    }

    #[Route('/history', name: 'training_execution_history', methods: ['GET'])]
    public function history(Request $request): JsonResponse
    {
        $client = $this->getClientOrFail();
        $limit = $request->query->getInt('limit', 30);
        $limit = min(50, max(1, $limit));
        $data = $this->trainingExecutionService->getHistoryForClient($client, $limit);
        return $this->json(['items' => $data]);
    }

    #[Route('/{id}', name: 'training_execution_get', methods: ['GET'])]
    public function getExecution(int $id): JsonResponse
    {
        $client = $this->getClientOrFail();
        $data = $this->trainingExecutionService->getExecutionForClient($client, $id);
        return $this->json($data);
    }

    #[Route('/{id}', name: 'training_execution_delete', methods: ['DELETE'])]
    public function deleteExecution(int $id): JsonResponse
    {
        $client = $this->getClientOrFail();
        $this->trainingExecutionService->deleteExecution($client, $id);
        return $this->json(['message' => 'Treino excluído']);
    }

    #[Route('/{id}/finish', name: 'training_execution_finish', methods: ['PATCH'])]
    public function finish(int $id, Request $request): JsonResponse
    {
        $client = $this->getClientOrFail();
        $data = json_decode($request->getContent(), true) ?: [];
        $rating = isset($data['rating']) && \is_string($data['rating']) ? $data['rating'] : null;
        $execution = $this->trainingExecutionService->finish($client, $id, $rating);
        return $this->json([
            'id' => $execution->getId(),
            'finishedAt' => $execution->getFinishedAt()?->format(\DateTimeInterface::ATOM),
        ]);
    }

    #[Route('/{id}/exercises', name: 'training_execution_add_exercise', methods: ['POST'])]
    public function addExercise(int $id, Request $request): JsonResponse
    {
        $client = $this->getClientOrFail();
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['periodExerciseId'])) {
            return $this->json(['error' => 'periodExerciseId é obrigatório'], 400);
        }
        $periodExerciseId = (int) $data['periodExerciseId'];
        $executionOrder = isset($data['executionOrder']) ? (int) $data['executionOrder'] : 1;
        $exerciseExecution = $this->trainingExecutionService->addExerciseExecution($client, $id, $periodExerciseId, $executionOrder);
        return $this->json([
            'id' => $exerciseExecution->getId(),
            'periodExerciseId' => $periodExerciseId,
            'executionOrder' => $exerciseExecution->getExecutionOrder(),
        ]);
    }

    #[Route('/exercise-execution/{id}/sets', name: 'training_execution_get_sets', methods: ['GET'])]
    public function getSets(int $id): JsonResponse
    {
        $client = $this->getClientOrFail();
        $sets = $this->trainingExecutionService->getSetsForExerciseExecution($client, $id);
        return $this->json(['sets' => $sets]);
    }

    #[Route('/exercise-execution/{id}/sets', name: 'training_execution_update_sets', methods: ['PATCH'])]
    public function updateSets(int $id, Request $request): JsonResponse
    {
        $client = $this->getClientOrFail();
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['sets']) || !is_array($data['sets'])) {
            return $this->json(['error' => 'sets é obrigatório e deve ser um array'], 400);
        }
        $this->trainingExecutionService->updateSets($client, $id, $data['sets']);
        return $this->json(['message' => 'Cargas atualizadas']);
    }

    #[Route('/exercise-execution/{id}/duration', name: 'training_execution_set_duration', methods: ['PATCH'])]
    public function updateDuration(int $id, Request $request): JsonResponse
    {
        $client = $this->getClientOrFail();
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['durationSeconds']) || !is_numeric($data['durationSeconds'])) {
            return $this->json(['error' => 'durationSeconds é obrigatório e deve ser um número'], 400);
        }
        $durationSeconds = (int) $data['durationSeconds'];
        if ($durationSeconds < 0) {
            return $this->json(['error' => 'durationSeconds deve ser >= 0'], 400);
        }
        $this->trainingExecutionService->setExerciseExecutionDuration($client, $id, $durationSeconds);
        return $this->json(['message' => 'Duração registrada']);
    }

    #[Route('/exercise-execution/{id}/set-rest', name: 'training_execution_set_rest', methods: ['PATCH'])]
    public function updateSetRest(int $id, Request $request): JsonResponse
    {
        $client = $this->getClientOrFail();
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['setNumber'], $data['restSeconds'])) {
            return $this->json(['error' => 'setNumber e restSeconds são obrigatórios'], 400);
        }
        $this->trainingExecutionService->updateSetRest($client, $id, (int) $data['setNumber'], (int) $data['restSeconds']);
        return $this->json(['message' => 'Descanso registrado']);
    }

    #[Route('/last-rest', name: 'training_execution_last_rest', methods: ['GET'])]
    public function lastRest(): JsonResponse
    {
        $client = $this->getClientOrFail();
        $restSeconds = $this->trainingExecutionService->getLastRestSeconds($client);
        return $this->json(['restSeconds' => $restSeconds]);
    }

    #[Route('/last-load', name: 'training_execution_last_load', methods: ['GET'])]
    public function lastLoad(Request $request): JsonResponse
    {
        $client = $this->getClientOrFail();
        $periodExerciseId = $request->query->getInt('periodExerciseId');
        if (!$periodExerciseId) {
            return $this->json(['error' => 'periodExerciseId é obrigatório'], 400);
        }
        $loadKg = $this->trainingExecutionService->getLastLoadKg($client, $periodExerciseId);
        return $this->json(['loadKg' => $loadKg]);
    }

    #[Route('/last-loads', name: 'training_execution_last_loads', methods: ['GET'])]
    public function lastLoads(Request $request): JsonResponse
    {
        $client = $this->getClientOrFail();
        $periodExerciseId = $request->query->getInt('periodExerciseId');
        if (!$periodExerciseId) {
            return $this->json(['error' => 'periodExerciseId é obrigatório'], 400);
        }
        $sets = $this->trainingExecutionService->getLastLoadsByPeriodExercise($client, $periodExerciseId);
        return $this->json(['sets' => array_values($sets)]);
    }
}
