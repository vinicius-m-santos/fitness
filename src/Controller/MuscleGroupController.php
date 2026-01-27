<?php

namespace App\Controller;

use App\Repository\MuscleGroupRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/muscle-group')]
final class MuscleGroupController extends AbstractController
{
    #[Route('/all', name: 'get_all_muscle_groups', methods: ['GET'])]
    public function getAll(MuscleGroupRepository $muscleGroupRepository): JsonResponse
    {
        $muscleGroups = $muscleGroupRepository->findAll();

        $data = [];
        foreach ($muscleGroups as $muscleGroup) {
            $data[] = [
                'id' => $muscleGroup->getId(),
                'name' => $muscleGroup->getName(),
            ];
        }

        return new JsonResponse(['muscleGroups' => $data]);
    }
}
