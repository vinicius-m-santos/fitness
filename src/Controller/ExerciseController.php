<?php

namespace App\Controller;

use App\Repository\ExerciseRepository;
use App\Repository\PersonalRepository;
use App\Repository\TrainingRepository;
use App\Service\ExerciseService;
use App\Service\TrainingService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

#[Route('/api/exercise')]
final class ExerciseController extends AbstractController
{
    public function __construct(
        private readonly PersonalRepository $personalRepository,
        private readonly ExerciseRepository $exerciseRepository,
        private readonly ExerciseService $exerciseService,
        private readonly NormalizerInterface $normalizer,
    ) {}

    #[Route('/all', name: 'get_all_exercises', methods: ['GET'])]
    public function getAll(ExerciseRepository $exerciseRepository): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $exercises = $exerciseRepository->findAllWithRelationsByUser($user->getId());

        $data = [];
        foreach ($exercises as $exercise) {
            $data[] = [
                'id' => $exercise->getId(),
                'name' => $exercise->getName(),
                'personal' => $exercise->getPersonal() ? $exercise->getPersonal()->getId() : null,
                'exerciseCategory' => $exercise->getExerciseCategory()->getName(),
                'createdAt' => $exercise->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }

        return new JsonResponse(['exercises' => $data]);
    }

    #[Route('/create', name: 'create_exercise', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);

        try {
            $exercise = $this->exerciseService->createExercise($user, $data);
            $normalizedData = $this->normalizer->normalize($exercise, 'json', ['groups' => ['exercise_all']]);

            return new JsonResponse([
                'message' => 'Exercício criado com sucesso',
                'exercise' => $normalizedData
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 409);
        }
    }

    #[Route('/{id}', name: 'delete_exercise', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        try {
            $this->exerciseService->deleteExercise($id, $user);

            return new JsonResponse([
                'message' => 'Exercício deletado com sucesso'
            ], 200);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage()
            ], 400);
        }
    }

    #[Route('/{id}', name: 'get_exercise', methods: ['GET'])]
    public function edit(int $id): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $exercise = $this->exerciseRepository->find($id);

        if (!$exercise || $exercise->getPersonal()->getUser()->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Exercício não encontrado'], 404);
        }

        $data = $this->normalizer->normalize($exercise, null, ['groups' => ['exercise_all']]);

        return new JsonResponse(['exercise' => $data]);
    }

    #[Route('/{id}', name: 'update_exercise', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);

        try {
            $exercise = $this->exerciseService->updateExercise($user, $id, $data);
            $normalizedData = $this->normalizer->normalize($exercise, null, ['groups' => ['exercise_all']]);

            return new JsonResponse([
                'message' => 'Exercício atualizado com sucesso',
                'exercise' => $normalizedData
            ], 200);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 409);
        }
    }

    #[Route('/default/{id}', name: 'delete_default_exercise', methods: ['DELETE'])]
    public function deleteDefault(int $id): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        try {
            $this->exerciseService->deleteDefaultExercise($id, $user);

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
