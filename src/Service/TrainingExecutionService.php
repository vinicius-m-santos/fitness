<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\ExerciseExecution;
use App\Entity\SetExecution;
use App\Entity\TrainingExecution;
use App\Enum\WorkoutRatingEnum;
use App\Repository\ExerciseExecutionRepository;
use App\Repository\PeriodExerciseRepository;
use App\Repository\SetExecutionRepository;
use App\Repository\TrainingExecutionRepository;
use App\Repository\TrainingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TrainingExecutionService
{
    private const EDIT_WINDOW_HOURS = 24;

    private static function parseSeriesCount(?string $series): int
    {
        if ($series === null || $series === '') {
            return 4;
        }
        $n = (int) preg_replace('/^(\d+).*$/', '$1', trim($series));
        return $n >= 1 && $n <= 20 ? $n : 4;
    }

    public static function isWithinEditWindow(?\DateTimeImmutable $finishedAt): bool
    {
        if ($finishedAt === null) {
            return true;
        }
        $deadline = $finishedAt->modify('+' . self::EDIT_WINDOW_HOURS . ' hours');
        return (new \DateTimeImmutable()) < $deadline;
    }
    public function __construct(
        private readonly TrainingExecutionRepository $trainingExecutionRepo,
        private readonly TrainingRepository $trainingRepo,
        private readonly PeriodExerciseRepository $periodExerciseRepo,
        private readonly ExerciseExecutionRepository $exerciseExecutionRepo,
        private readonly SetExecutionRepository $setExecutionRepo,
        private readonly EntityManagerInterface $em,
    ) {}

    public function start(Client $client, int $trainingId): TrainingExecution
    {
        $training = $this->trainingRepo->find($trainingId);
        if (!$training || $training->getClient()->getId() !== $client->getId()) {
            throw new NotFoundHttpException('Treino não encontrado');
        }
        $execution = new TrainingExecution();
        $execution->setTraining($training);
        $execution->setClient($client);
        $execution->setStartedAt(new \DateTimeImmutable());
        return $this->trainingExecutionRepo->add($execution);
    }

    /**
     * @return array{id: int, finishedAt: string|null, trainingId: int, exerciseExecutions: list<array{id: int, periodExerciseId: int, executionOrder: int, durationSeconds: int|null}>}
     */
    public function getExecutionForClient(Client $client, int $executionId): array
    {
        $execution = $this->trainingExecutionRepo->find($executionId);
        if (!$execution || $execution->getClient()->getId() !== $client->getId()) {
            throw new NotFoundHttpException('Execução não encontrada');
        }
        $exerciseExecutions = [];
        foreach ($execution->getExerciseExecutions() as $ee) {
            $exerciseExecutions[] = [
                'id' => $ee->getId(),
                'periodExerciseId' => $ee->getPeriodExercise()->getId(),
                'executionOrder' => $ee->getExecutionOrder(),
                'durationSeconds' => $ee->getDurationSeconds(),
            ];
        }
        usort($exerciseExecutions, fn($a, $b) => $a['executionOrder'] <=> $b['executionOrder']);
        return [
            'id' => $execution->getId(),
            'finishedAt' => $execution->getFinishedAt()?->format(\DateTimeInterface::ATOM),
            'trainingId' => $execution->getTraining()->getId(),
            'exerciseExecutions' => $exerciseExecutions,
        ];
    }

    /**
     * @param string|null $rating One of WorkoutRatingEnum values (bad, neutral, good)
     */
    public function finish(Client $client, int $executionId, ?string $rating = null): TrainingExecution
    {
        $execution = $this->trainingExecutionRepo->find($executionId);
        if (!$execution || $execution->getClient()->getId() !== $client->getId()) {
            throw new NotFoundHttpException('Execução não encontrada');
        }
        if ($execution->getFinishedAt() !== null) {
            throw new UnprocessableEntityHttpException('Treino já finalizado');
        }
        foreach ($execution->getExerciseExecutions() as $ee) {
            $duration = $ee->getDurationSeconds();
            $ee->setExecuted($duration !== null && $duration >= 60);
            $pe = $ee->getPeriodExercise();
            $seriesCount = self::parseSeriesCount($pe?->getSeries());
            $existingByNumber = [];
            foreach ($ee->getSetExecutions() as $set) {
                $existingByNumber[$set->getSetNumber()] = $set;
            }
            for ($n = 1; $n <= $seriesCount; $n++) {
                if (!isset($existingByNumber[$n])) {
                    $setExecution = new SetExecution();
                    $setExecution->setExerciseExecution($ee);
                    $setExecution->setSetNumber($n);
                    $setExecution->setLoadKg(0.0);
                    $ee->addSetExecution($setExecution);
                    $this->setExecutionRepo->add($setExecution, false);
                }
            }
        }
        $execution->setFinishedAt(new \DateTimeImmutable());
        if ($rating !== null && $rating !== '') {
            $enum = WorkoutRatingEnum::tryFrom($rating);
            if ($enum !== null) {
                $execution->setRating($enum);
            }
        }
        $this->em->flush();
        return $execution;
    }

    /**
     * Cria ou atualiza execução a partir dos dados da sessão. Se executionId for informado, atualiza o registro existente.
     *
     * @param array{executionId?: int, trainingId: int, periodId: int, startedAt: string, finishedAt: string, rating?: string|null, exerciseExecutions: array<int, array{periodExerciseId: int, executionOrder: int, durationSeconds: int|null, sets: array<int, array{setNumber: int, loadKg: float|null, restSeconds: int|null}>}>} $payload
     */
    public function finishWithSession(Client $client, array $payload): TrainingExecution
    {
        $executionId = isset($payload['executionId']) && is_numeric($payload['executionId']) ? (int) $payload['executionId'] : null;
        $trainingId = (int) ($payload['trainingId'] ?? 0);
        $periodId = (int) ($payload['periodId'] ?? 0);
        $startedAtStr = $payload['startedAt'] ?? null;
        $finishedAtStr = $payload['finishedAt'] ?? null;
        $rating = isset($payload['rating']) && \is_string($payload['rating']) ? $payload['rating'] : null;
        $exerciseExecutionsData = $payload['exerciseExecutions'] ?? [];
        $lastRestSecondsFromPayload = isset($payload['lastRestSeconds']) && $payload['lastRestSeconds'] !== null
            ? (int) $payload['lastRestSeconds'] : null;
        if (!$trainingId || !$periodId || !$startedAtStr || !$finishedAtStr) {
            throw new UnprocessableEntityHttpException('trainingId, periodId, startedAt e finishedAt são obrigatórios');
        }
        $training = $this->trainingRepo->find($trainingId);
        if (!$training || $training->getClient()->getId() !== $client->getId()) {
            throw new NotFoundHttpException('Treino não encontrado');
        }
        $period = null;
        foreach ($training->getPeriods() as $p) {
            if ($p->getId() === $periodId) {
                $period = $p;
                break;
            }
        }
        if (!$period) {
            throw new NotFoundHttpException('Período não encontrado');
        }
        try {
            $startedAt = new \DateTimeImmutable($startedAtStr);
            $finishedAt = new \DateTimeImmutable($finishedAtStr);
        } catch (\Exception $e) {
            throw new UnprocessableEntityHttpException('startedAt e finishedAt devem estar em formato ISO 8601');
        }
        if ($executionId !== null) {
            $execution = $this->trainingExecutionRepo->find($executionId);
            if (!$execution || $execution->getClient()->getId() !== $client->getId()) {
                throw new NotFoundHttpException('Execução não encontrada');
            }
            $execution->setStartedAt($startedAt);
            $execution->setFinishedAt($finishedAt);
            if ($rating !== null && $rating !== '') {
                $enum = WorkoutRatingEnum::tryFrom($rating);
                $execution->setRating($enum !== null ? $enum : $execution->getRating());
            }
            $toRemove = $execution->getExerciseExecutions()->toArray();
            foreach ($toRemove as $ee) {
                $execution->getExerciseExecutions()->removeElement($ee);
            }
        } else {
            $execution = new TrainingExecution();
            $execution->setTraining($training);
            $execution->setClient($client);
            $execution->setStartedAt($startedAt);
            $execution->setFinishedAt($finishedAt);
            if ($rating !== null && $rating !== '') {
                $enum = WorkoutRatingEnum::tryFrom($rating);
                if ($enum !== null) {
                    $execution->setRating($enum);
                }
            }
            $this->trainingExecutionRepo->add($execution, false);
        }
        $eeDataByPeId = [];
        foreach ($exerciseExecutionsData as $eeData) {
            $peId = (int) ($eeData['periodExerciseId'] ?? 0);
            if ($peId > 0) {
                $eeDataByPeId[$peId] = $eeData;
            }
        }
        $order = 1;
        foreach ($period->getPeriodExercises() as $periodExercise) {
            $peId = $periodExercise->getId();
            $eeData = $eeDataByPeId[$peId] ?? null;
            $exerciseExecution = new ExerciseExecution();
            $exerciseExecution->setTrainingExecution($execution);
            $exerciseExecution->setPeriodExercise($periodExercise);
            $exerciseExecution->setExecutionOrder($order++);
            $durationSeconds = null;
            $setsData = [];
            if ($eeData !== null) {
                $durationSeconds = isset($eeData['durationSeconds']) && $eeData['durationSeconds'] !== null
                    ? (int) $eeData['durationSeconds'] : null;
                $setsData = $eeData['sets'] ?? [];
            }
            $exerciseExecution->setDurationSeconds($durationSeconds);
            $executed = $durationSeconds !== null && $durationSeconds >= 60;
            $exerciseExecution->setExecuted($executed);
            $this->exerciseExecutionRepo->add($exerciseExecution, false);
            $seriesCount = self::parseSeriesCount($periodExercise->getSeries());
            $loadBySet = [];
            $restBySet = [];
            foreach ($setsData as $s) {
                $sn = (int) ($s['setNumber'] ?? 0);
                if ($sn >= 1 && $sn <= $seriesCount) {
                    $loadBySet[$sn] = isset($s['loadKg']) && $s['loadKg'] !== null ? (float) $s['loadKg'] : 0.0;
                    $restBySet[$sn] = isset($s['restSeconds']) && $s['restSeconds'] !== null ? (int) $s['restSeconds'] : null;
                }
            }
            for ($n = 1; $n <= $seriesCount; $n++) {
                $setExecution = new SetExecution();
                $setExecution->setExerciseExecution($exerciseExecution);
                $setExecution->setSetNumber($n);
                $setExecution->setLoadKg($loadBySet[$n] ?? 0.0);
                $restSeconds = (isset($restBySet[$n]) && $restBySet[$n] !== null)
                    ? $restBySet[$n]
                    : $lastRestSecondsFromPayload;
                if ($restSeconds !== null) {
                    $setExecution->setRestSeconds($restSeconds);
                }
                $exerciseExecution->addSetExecution($setExecution);
                $this->setExecutionRepo->add($setExecution, false);
            }
        }
        $this->em->flush();
        return $execution;
    }

    public function addExerciseExecution(Client $client, int $executionId, int $periodExerciseId, int $executionOrder): ExerciseExecution
    {
        $execution = $this->trainingExecutionRepo->find($executionId);
        if (!$execution || $execution->getClient()->getId() !== $client->getId()) {
            throw new NotFoundHttpException('Execução não encontrada');
        }
        if ($execution->getFinishedAt() !== null) {
            throw new UnprocessableEntityHttpException('Treino já finalizado');
        }
        $periodExercise = $this->periodExerciseRepo->find($periodExerciseId);
        if (!$periodExercise) {
            throw new NotFoundHttpException('Exercício do período não encontrado');
        }
        $training = $execution->getTraining();
        $belongsToTraining = false;
        foreach ($training->getPeriods() as $p) {
            foreach ($p->getPeriodExercises() as $pe) {
                if ($pe->getId() === $periodExerciseId) {
                    $belongsToTraining = true;
                    break 2;
                }
            }
        }
        if (!$belongsToTraining) {
            throw new UnprocessableEntityHttpException('Exercício não pertence a este treino');
        }
        $exerciseExecution = new ExerciseExecution();
        $exerciseExecution->setTrainingExecution($execution);
        $exerciseExecution->setPeriodExercise($periodExercise);
        $exerciseExecution->setExecutionOrder($executionOrder);
        return $this->exerciseExecutionRepo->add($exerciseExecution);
    }

    public function updateSets(Client $client, int $exerciseExecutionId, array $sets): ExerciseExecution
    {
        $exerciseExecution = $this->exerciseExecutionRepo->find($exerciseExecutionId);
        if (!$exerciseExecution) {
            throw new NotFoundHttpException('Execução do exercício não encontrada');
        }
        $execution = $exerciseExecution->getTrainingExecution();
        if ($execution->getClient()->getId() !== $client->getId()) {
            throw new NotFoundHttpException('Execução não encontrada');
        }
        if ($execution->getFinishedAt() !== null && !self::isWithinEditWindow($execution->getFinishedAt())) {
            throw new UnprocessableEntityHttpException('Prazo para editar este treino expirou (24h após finalização)');
        }
        $existingByNumber = [];
        foreach ($exerciseExecution->getSetExecutions() as $set) {
            $existingByNumber[$set->getSetNumber()] = $set;
        }
        foreach ($sets as $s) {
            $setNumber = (int) ($s['setNumber'] ?? 0);
            if ($setNumber < 1) {
                continue;
            }
            $setExecution = $existingByNumber[$setNumber] ?? null;
            if (!$setExecution) {
                $setExecution = new SetExecution();
                $setExecution->setExerciseExecution($exerciseExecution);
                $setExecution->setSetNumber($setNumber);
                $exerciseExecution->addSetExecution($setExecution);
                $this->setExecutionRepo->add($setExecution, false);
            }
            if (array_key_exists('loadKg', $s)) {
                $setExecution->setLoadKg(isset($s['loadKg']) && $s['loadKg'] !== null ? (float) $s['loadKg'] : null);
            }
            if (array_key_exists('restSeconds', $s)) {
                $setExecution->setRestSeconds(isset($s['restSeconds']) && $s['restSeconds'] !== null ? (int) $s['restSeconds'] : null);
            }
        }
        $this->em->flush();
        return $exerciseExecution;
    }

    public function setExerciseExecutionDuration(Client $client, int $exerciseExecutionId, int $durationSeconds): ExerciseExecution
    {
        $exerciseExecution = $this->exerciseExecutionRepo->find($exerciseExecutionId);
        if (!$exerciseExecution) {
            throw new NotFoundHttpException('Execução do exercício não encontrada');
        }
        $execution = $exerciseExecution->getTrainingExecution();
        if ($execution->getClient()->getId() !== $client->getId()) {
            throw new NotFoundHttpException('Execução não encontrada');
        }
        if ($execution->getFinishedAt() !== null) {
            throw new UnprocessableEntityHttpException('Treino já finalizado');
        }
        $exerciseExecution->setDurationSeconds($durationSeconds);
        $this->em->flush();
        return $exerciseExecution;
    }

    public function updateSetRest(Client $client, int $exerciseExecutionId, int $setNumber, int $restSeconds): void
    {
        $exerciseExecution = $this->exerciseExecutionRepo->find($exerciseExecutionId);
        if (!$exerciseExecution) {
            throw new NotFoundHttpException('Execução do exercício não encontrada');
        }
        $execution = $exerciseExecution->getTrainingExecution();
        if ($execution->getClient()->getId() !== $client->getId()) {
            throw new NotFoundHttpException('Execução não encontrada');
        }
        foreach ($exerciseExecution->getSetExecutions() as $set) {
            if ($set->getSetNumber() === $setNumber) {
                $set->setRestSeconds($restSeconds);
                $this->em->flush();
                return;
            }
        }
        $setExecution = new SetExecution();
        $setExecution->setExerciseExecution($exerciseExecution);
        $setExecution->setSetNumber($setNumber);
        $setExecution->setRestSeconds($restSeconds);
        $exerciseExecution->addSetExecution($setExecution);
        $this->setExecutionRepo->add($setExecution);
    }

    public function getLastRestSeconds(Client $client): ?int
    {
        return $this->trainingExecutionRepo->findLastRestSecondsByClient($client);
    }

    public function getLastLoadKg(Client $client, int $periodExerciseId): ?float
    {
        return $this->setExecutionRepo->findLastLoadKgByClientAndPeriodExercise($client, $periodExerciseId);
    }

    /**
     * @return array<int, array{setNumber: int, loadKg: float|null, restSeconds: int|null}>
     */
    public function getSetsForExerciseExecution(Client $client, int $exerciseExecutionId): array
    {
        $exerciseExecution = $this->exerciseExecutionRepo->find($exerciseExecutionId);
        if (!$exerciseExecution) {
            throw new NotFoundHttpException('Execução do exercício não encontrada');
        }
        $execution = $exerciseExecution->getTrainingExecution();
        if ($execution->getClient()->getId() !== $client->getId()) {
            throw new NotFoundHttpException('Execução não encontrada');
        }
        $result = [];
        foreach ($exerciseExecution->getSetExecutions() as $set) {
            $result[$set->getSetNumber()] = [
                'setNumber' => $set->getSetNumber(),
                'loadKg' => $set->getLoadKg(),
                'restSeconds' => $set->getRestSeconds(),
            ];
        }
        return array_values($result);
    }

    /**
     * @return array<int, array{setNumber: int, loadKg: float|null}>
     */
    public function getLastLoadsByPeriodExercise(Client $client, int $periodExerciseId): array
    {
        return $this->setExecutionRepo->findLastLoadsByClientAndPeriodExercise($client, $periodExerciseId);
    }

    /**
     * Lista execuções finalizadas do aluno para histórico (ordenado por finishedAt DESC).
     *
     * @return list<array{id: int, finishedAt: string, startedAt: string, trainingId: int, trainingName: string, periodId: int|null, periodName: string|null, totalDurationSeconds: int, exerciseExecutions: list<array{id: int, periodExerciseId: int, exerciseName: string, durationSeconds: int|null, sets: list<array{setNumber: int, loadKg: float|null}>}>}>
     */
    public function getHistoryForClient(Client $client, ?\DateTimeInterface $since = null, int $limit = 30): array
    {
        $executions = $since !== null
            ? $this->trainingExecutionRepo->findFinishedByClientOrderByFinishedAtDesc($client, $since, 500)
            : $this->trainingExecutionRepo->findFinishedByClientOrderByFinishedAtDesc($client, null, min(50, max(1, $limit)));
        $result = [];
        foreach ($executions as $execution) {
            $finishedAt = $execution->getFinishedAt();
            $startedAt = $execution->getStartedAt();
            if ($finishedAt === null || $startedAt === null) {
                continue;
            }
            $totalDurationSeconds = $finishedAt->getTimestamp() - $startedAt->getTimestamp();
            $periodId = null;
            $periodName = null;
            $exerciseExecutions = [];
            $ees = $execution->getExerciseExecutions()->toArray();
            usort($ees, fn($a, $b) => $a->getExecutionOrder() <=> $b->getExecutionOrder());
            foreach ($ees as $ee) {
                $pe = $ee->getPeriodExercise();
                if ($periodId === null && $pe !== null) {
                    $tp = $pe->getTrainingPeriod();
                    if ($tp !== null) {
                        $periodId = $tp->getId();
                        $periodName = $tp->getName();
                    }
                }
                $seriesCount = self::parseSeriesCount($pe?->getSeries());
                $loadBySet = [];
                $restBySet = [];
                foreach ($ee->getSetExecutions() as $set) {
                    $loadBySet[$set->getSetNumber()] = $set->getLoadKg() ?? 0.0;
                    $restBySet[$set->getSetNumber()] = $set->getRestSeconds();
                }
                $sets = [];
                for ($n = 1; $n <= $seriesCount; $n++) {
                    $sets[] = [
                        'setNumber' => $n,
                        'loadKg' => $loadBySet[$n] ?? 0.0,
                        'restSeconds' => $restBySet[$n] ?? null,
                    ];
                }
                $exerciseExecutions[] = [
                    'id' => $ee->getId(),
                    'periodExerciseId' => $pe?->getId() ?? 0,
                    'exerciseName' => $pe?->getExercise()?->getName() ?? '—',
                    'durationSeconds' => $ee->getDurationSeconds(),
                    'executed' => $ee->isExecuted(),
                    'sets' => $sets,
                ];
            }
            $result[] = [
                'id' => $execution->getId(),
                'finishedAt' => $finishedAt->format(\DateTimeInterface::ATOM),
                'startedAt' => $startedAt->format(\DateTimeInterface::ATOM),
                'trainingId' => $execution->getTraining()->getId(),
                'trainingName' => $execution->getTraining()->getName(),
                'periodId' => $periodId,
                'periodName' => $periodName,
                'totalDurationSeconds' => (int) $totalDurationSeconds,
                'exerciseExecutions' => $exerciseExecutions,
            ];
        }
        return $result;
    }

    public function deleteExecution(Client $client, int $executionId): void
    {
        $execution = $this->trainingExecutionRepo->find($executionId);
        if (!$execution || $execution->getClient()->getId() !== $client->getId()) {
            throw new NotFoundHttpException('Execução não encontrada');
        }
        if ($execution->getFinishedAt() === null) {
            throw new UnprocessableEntityHttpException('Só é possível excluir treinos já finalizados');
        }
        if (!self::isWithinEditWindow($execution->getFinishedAt())) {
            throw new UnprocessableEntityHttpException('Prazo para excluir este treino expirou (24h após finalização)');
        }
        $this->em->remove($execution);
        $this->em->flush();
    }

    /**
     * @return array{lastRestSeconds: int|null, lastLoadsByPeriodExercise: array<int, array<int, array{setNumber: int, loadKg: float|null}>>}
     */
    public function getExecutionContext(Client $client, int $trainingId, int $periodId): array
    {
        $personal = $client->getPersonal();
        if (!$personal) {
            throw new NotFoundHttpException('Cliente sem personal');
        }
        $training = $this->trainingRepo->findOneWithRelations($trainingId, $personal);
        if (!$training || $training->getClient()->getId() !== $client->getId()) {
            throw new NotFoundHttpException('Treino não encontrado');
        }
        $period = null;
        foreach ($training->getPeriods() as $p) {
            if ($p->getId() === $periodId) {
                $period = $p;
                break;
            }
        }
        if (!$period) {
            throw new NotFoundHttpException('Período não encontrado');
        }
        $lastRestSeconds = $this->trainingExecutionRepo->findLastRestSecondsByClient($client);
        $lastLoadsByPeriodExercise = [];
        foreach ($period->getPeriodExercises() as $pe) {
            $peId = $pe->getId();
            $sets = $this->setExecutionRepo->findLastLoadsByClientAndPeriodExercise($client, $peId);
            $lastLoadsByPeriodExercise[$peId] = array_values($sets);
        }
        return [
            'lastRestSeconds' => $lastRestSeconds,
            'lastLoadsByPeriodExercise' => $lastLoadsByPeriodExercise,
        ];
    }
}
