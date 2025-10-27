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

        if (!$data['name'] || !$data['exerciseCategoryId']) {
            throw new UnprocessableEntityHttpException("Necessário preencher todos os campos");
        }

        $existing = $this->exerciseRepository->findOneBy([
            'name' => $data['name'],
            'personal' => $personal
        ]);

        if ($existing) {
            throw new \Exception('Já existe um exercício com esse nome.');
        }

        $category = $this->exerciseCategoryRepository->find($data['exerciseCategoryId']);
        if (!$category) {
            throw new \Exception('Categoria não encontrada.');
        }

        $exercise = new Exercise();
        $exercise->setName($data['name']);
        $exercise->setExerciseCategory($category);
        $exercise->setPersonal($personal);

        $this->em->persist($exercise);
        $this->em->flush();

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

    public function updateExercise(Exercise $exercise, string $name, int $categoryId): Exercise
    {
        $exercise->setName($name);

        $category = $this->exerciseCategoryRepository->find($categoryId);
        if (!$category) {
            throw new \Exception('Categoria não encontrada');
        }

        $exercise->setExerciseCategory($category);

        $this->em->persist($exercise);
        $this->em->flush();

        return $exercise;
    }
}
