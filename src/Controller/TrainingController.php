<?php

namespace App\Controller;

use App\Entity\Client;
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

    #[Route('/apply', name: 'training_apply', methods: ['POST'])]
    public function apply(Request $request): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['trainingId'], $data['clientIds']) || !is_array($data['clientIds'])) {
            return $this->json(['error' => 'Dados inválidos. Envie trainingId e clientIds.'], 400);
        }

        $trainingId = (int) $data['trainingId'];
        $clientIds = array_map('intval', array_values($data['clientIds']));
        $dueDate = isset($data['dueDate']) && $data['dueDate'] !== ''
            ? new \DateTimeImmutable($data['dueDate']) : null;

        try {
            $this->trainingService->copyToClients($user, $trainingId, $clientIds, $dueDate);
            return $this->json(['message' => 'Treino aplicado com sucesso']);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }

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

    #[Route('/student-context', name: 'get_student_context', methods: ['GET'])]
    public function getStudentContext(): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        $client = $user->getClient();
        if (!$client) {
            return new JsonResponse(['error' => 'Cliente não encontrado'], 403);
        }
        $personal = $this->personalRepository->findById($client->getPersonal()->getId());
        if (!$personal) {
            return new JsonResponse(['error' => 'Personal não encontrado'], 404);
        }
        $context = $this->trainingService->getStudentContext($client, $personal);
        return $this->json($context);
    }

    #[Route('/detail/{id}', name: 'get_training_detail', methods: ['GET'])]
    public function getTrainingDetail(int $id): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }
        $client = $user->getClient();
        if (!$client) {
            return new JsonResponse(['error' => 'Cliente não encontrado'], 403);
        }
        $personal = $this->personalRepository->findById($client->getPersonal()->getId());
        if (!$personal) {
            return new JsonResponse(['error' => 'Personal não encontrado'], 404);
        }
        $training = $this->trainingService->getTrainingByIdForClient($client, $personal, $id);
        if (!$training) {
            return new JsonResponse(['error' => 'Treino não encontrado'], 404);
        }
        return $this->json($training);
    }

    #[Route('/all/{client}', name: 'get_all_trainings', methods: ['GET'])]
    public function getAllTrainings(Client $client): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $personal = $this->personalRepository->findOneByUserUuid($user->getUuid());

        if (!$personal && $user->getId() !== $client->getUser()->getId()) {
            return new JsonResponse(['error' => 'Personal não encontrado'], 404);
        }

        $personal = $client->getPersonal();

        if (!$personal) {
            return new JsonResponse(['error' => 'Personal não encontrado'], 404);
        }

        $trainings = $this->trainingService->getTrainingsByClient($client, $personal);

        $normalized = $this->normalizer->normalize($trainings, 'json', [
            'groups' => ['training_client']
        ]);
        // $data = $this->trainingRepository->createQueryBuilder('t')
        //         ->select('t.id', 't.name')
        //         ->setMaxResults(5)
        //         ->getQuery()
        //         ->getArrayResult();

        // return new JsonResponse([
        //     'count' => count($trainings),
        //     'data' => $trainings,
        // ]);
        return $this->json(['trainings' => $normalized]);
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
