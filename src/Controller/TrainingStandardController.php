<?php

namespace App\Controller;

use App\Repository\PersonalRepository;
use App\Service\TrainingStandardService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/training-standard')]
final class TrainingStandardController extends AbstractController
{
    public function __construct(
        private readonly PersonalRepository $personalRepo,
        private readonly TrainingStandardService $service,
    ) {}

    #[Route('/all', name: 'training_standard_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $personal = $this->personalRepo->findOneByUserUuid($user->getUuid());
        if (!$personal) {
            return new JsonResponse(['error' => 'Personal não encontrado'], 404);
        }

        $trainings = $this->service->listByPersonal($personal);
        return $this->json(['trainings' => $trainings]);
    }

    #[Route('/create', name: 'training_standard_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['name'], $data['periods'])) {
            return $this->json(['error' => 'Dados inválidos'], 400);
        }

        try {
            $this->service->create($user, $data);
            return $this->json(['message' => 'Treino padrão criado com sucesso']);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/from-training', name: 'training_standard_from_training', methods: ['POST'])]
    public function fromTraining(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['trainingId'])) {
            return $this->json(['error' => 'Dados inválidos. Envie trainingId.'], 400);
        }

        $trainingId = (int) $data['trainingId'];

        try {
            $this->service->createFromTraining($user, $trainingId);
            return $this->json(['message' => 'Treino padrão criado com sucesso']);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/by-training/{trainingId}', name: 'training_standard_delete_by_training', methods: ['DELETE'])]
    public function deleteByTraining(int $trainingId): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        try {
            $this->service->deleteByTraining($user, $trainingId);
            return $this->json(['message' => 'Treino padrão excluído com sucesso']);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/apply', name: 'training_standard_apply', methods: ['POST'])]
    public function apply(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['trainingStandardId'], $data['clientIds'])
            || !is_array($data['clientIds'])) {
            return $this->json(['error' => 'Dados inválidos. Envie trainingStandardId e clientIds.'], 400);
        }

        $trainingStandardId = (int) $data['trainingStandardId'];
        $clientIds = array_map('intval', array_values($data['clientIds']));
        $dueDate = isset($data['dueDate']) && $data['dueDate'] !== ''
            ? new \DateTimeImmutable($data['dueDate']) : null;

        try {
            $this->service->applyToClients($user, $trainingStandardId, $clientIds, $dueDate);
            return $this->json(['message' => 'Treino aplicado com sucesso']);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/{id}', name: 'training_standard_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['name'], $data['periods'])) {
            return $this->json(['error' => 'Dados inválidos'], 400);
        }

        try {
            $this->service->update($user, $id, $data);
            return $this->json(['message' => 'Treino padrão atualizado com sucesso']);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }

    #[Route('/{id}', name: 'training_standard_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        try {
            $this->service->delete($user, $id);
            return $this->json(['message' => 'Treino padrão excluído com sucesso']);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }
}
