<?php

namespace App\Service;

use App\Entity\Personal;
use App\Repository\ClientRepository;
use App\Repository\TrainingExecutionRepository;
use App\Repository\TrainingRepository;

class WeekSummaryService
{
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

        // Apenas alunos que já existiam no fim da semana selecionada (cadastro até weekEnd)
        $clientsInWeek = array_values(array_filter($allClients, static fn($c) => $c->getCreatedAt() <= $weekEnd));
        $totalStudents = count($clientsInWeek);

        // Treino ativo por aluno = último criado até weekEnd (apenas esse entra nos cálculos)
        $clientIds = array_map(static fn($c) => $c->getId(), $clientsInWeek);
        $activeByClient = $this->trainingRepository->findActiveTrainingWithPeriodCountByClientAsOf(
            $personal->getId(),
            $clientIds,
            $weekEnd
        );
        $activePairs = [];
        $activeMap = [];
        $totalExpectedPeriods = 0;
        foreach ($activeByClient as $cid => $data) {
            $activePairs[] = [$cid, $data['trainingId']];
            $activeMap[$cid] = $data['trainingId'];
            $totalExpectedPeriods += $data['periodCount'];
        }

        $activeClientIds = $this->trainingExecutionRepository->findClientIdsFinishedInWeek($personal, $weekStart, $weekEnd, $activePairs);
        $activeCount = count($activeClientIds);
        $activeStudents = array_values(array_filter($clientsInWeek, static fn($c) => in_array($c->getId(), $activeClientIds, true)));

        // Assiduidade = % de alunos que treinaram na semana (em relação aos que existiam na semana)
        $attendancePercent = $totalStudents > 0
            ? (int) min(100, round(($activeCount / $totalStudents) * 100))
            : 0;

