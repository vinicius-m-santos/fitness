<?php

namespace App\Service;

use App\Entity\Exercise;
use App\Repository\ExerciseRepository;
use App\Repository\ExerciseCategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Personal;
use App\Entity\User;
use App\Repository\PersonalRepository;

class ExerciseService
{
    public function __construct(
        private ExerciseRepository $exerciseRepository,
        private PersonalRepository $personalRepository,
        private ExerciseCategoryRepository $exerciseCategoryRepository,
        private EntityManagerInterface $em
    ) {}

    public function createExercise(string $name, int $categoryId, Personal $personal): Exercise
    {
        $existing = $this->exerciseRepository->findOneBy([
            'name' => $name,
            'personal' => $personal
        ]);

        if ($existing) {
            throw new \Exception('Já existe um exercício com esse nome.');
        }

        $category = $this->exerciseCategoryRepository->find($categoryId);
        if (!$category) {
            throw new \Exception('Categoria não encontrada.');
        }

        $exercise = new Exercise();
        $exercise->setName($name);
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

        $this->em->remove($exercise);
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
