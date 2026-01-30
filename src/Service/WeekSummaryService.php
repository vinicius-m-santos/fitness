<?php

namespace App\Service;

use App\Entity\Personal;
use App\Repository\ClientRepository;
use App\Repository\TrainingExecutionRepository;
use App\Repository\TrainingRepository;

class WeekSummaryService
{
    private const EXPECTED_SESSIONS_PER_CLIENT_PER_WEEK = 2;
    private const ATTENDANCE_HISTORY_MONTHS = 6;
    private const NO_TRAINING_DAYS = 7;
    private const EXPIRING_DAYS = 7;

    public function __construct(
        private ClientRepository $clientRepository,
        private TrainingExecutionRepository $trainingExecutionRepository,
        private TrainingRepository $trainingRepository,
    ) {}

    /**
     * Get week summary for personal. Week starts Monday and ends Sunday.
     * weekStart must be a Monday (YYYY-MM-DD).
     */
    public function getWeekSummary(Personal $personal, \DateTimeImmutable $weekStart): array
    {
        $weekStart = $weekStart->setTime(0, 0, 0);
        $weekEnd = $weekStart->modify('+6 days')->setTime(23, 59, 59);

        $userId = $personal->getUser()->getId();
        $allClients = $this->clientRepository->findAllClientsByUserId($userId);
        $totalStudents = count($allClients);

        $activeClientIds = $this->trainingExecutionRepository->findClientIdsFinishedInWeek($personal, $weekStart, $weekEnd);
        $activeCount = count($activeClientIds);
        $activeStudents = array_values(array_filter($allClients, static fn($c) => in_array($c->getId(), $activeClientIds, true)));

        $completedInWeek = $this->trainingExecutionRepository->countFinishedInWeek($personal, $weekStart, $weekEnd);
        $expectedSessions = $totalStudents * self::EXPECTED_SESSIONS_PER_CLIENT_PER_WEEK;
        $attendancePercent = $expectedSessions > 0
            ? (int) min(100, round(($completedInWeek / $expectedSessions) * 100))
            : 0;

        $lastFinishedByClient = $this->trainingExecutionRepository->findLastFinishedAtByPersonalClients($personal->getId());
        $cutoff = (new \DateTimeImmutable())->modify('-' . self::NO_TRAINING_DAYS . ' days')->setTime(0, 0, 0);
        $noTrainingStudents = [];
        foreach ($allClients as $client) {
            $last = $lastFinishedByClient[$client->getId()] ?? null;
            if ($last === null || $last < $cutoff) {
                $noTrainingStudents[] = $client;
            }
        }
        $noTrainingCount = count($noTrainingStudents);

        $today = (new \DateTimeImmutable())->setTime(0, 0, 0);
        $expiringEnd = $today->modify('+' . self::EXPIRING_DAYS . ' days');
        $expiringTrainings = $this->trainingRepository->findExpiringBetween($personal, $today, $expiringEnd);
        $expiringList = array_map(function ($t) {
            return [
                'trainingId' => $t->getId(),
                'trainingName' => $t->getName(),
                'clientId' => $t->getClient()->getId(),
                'clientName' => $t->getClient()->getName() . ' ' . ($t->getClient()->getLastName() ?? ''),
                'dueDate' => $t->getDueDate()?->format('Y-m-d'),
            ];
        }, $expiringTrainings);
        $expiringCount = count($expiringList);

        $attendanceHistory = $this->buildAttendanceHistory($personal);

        return [
            'activeStudentsCount' => $activeCount,
            'totalStudents' => $totalStudents,
            'activeStudents' => $this->normalizeClients($activeStudents),
            'attendancePercent' => $attendancePercent,
            'attendanceHistory' => $attendanceHistory,
            'noTrainingCount' => $noTrainingCount,
            'noTrainingStudents' => $this->normalizeClients($noTrainingStudents),
            'expiringCount' => $expiringCount,
            'expiringTrainings' => $expiringList,
        ];
    }

    /**
     * Last 6 months attendance by week (percentage per week).
     *
     * @return array<int, array{weekStart: string, weekLabel: string, percentage: int}>
     */
    private function buildAttendanceHistory(Personal $personal): array
    {
        $userId = $personal->getUser()->getId();
        $allClients = $this->clientRepository->findAllClientsByUserId($userId);
        $totalStudents = count($allClients);
        $expectedPerWeek = $totalStudents * self::EXPECTED_SESSIONS_PER_CLIENT_PER_WEEK;

        $history = [];
        $end = new \DateTimeImmutable();
        $start = $end->modify('-' . self::ATTENDANCE_HISTORY_MONTHS . ' months');

        $daysToMonday = (int) $start->format('N') - 1;
        $monday = $daysToMonday > 0 ? $start->modify('-' . $daysToMonday . ' days') : $start;

        while ($monday < $end) {
            $weekStart = $monday->setTime(0, 0, 0);
            $weekEnd = $monday->modify('+6 days')->setTime(23, 59, 59);
            $completed = $this->trainingExecutionRepository->countFinishedInWeek($personal, $weekStart, $weekEnd);
            $percentage = $expectedPerWeek > 0
                ? (int) min(100, round(($completed / $expectedPerWeek) * 100))
                : 0;
            $sunday = $weekStart->modify('+6 days');
            $history[] = [
                'weekStart' => $weekStart->format('Y-m-d'),
                'weekLabel' => $weekStart->format('d/m') . ' – ' . $sunday->format('d/m'),
                'percentage' => $percentage,
            ];
            $monday = $monday->modify('+7 days');
        }

        return array_reverse($history);
    }

    /**
     * @param \App\Entity\Client[] $clients
     */
    private function normalizeClients(array $clients): array
    {
        return array_map(static function ($c) {
            return [
                'id' => $c->getId(),
                'name' => $c->getName(),
                'lastName' => $c->getLastName(),
            ];
        }, $clients);
    }
}