        // Sem treino: naquela semana, alunos que existiam e não tinham treinado nos últimos 7 dias (até weekEnd) — só treino ativo
        $lastFinishedByClient = $this->trainingExecutionRepository->findLastFinishedAtByPersonalClientsBeforeOrOn(
            $personal->getId(),
            $weekEnd,
            $activeMap
        );
        $cutoff = $weekEnd->modify('-' . self::NO_TRAINING_DAYS . ' days')->setTime(0, 0, 0);
        $noTrainingStudents = [];
        foreach ($clientsInWeek as $client) {
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

        $periodDistribution = $this->trainingExecutionRepository->countExecutionsByPeriodInWeek($personal, $weekStart, $weekEnd, $activePairs);
        $totalExecutions = array_sum(array_column($periodDistribution, 'count'));
        $periodDistributionWithRelative = array_map(static function (array $row) use ($totalExecutions) {
            $row['relativePercent'] = $totalExecutions > 0
                ? (int) round(($row['count'] / $totalExecutions) * 100)
                : 0;
            return $row;
        }, $periodDistribution);

        // Frequência média: esperado = soma dos períodos do treino ativo; realizado = execuções (treino ativo) na semana
        $realizedCount = $this->trainingExecutionRepository->countFinishedInWeek($personal, $weekStart, $weekEnd, $activePairs);
        $expectedPerStudent = $totalStudents > 0 ? $totalExpectedPeriods / $totalStudents : 0;
        $realizedPerStudent = $totalStudents > 0 ? $realizedCount / $totalStudents : 0;
        $frequencyStatus = $expectedPerStudent > 0 && $realizedPerStudent >= $expectedPerStudent ? 'within' : 'below';

        // Tempo médio de treino na semana (só treino ativo) e comparação com semana anterior
        $durationCurrent = $this->trainingExecutionRepository->getAverageExecutionDurationInWeek($personal, $weekStart, $weekEnd, $activePairs);
        $prevWeekStart = $weekStart->modify('-7 days')->setTime(0, 0, 0);
        $prevWeekEnd = $weekEnd->modify('-7 days')->setTime(23, 59, 59);
        $clientIdsPrev = array_map(static fn($c) => $c->getId(), array_values(array_filter($allClients, static fn($c) => $c->getCreatedAt() <= $prevWeekEnd)));
        $activeByClientPrev = $this->trainingRepository->findActiveTrainingWithPeriodCountByClientAsOf($personal->getId(), $clientIdsPrev, $prevWeekEnd);
        $activePairsPrev = [];
        foreach ($activeByClientPrev as $cid => $data) {
            $activePairsPrev[] = [$cid, $data['trainingId']];
        }
        $durationPrev = $this->trainingExecutionRepository->getAverageExecutionDurationInWeek($personal, $prevWeekStart, $prevWeekEnd, $activePairsPrev);
        $avgMinutesCurrent = $durationCurrent['count'] > 0 ? (int) round($durationCurrent['totalSeconds'] / 60) : 0;
        $avgMinutesPrev = $durationPrev['count'] > 0 ? (int) round($durationPrev['totalSeconds'] / 60) : 0;
        $avgDurationMinutes = $durationCurrent['count'] > 0 ? (int) round($durationCurrent['totalSeconds'] / 60 / $durationCurrent['count']) : 0;
        $diffMinutes = $avgDurationMinutes - ($durationPrev['count'] > 0 ? (int) round($durationPrev['totalSeconds'] / 60 / $durationPrev['count']) : 0);

        $highlights = $this->buildHighlights(
            $personal,
            $allClients,
            $weekStart,
            $weekEnd,
            $clientsInWeek,
            $attendancePercent,
            $activeCount,
            $totalStudents,
            $activePairs,
            $activeMap
        );

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
            'periodDistribution' => $periodDistributionWithRelative,
            'frequency' => [
                'expectedPerWeek' => round($expectedPerStudent, 1),
                'realizedPerWeek' => round($realizedPerStudent, 1),
                'status' => $frequencyStatus,
            ],
            'averageTrainingTime' => [
                'minutes' => $avgDurationMinutes,
                'diffMinutes' => $diffMinutes,
            ],
            'highlights' => $highlights,
        ];
    }

    /**
     * Destaques da semana: comparação com a semana anterior à selecionada. Usa apenas treino ativo.
     *
     * @param \App\Entity\Client[] $allClients
     * @param \App\Entity\Client[] $clientsInWeek
     * @param array<int, array{0: int, 1: int}> $activePairs
     * @param array<int, int> $activeMap
     *
     * @return array{attendance: array{type: string, text: string, diff: int}, trainings: array{type: string, text: string, diff: int|null}, inactivity: array{count: int, text: string}}
     */
    private function buildHighlights(
        Personal $personal,
        array $allClients,
        \DateTimeImmutable $weekStart,
        \DateTimeImmutable $weekEnd,
        array $clientsInWeek,
        int $attendancePercent,
        int $activeCount,
        int $totalStudents,
        array $activePairs,
        array $activeMap
    ): array {
        $prevWeekStart = $weekStart->modify('-7 days')->setTime(0, 0, 0);
        $prevWeekEnd = $prevWeekStart->modify('+6 days')->setTime(23, 59, 59);

        $clientsInPrevWeek = array_values(array_filter($allClients, static fn($c) => $c->getCreatedAt() <= $prevWeekEnd));
        $totalPrevStudents = count($clientsInPrevWeek);
        $clientIdsPrev = array_map(static fn($c) => $c->getId(), $clientsInPrevWeek);
        $activeByClientPrev = $this->trainingRepository->findActiveTrainingWithPeriodCountByClientAsOf($personal->getId(), $clientIdsPrev, $prevWeekEnd);
        $activePairsPrev = [];
        $activeMapPrev = [];
        foreach ($activeByClientPrev as $cid => $data) {
            $activePairsPrev[] = [$cid, $data['trainingId']];
            $activeMapPrev[$cid] = $data['trainingId'];
        }

        $activePrevIds = $this->trainingExecutionRepository->findClientIdsFinishedInWeek($personal, $prevWeekStart, $prevWeekEnd, $activePairsPrev);
        $activePrevCount = count($activePrevIds);
        $attendancePrev = $totalPrevStudents > 0
            ? (int) min(100, round(($activePrevCount / $totalPrevStudents) * 100))
            : 0;

        $attendanceDiff = $attendancePercent - $attendancePrev;
        $attendanceType = $attendanceDiff > 0 ? 'up' : ($attendanceDiff < 0 ? 'down' : 'same');
        $attendanceText = $attendanceDiff > 0
            ? sprintf('Assiduidade subiu %d%% em relação à semana passada.', abs($attendanceDiff))
            : ($attendanceDiff < 0
                ? sprintf('Assiduidade caiu %d%% em relação à semana passada.', abs($attendanceDiff))
                : 'Assiduidade manteve-se igual à semana passada.');

        $trainingsSelected = $this->trainingExecutionRepository->countFinishedInWeek($personal, $weekStart, $weekEnd, $activePairs);
        $trainingsPrev = $this->trainingExecutionRepository->countFinishedInWeek($personal, $prevWeekStart, $prevWeekEnd, $activePairsPrev);
        $trainingsDiff = null;
        $trainingsType = 'same';
        $trainingsText = 'Treinos realizados mantiveram-se iguais à semana passada.';
        if ($trainingsPrev > 0) {
            $trainingsDiff = (int) round((($trainingsSelected - $trainingsPrev) / $trainingsPrev) * 100);
            $trainingsType = $trainingsDiff > 0 ? 'up' : ($trainingsDiff < 0 ? 'down' : 'same');
            $trainingsText = $trainingsDiff > 0
                ? sprintf('Treinos realizados aumentaram %d%%.', $trainingsDiff)
                : ($trainingsDiff < 0
                    ? sprintf('Treinos realizados diminuíram %d%%.', abs($trainingsDiff))
                    : $trainingsText);
        } elseif ($trainingsSelected > 0) {
            $trainingsType = 'up';
            $trainingsText = sprintf('Treinos realizados: %d na semana (sem comparação com a anterior).', $trainingsSelected);
        }

        $lastFinishedByPrev = $this->trainingExecutionRepository->findLastFinishedAtByPersonalClientsBeforeOrOn(
            $personal->getId(),
            $prevWeekEnd,
            $activeMapPrev
        );
        $lastFinishedBySel = $this->trainingExecutionRepository->findLastFinishedAtByPersonalClientsBeforeOrOn(
            $personal->getId(),
            $weekEnd,
            $activeMap
        );
        $prevCutoff = $prevWeekEnd->modify('-' . self::NO_TRAINING_DAYS . ' days')->setTime(0, 0, 0);
        $selCutoff = $weekEnd->modify('-' . self::NO_TRAINING_DAYS . ' days')->setTime(0, 0, 0);
        $enteredInactivityCount = 0;
        foreach ($clientsInWeek as $client) {
            $lastPrev = $lastFinishedByPrev[$client->getId()] ?? null;
            $lastSel = $lastFinishedBySel[$client->getId()] ?? null;
            $wasActivePrev = $lastPrev !== null && $lastPrev >= $prevCutoff;
            $isInactiveSel = $lastSel === null || $lastSel < $selCutoff;
            if ($wasActivePrev && $isInactiveSel) {
                $enteredInactivityCount++;
            }
        }
        $inactivityText = $enteredInactivityCount === 0
            ? 'Nenhum aluno entrou em inatividade.'
            : ($enteredInactivityCount === 1
                ? '1 aluno entrou em inatividade.'
                : sprintf('%d alunos entraram em inatividade.', $enteredInactivityCount));

        return [
            'attendance' => [
                'type' => $attendanceType,
                'text' => $attendanceText,
                'diff' => $attendanceDiff,
            ],
            'trainings' => [
                'type' => $trainingsType,
                'text' => $trainingsText,
                'diff' => $trainingsDiff,
            ],
            'inactivity' => [
                'count' => $enteredInactivityCount,
                'text' => $inactivityText,
            ],
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

        $history = [];
        $end = new \DateTimeImmutable();
        $start = $end->modify('-' . self::ATTENDANCE_HISTORY_MONTHS . ' months');

        $daysToMonday = (int) $start->format('N') - 1;
        $monday = $daysToMonday > 0 ? $start->modify('-' . $daysToMonday . ' days') : $start;

        while ($monday < $end) {
            $weekStart = $monday->setTime(0, 0, 0);
            $weekEnd = $monday->modify('+6 days')->setTime(23, 59, 59);
            $activeClientIds = $this->trainingExecutionRepository->findClientIdsFinishedInWeek($personal, $weekStart, $weekEnd);
            $activeCount = count($activeClientIds);
            $percentage = $totalStudents > 0
                ? (int) min(100, round(($activeCount / $totalStudents) * 100))
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
