<?php

namespace App\DataFixtures;

use App\Entity\Exercise;
use App\Repository\ExerciseCategoryRepository;
use App\Repository\MuscleGroupRepository;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ExerciseFixture extends Fixture
{
    private const CATEGORY_MAPPING = [
        1 => 1,
        2 => 2,
        3 => 3,
        4 => 4,
        5 => 5,
        6 => 6,
        7 => 7,
        8 => 8,
        9 => 9,
    ];

    private const MUSCLE_GROUP_MAPPING = [
        7 => 1,
        9 => 2,
        14 => 3,
        8 => 4,
        3 => 5,
        2 => 6,
        5947 => 7,
        11 => 8,
        5 => 9,
        22037 => 10,
        8283 => 11,
        5448 => 12,
        6 => 13,
        12 => 14,
        5375 => 15,
        1 => 16,
        4 => 17,
    ];

    public function __construct(
        private ExerciseCategoryRepository $categoryRepository,
        private MuscleGroupRepository $muscleGroupRepository
    ) {}

    public function load(ObjectManager $manager): void
    {
        $path = __DIR__ . '/../../assets/seeds/exercises.json';

        if (!file_exists($path)) {
            throw new \RuntimeException('Arquivo de seed não encontrado');
        }

        $data = json_decode(file_get_contents($path), true);

        foreach ($data['items'] as $item) {
            $category = $this->categoryRepository->findOneBy([
                'id' => self::CATEGORY_MAPPING[$item['category']],
            ]);

            $muscleGroup = $this->muscleGroupRepository->findOneBy([
                'id' => self::MUSCLE_GROUP_MAPPING[$item['group']],
            ]);

            if (!$category || !$muscleGroup) {
                continue; // ou loga erro
            }

            // Evita duplicar
            $exists = $manager->getRepository(Exercise::class)
                ->findOneBy([
                    'name' => $item['nome'],
                    'exerciseCategory' => $category,
                    'muscleGroup' => $muscleGroup,
                ]);

            if ($exists) {
                continue;
            }

            $exercise = new Exercise();
            $exercise->setName($item['nome']);
            $exercise->setExerciseCategory($category);
            $exercise->setMuscleGroup($muscleGroup);
            $exercise->setIsStandard(true);

            $manager->persist($exercise);
        }

        $manager->flush();
    }
}
