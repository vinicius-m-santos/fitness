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
    public function getAll(Request $request): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $personal = $user->getPersonal();
        $personalId = $personal?->getId();
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));
        $favoritesOnly = filter_var($request->query->get('favoritesOnly', false), \FILTER_VALIDATE_BOOLEAN);
        $ownOnly = filter_var($request->query->get('ownOnly', false), \FILTER_VALIDATE_BOOLEAN);
        $search = $request->query->get('search', '');
        $order = $request->query->get('order', 'newest');
        $categoryId = $request->query->get('categoryId');
        $muscleGroupId = $request->query->get('muscleGroupId');

        $favoriteIds = $personalId !== null ? $this->exerciseRepository->getExerciseIdsFavoritedByPersonal($personalId) : [];

        [$exercises, $total] = $this->exerciseRepository->findPaginatedByUser(
            $user->getId(),
            $personalId,
            $page,
            $limit,
            $favoritesOnly,
            $favoriteIds,
            $search,
            $order,
            $ownOnly,
            $categoryId !== '' && $categoryId !== null ? (int) $categoryId : null,
            $muscleGroupId !== '' && $muscleGroupId !== null ? (int) $muscleGroupId : null
        );

        $data = [];
        foreach ($exercises as $exercise) {
            $fav = $exercise->getFavorite();
            $isFavorite = $personalId !== null && in_array($personalId, $fav, true);
            $data[] = [
                'id' => $exercise->getId(),
                'name' => trim($exercise->getName()),
                'personal' => $exercise->getPersonal() ? $exercise->getPersonal()->getId() : null,
                'exerciseCategory' => $exercise->getExerciseCategory()->getName(),
                'muscleGroup' => $exercise->getMuscleGroup()->getName(),
                'createdAt' => $exercise->getCreatedAt()->format('Y-m-d H:i:s'),
                'isStandard' => $exercise->isStandard(),
                'isFavorite' => $isFavorite,
            ];
        }

        $totalPages = (int) ceil($total / $limit);

        return new JsonResponse([
            'exercises' => $data,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => $totalPages,
        ]);
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

    #[Route('/{id}/favorite', name: 'toggle_exercise_favorite', methods: ['PATCH'])]
    public function toggleFavorite(int $id): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        try {
            $exercise = $this->exerciseService->toggleFavorite($id, $user);
            $personalId = $user->getPersonal()?->getId();
            $fav = $exercise->getFavorite();
            $isFavorite = $personalId !== null && in_array($personalId, $fav, true);
            $data = $this->normalizer->normalize($exercise, null, ['groups' => ['exercise_all']]);
            $data['isFavorite'] = $isFavorite;

            return new JsonResponse(['exercise' => $data, 'isFavorite' => $isFavorite]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
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
        if (!$exercise) {
            return new JsonResponse(['error' => 'Exercício não encontrado'], 404);
        }

        $personal = $user->getPersonal();
        $personalId = $personal?->getId();
        $canEdit = !$exercise->isStandard() && $exercise->getPersonal() && $exercise->getPersonal()->getUser()->getId() === $user->getId();
        $fav = $exercise->getFavorite();
        $isFavorite = $personalId !== null && in_array($personalId, $fav, true);

        $data = $this->normalizer->normalize($exercise, null, ['groups' => ['exercise_all']]);
        $data['isFavorite'] = $isFavorite;
        $data['isStandard'] = $exercise->isStandard();
        $data['canEdit'] = $canEdit;

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
