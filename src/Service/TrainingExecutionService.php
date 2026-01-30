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
        usort($exerciseExecutions, fn ($a, $b) => $a['executionOrder'] <=> $b['executionOrder']);
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
        if ($execution->getFinishedAt() !== null) {
            throw new UnprocessableEntityHttpException('Treino já finalizado');
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
