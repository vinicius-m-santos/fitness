<?php

namespace App\Controller;

use App\Repository\PersonalRepository;
use App\Service\WeekSummaryService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/week-summary')]
final class WeekSummaryController extends AbstractController
{
    public function __construct(
        private readonly PersonalRepository $personalRepository,
        private readonly WeekSummaryService $weekSummaryService,
    ) {}

    #[Route('', name: 'week_summary', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $personal = $this->personalRepository->findOneByUserUuid($user->getUuid());
        if (!$personal) {
            return new JsonResponse(['error' => 'Personal não encontrado'], 404);
        }

        $weekStartParam = $request->query->get('weekStart');
        if (!$weekStartParam) {
            $today = new \DateTimeImmutable();
            $daysToMonday = (int) $today->format('N') - 1;
            $weekStart = $daysToMonday > 0 ? $today->modify('-' . $daysToMonday . ' days') : $today;
        } else {
            $weekStart = \DateTimeImmutable::createFromFormat('Y-m-d', $weekStartParam);
            if (!$weekStart || $weekStart->format('N') !== '1') {
                return new JsonResponse(['error' => 'weekStart deve ser uma segunda-feira (YYYY-MM-DD)'], 400);
            }
        }

        $weekStart = $weekStart->setTime(0, 0, 0);
        $data = $this->weekSummaryService->getWeekSummary($personal, $weekStart);

        return $this->json($data);
    }
}
