<?php

namespace App\Controller;

use App\Repository\ExerciseCategoryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/exercise-category')]
final class ExerciseCategoryController extends AbstractController
{
    #[Route('/all', name: 'get_all_exercise_categories', methods: ['GET'])]
    public function getAll(ExerciseCategoryRepository $exerciseCategory): JsonResponse
    {
        $categories = $exerciseCategory->findAll();

        $data = [];
        foreach ($categories as $category) {
            $data[] = [
                'id' => $category->getId(),
                'name' => $category->getName(),
            ];
        }

        return new JsonResponse(['exerciseCategories' => $data]);
    }
}
