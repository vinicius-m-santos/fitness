<?php

namespace App\Service;

use App\Entity\Exercise;
use App\Repository\ExerciseRepository;
use App\Repository\ExerciseCategoryRepository;
use App\Repository\MuscleGroupRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Personal;
use App\Entity\User;
use App\Repository\PeriodExerciseRepository;
use App\Repository\PersonalRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ExerciseService
{
    public function __construct(
        private ExerciseRepository $exerciseRepository,
        private PersonalRepository $personalRepository,
        private ExerciseCategoryRepository $exerciseCategoryRepository,
        private MuscleGroupRepository $muscleGroupRepository,
        private EntityManagerInterface $em,
        private PeriodExerciseRepository $periodExerciseRepository,
    ) {}

    public function createExercise(User $user, array $data): Exercise
    {
        $personal = $user->getPersonal();
        if (!$personal) {
            throw new UnprocessableEntityHttpException("Personal não encontrado");
        }

        $exerciseName = trim($data['name'] ?? '');
        if (!$exerciseName) {
            throw new UnprocessableEntityHttpException("Necessário preencher o nome do exercício");
        }

        if (mb_strlen($exerciseName) > 50) {
            throw new UnprocessableEntityHttpException("O nome do exercício não pode exceder 50 caracteres");
        }

        $categoryId = $data['exerciseCategoryId'] ?? null;
        if (!$categoryId) {
            throw new UnprocessableEntityHttpException("Necessário preencher a categoria do exercício");
        }

        $category = $this->exerciseCategoryRepository->find($categoryId);
        if (!$category) {
            throw new UnprocessableEntityHttpException('Categoria não encontrada.');
        }

        $muscleGroupId = $data['muscleGroupId'] ?? null;
        if (!$muscleGroupId) {
            throw new UnprocessableEntityHttpException("Necessário preencher o grupo muscular do exercício");
        }

        $muscleGroup = $this->muscleGroupRepository->find($muscleGroupId);
        if (!$muscleGroup) {
            throw new UnprocessableEntityHttpException('Grupo muscular não encontrado.');
        }

        $existing = $this->exerciseRepository->findOneBy([
            'name' => $exerciseName,
            'personal' => $personal
        ]);
        if ($existing) {
            throw new UnprocessableEntityHttpException('Já existe um exercício com esse nome.');
        }

        $exercise = new Exercise();
        $exercise->setName($exerciseName);
        $exercise->setExerciseCategory($category);
        $exercise->setMuscleGroup($muscleGroup);
        $exercise->setPersonal($personal);
        $exercise->setIsStandard(false);

        $favorite = !empty($data['favorite']);
        if ($favorite) {
            $exercise->setFavorite([$personal->getId()]);
        }

        $this->exerciseRepository->add($exercise, true);

        return $exercise;
    }


    public function deleteExercise(int $exerciseId, User $user): void
    {
        $personal = $this->personalRepository->findOneBy(['user' => $user]);
        if (!$personal) {
            throw new \Exception('Personal não encontrado.');
        }

        $exercise = $this->exerciseRepository->find($exerciseId);
        if (!$exercise) {
            throw new UnprocessableEntityHttpException('Exercício não encontrado.');
        }

        if ($exercise->isStandard()) {
            throw new UnprocessableEntityHttpException('Não é permitido excluir exercícios padrão.');
        }

        if ($exercise->getPersonal()?->getId() !== $personal->getId()) {
            throw new UnprocessableEntityHttpException('Exercício não encontrado.');
        }

        $hasRelations = $this->periodExerciseRepository->findOneBy(['exercise' => $exercise]);

        if ($hasRelations) {
            throw new UnprocessableEntityHttpException('O exercício está cadastrado a um treino.');
        }

        $this->em->remove($exercise);
        $this->em->flush();
    }

    public function deleteDefaultExercise(int $exerciseId, User $user): void
    {
        $personal = $this->personalRepository->findOneBy(['user' => $user]);
        if (!$personal) {
            throw new \Exception('Personal não encontrado.');
        }

        $exercise = $this->exerciseRepository->findOneBy([
            'id' => $exerciseId
        ]);

        if (!$exercise) {
            throw new \Exception('Exercício não encontrado.');
        }

        $hasRelations = $this->periodExerciseRepository->findOneBy(['exercise' => $exercise]);

        if ($hasRelations) {
            throw new \Exception('O exercício está cadastrado a um treino.');
        }

        $defaults = $personal->getDefaultExercises() ?? [];

        if (!in_array($exerciseId, $defaults, true)) {
            $defaults[] = $exerciseId;
            $personal->setDefaultExercises($defaults);
        }

        $this->em->persist($personal);
        $this->em->flush();
    }

    public function updateExercise(User $user, int $id, array $data): Exercise
    {
        $personal = $this->personalRepository->findOneBy(['user' => $user]);
        if (!$personal) {
            throw new \Exception('Personal não encontrado.');
        }

        $exerciseName = trim($data['name'] ?? '');
        if (!$exerciseName) {
            throw new UnprocessableEntityHttpException('Necessário preencher o nome do exercício.');
        }

        if (mb_strlen($exerciseName) > 50) {
            throw new UnprocessableEntityHttpException('O nome do exercício não pode exceder 50 caracteres.');
        }

        if (empty($data['category'])) {
            throw new UnprocessableEntityHttpException('Necessário preencher a categoria do exercício.');
        }

        $category = $this->exerciseCategoryRepository->find($data['category']);
        if (!$category) {
            throw new UnprocessableEntityHttpException('Categoria não encontrada.');
        }

        if (empty($data['muscleGroup'])) {
            throw new UnprocessableEntityHttpException('Necessário preencher o grupo muscular do exercício.');
        }

        $muscleGroup = $this->muscleGroupRepository->find($data['muscleGroup']);
        if (!$muscleGroup) {
            throw new UnprocessableEntityHttpException('Grupo muscular não encontrado.');
        }

        $existing = $this->exerciseRepository->findOneBy([
            'name' => $exerciseName,
            'personal' => $personal
        ]);
        if ($existing && $existing->getId() !== $id) {
            throw new UnprocessableEntityHttpException('Já existe um exercício com esse nome.');
        }

        $exercise = $this->exerciseRepository->find($id);
        if (!$exercise) {
            throw new UnprocessableEntityHttpException('Exercício não encontrado.');
        }

        if ($exercise->isStandard()) {
            throw new UnprocessableEntityHttpException('Não é permitido editar exercícios padrão.');
        }

        if ($exercise->getPersonal()?->getUser()->getId() !== $user->getId()) {
            throw new UnprocessableEntityHttpException('Exercício não encontrado.');
        }

        $exercise->setName($exerciseName);
        $exercise->setExerciseCategory($category);
        $exercise->setMuscleGroup($muscleGroup);

        if (isset($data['favorite'])) {
            $favoriteIds = $exercise->getFavorite();
            $personalId = $personal->getId();
            if ($data['favorite']) {
                if (!in_array($personalId, $favoriteIds, true)) {
                    $favoriteIds[] = $personalId;
                    $exercise->setFavorite($favoriteIds);
                }
            } else {
                $exercise->setFavorite(array_values(array_filter($favoriteIds, fn($id) => $id !== $personalId)));
            }
        }

        $this->exerciseRepository->add($exercise, true);

        return $exercise;
    }

    public function toggleFavorite(int $exerciseId, User $user): Exercise
    {
        $personal = $this->personalRepository->findOneBy(['user' => $user]);
        if (!$personal) {
            throw new \Exception('Personal não encontrado.');
        }

        $exercise = $this->exerciseRepository->find($exerciseId);
        if (!$exercise) {
            throw new UnprocessableEntityHttpException('Exercício não encontrado.');
        }

        $favoriteIds = $exercise->getFavorite();
        $personalId = $personal->getId();
        $idx = array_search($personalId, $favoriteIds, true);
        if ($idx !== false) {
            unset($favoriteIds[$idx]);
            $exercise->setFavorite(array_values($favoriteIds));
        } else {
            $favoriteIds[] = $personalId;
            $exercise->setFavorite($favoriteIds);
        }

        $this->exerciseRepository->add($exercise, true);
        return $exercise;
    }
}
