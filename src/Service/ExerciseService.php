<?php

namespace App\Service;

use App\Entity\Exercise;
use App\Repository\ExerciseRepository;
use App\Repository\ExerciseCategoryRepository;
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
        private EntityManagerInterface $em,
        private PeriodExerciseRepository $periodExerciseRepository,
    ) {}

    public function createExercise(User $user, array $data): Exercise
    {
        $personal = $user->getPersonal();
        if (!$personal) {
            throw new UnprocessableEntityHttpException("Personal não encontrado");
        }

        $exerciseName = $data['name'];
        if (!$exerciseName) {
            throw new UnprocessableEntityHttpException("Necessário preencher o nome do exercício");
        }

        $categoryId = $data['exerciseCategoryId'];
        if (!$categoryId) {
            throw new UnprocessableEntityHttpException("Necessário preencher a categoria do exercício");
        }

        $existing = $this->exerciseRepository->findOneBy([
            'name' => $exerciseName,
            'personal' => $personal
        ]);

        if ($existing) {
            throw new UnprocessableEntityHttpException('Já existe um exercício com esse nome.');
        }

        $category = $this->exerciseCategoryRepository->find($categoryId);
        if (!$category) {
            throw new UnprocessableEntityHttpException('Categoria não encontrada.');
        }

        $exercise = new Exercise();
        $exercise->setName($exerciseName);
        $exercise->setExerciseCategory($category);
        $exercise->setPersonal($personal);

        $this->exerciseRepository->add($exercise, true);

        return $exercise;
    }

    public function deleteExercise(int $exerciseId, User $user): void
    {
        $personal = $this->personalRepository->findOneBy(['user' => $user]);
        if (!$personal) {
            throw new \Exception('Personal não encontrado.');
        }

        $exercise = $this->exerciseRepository->findOneBy([
            'id' => $exerciseId,
            'personal' => $personal
        ]);

        if (!$exercise) {
            throw new \Exception('Exercício não encontrado.');
        }

        $hasRelations = $this->periodExerciseRepository->findOneBy(['exercise' => $exercise]);

        if ($hasRelations) {
            throw new \Exception('O exercício está cadastrado a um treino.');
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

        $exerciseName = $data['name'];
        if (!$exerciseName) {
            throw new UnprocessableEntityHttpException('Necessário preencher o nome do exercício');
        }

        $category = $data['category'];
        if (!$category) {
            throw new UnprocessableEntityHttpException('Necessário preencher a categoria do exercício');
        }

        $existing = $this->exerciseRepository->findOneBy([
            'name' => $exerciseName,
            'personal' => $personal
        ]);

        if ($existing) {
            throw new UnprocessableEntityHttpException('Já existe um exercício com esse nome.');
        }

        $exercise = $this->exerciseRepository->find($id);
        if (!$exercise || $exercise->getPersonal()->getUser()->getId() !== $user->getId()) {
            throw new UnprocessableEntityHttpException('Exercício não encontrado');
        }

        $category = $this->exerciseCategoryRepository->find($data['category']);
        if (!$category) {
            throw new UnprocessableEntityHttpException('Categoria não encontrada');
        }

        $exercise->setName($exerciseName);
        $exercise->setExerciseCategory($category);
        $this->exerciseRepository->add($exercise, true);

        return $exercise;
    }
}
