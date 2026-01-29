<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Exercise;
use App\Entity\PeriodExercise;
use App\Repository\TrainingExecutionRepository;
use App\Repository\TrainingRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Personal;
use App\Entity\Training;
use App\Entity\TrainingPeriod;
use App\Entity\User;
use App\Repository\ExerciseRepository;
use App\Repository\PeriodExerciseRepository;
use App\Repository\PersonalRepository;
use App\Repository\TrainingPeriodRepository;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TrainingService
{
    public function __construct(
        private TrainingRepository $trainingRepository,
        private TrainingPeriodRepository $trainingPeriodRepository,
        private PersonalRepository $personalRepository,
        private ExerciseRepository $exerciseRepository,
        private PeriodExerciseRepository $periodExerciseRepository,
        private PeriodExerciseService $periodExerciseService,
        private EntityManagerInterface $em,
        private ClientService $clientService,
        private TrainingExecutionRepository $trainingExecutionRepository,
    ) {}

    public function createTraining(User $user, array $data): Training
    {
        $personal = $user->getPersonal();
        if (!$personal) {
            throw new UnprocessableEntityHttpException("Personal não encontrado");
        }

        $clientId = $data['client'] ?? null;
        if (!$clientId) {
            throw new UnprocessableEntityHttpException("Cliente não fornecido");
        }

        $client = $this->clientService->find($clientId);
        if (!$client) {
            throw new UnprocessableEntityHttpException("Cliente não encontrado");
        }

        if (!$data["name"]) {
            throw new UnprocessableEntityHttpException("Nome do treino não informado");
        }

        $training = new Training();
        $training->setName($data['name']);
        $training->setClient($client);
        $training->setPersonal($personal);

        $this->trainingRepository->add($training, true);

        foreach ($data['periods'] as $periodData) {
            $trainingPeriod = $this->createTrainingPeriod(
                $training,
                $periodData['name']
            );

            foreach ($periodData['exercises'] as $exerciseData) {
                $exercise = $this->exerciseRepository->find($exerciseData['id']);
                if (!$exercise) {
                    throw new UnprocessableEntityHttpException("Exercício não encontrado");
                }

                $this->createPeriodExercise(
                    $trainingPeriod,
                    $exercise,
                    $exerciseData
                );
            }
        }

        return $training;
    }
    private function createPeriodExercise(TrainingPeriod $trainingPeriod, Exercise $exercise, array $data): PeriodExercise
    {
        $periodExercise = new PeriodExercise();
        $periodExercise->getDataFromArray($data);
        $periodExercise->setTrainingPeriod($trainingPeriod);
        $periodExercise->setExercise($exercise);

        return $this->periodExerciseService->add($periodExercise, true);
    }

    private function createTrainingPeriod(Training $training, string $name): TrainingPeriod
    {
        $period = new TrainingPeriod();
        $period->setTraining($training);
        $period->setName($name);

        return $this->trainingPeriodRepository->add($period, true);
    }

    // public function getTrainingsByClient(Client $client, Personal $personal): array
    // {
    //     $trainings = $this->trainingRepository->findWithRelations($client, $personal);

    //     $result = [];
    //     foreach ($trainings as $training) {
    //         $periods = [];

    //         // foreach ($training->getPeriods() as $period) {
    //         foreach ($training['periods'] as $period) {
    //             $exercises = [];

    //             // foreach ($period->getPeriodExercises() as $pe) {
    //             foreach ($period['periodExercises'] as $pe) {
    //                 $exercises[] = [
    //                     'id' => $pe['exercise']['id'],
    //                     'name' => $pe['exercise']['name'],
    //                     'series' => $pe['series'],
    //                     'reps' => $pe['repeats'],
    //                     'rest' => $pe['rest'],
    //                     'notes' => $pe['observation'],
    //                 ];
    //             }

    //             $periods[] = [
    //                 'id' => $period['id'],
    //                 'name' => $period['name'],
    //                 'exercises' => $exercises,
    //             ];
    //         }

    //         $result[] = [
    //             'id' => $training['id'],
    //             'name' => $training['name'],
    //             'createdAt' => $training['createdAt']->format('d/m/Y'),
    //             'periods' => $periods,
    //         ];
    //     }

    //     return $result;
    // }

    public function getTrainingsByClient(Client $client, Personal $personal): array
    {
        $trainings = $this->trainingRepository->findWithRelations($client, $personal);

        $result = [];
        foreach ($trainings as $training) {
            $periods = [];

            foreach ($training->getPeriods() as $period) {
                $exercises = [];

                foreach ($period->getPeriodExercises() as $pe) {
                    $exercises[] = [
                        'id' => $pe->getExercise()->getId(),
                        'periodExerciseId' => $pe->getId(),
                        'name' => $pe->getExercise()->getName(),
                        'series' => $pe->getSeries(),
                        'reps' => $pe->getRepeats(),
                        'rest' => $pe->getRest(),
                        'obs' => strlen(trim($pe->getObservation())) ? trim($pe->getObservation()) : "",
                    ];
                }

                $periods[] = [
                    'id' => $period->getId(),
                    'name' => $period->getName(),
                    'exercises' => $exercises,
                ];
            }

            $lastFinishedAt = $this->trainingExecutionRepository->findLastFinishedAtByTraining($training);
            $result[] = [
                'id' => $training->getId(),
                'name' => $training->getName(),
                'createdAt' => $training->getCreatedAt()->format('d/m/Y'),
                'isStandard' => $training->isStandard(),
                'periods' => $periods,
                'lastFinishedAt' => $lastFinishedAt?->format(\DateTimeInterface::ATOM),
            ];
        }

        return $result;
    }

    public function getTrainingByIdForClient(Client $client, Personal $personal, int $trainingId): ?array
    {
        $training = $this->trainingRepository->findOneWithRelations($trainingId, $personal);
        if (!$training || $training->getClient()->getId() !== $client->getId()) {
            return null;
        }
        $periods = [];
        foreach ($training->getPeriods() as $period) {
            $exercises = [];
            foreach ($period->getPeriodExercises() as $pe) {
                $exercises[] = [
                    'id' => $pe->getExercise()->getId(),
                    'periodExerciseId' => $pe->getId(),
                    'name' => $pe->getExercise()->getName(),
                    'series' => $pe->getSeries(),
                    'reps' => $pe->getRepeats(),
                    'rest' => $pe->getRest(),
                    'obs' => strlen(trim($pe->getObservation() ?? '')) ? trim($pe->getObservation()) : '',
                ];
            }
            $periods[] = [
                'id' => $period->getId(),
                'name' => $period->getName(),
                'exercises' => $exercises,
            ];
        }
        return [
            'id' => $training->getId(),
            'name' => $training->getName(),
            'createdAt' => $training->getCreatedAt()->format('d/m/Y'),
            'isStandard' => $training->isStandard(),
            'periods' => $periods,
        ];
    }

    public function getStudentContext(Client $client, Personal $personal): array
    {
        $trainings = $this->trainingRepository->findWithRelations($client, $personal);
        if (empty($trainings)) {
            return ['lastTraining' => null, 'nextPeriod' => null];
        }
        $training = $trainings[0];
        $periodsOrdered = $training->getPeriods()->toArray();
        usort($periodsOrdered, static fn (TrainingPeriod $a, TrainingPeriod $b) => $a->getId() <=> $b->getId());

        $lastTraining = $this->buildTrainingArray($training);
        $lastExecution = $this->trainingExecutionRepository->findLastByClientAndTraining($client, $training);

        $lastExecutedPeriodId = null;
        if ($lastExecution) {
            $maxOrder = -1;
            foreach ($lastExecution->getExerciseExecutions() as $ee) {
                if ($ee->getExecutionOrder() > $maxOrder) {
                    $maxOrder = $ee->getExecutionOrder();
                    $lastExecutedPeriodId = $ee->getPeriodExercise()->getTrainingPeriod()->getId();
                }
            }
        }

        $nextPeriodIndex = 0;
        if ($lastExecutedPeriodId !== null) {
            foreach ($periodsOrdered as $i => $p) {
                if ($p->getId() === $lastExecutedPeriodId) {
                    $nextPeriodIndex = $i + 1;
                    if ($nextPeriodIndex >= count($periodsOrdered)) {
                        $nextPeriodIndex = 0;
                    }
                    break;
                }
            }
        }

        $nextPeriodEntity = $periodsOrdered[$nextPeriodIndex] ?? null;
        $nextPeriod = $nextPeriodEntity ? $this->buildPeriodArray($nextPeriodEntity) : null;

        return ['lastTraining' => $lastTraining, 'nextPeriod' => $nextPeriod];
    }

    private function buildTrainingArray(Training $training): array
    {
        $periods = [];
        foreach ($training->getPeriods() as $period) {
            $periods[] = $this->buildPeriodArray($period);
        }
        usort($periods, static fn (array $a, array $b) => $a['id'] <=> $b['id']);
        $lastFinishedAt = $this->trainingExecutionRepository->findLastFinishedAtByTraining($training);
        return [
            'id' => $training->getId(),
            'name' => $training->getName(),
            'createdAt' => $training->getCreatedAt()->format('d/m/Y'),
            'isStandard' => $training->isStandard(),
            'periods' => $periods,
            'lastFinishedAt' => $lastFinishedAt?->format(\DateTimeInterface::ATOM),
        ];
    }

    private function buildPeriodArray(TrainingPeriod $period): array
    {
        $exercises = [];
        foreach ($period->getPeriodExercises() as $pe) {
            $exercises[] = [
                'id' => $pe->getExercise()->getId(),
                'periodExerciseId' => $pe->getId(),
                'name' => $pe->getExercise()->getName(),
                'series' => $pe->getSeries(),
                'reps' => $pe->getRepeats(),
                'rest' => $pe->getRest(),
                'obs' => strlen(trim($pe->getObservation() ?? '')) ? trim($pe->getObservation()) : '',
            ];
        }
        return [
            'id' => $period->getId(),
            'name' => $period->getName(),
            'exercises' => $exercises,
        ];
    }

    /**
     * Copia o treino do aluno para os clientes indicados. O dono do treino é excluído da lista.
     *
     * @param int[] $clientIds
     */
    public function copyToClients(User $user, int $trainingId, array $clientIds): void
    {
        $personal = $user->getPersonal();
        if (!$personal) {
            throw new UnprocessableEntityHttpException('Personal não encontrado');
        }

        $training = $this->trainingRepository->findOneWithRelations($trainingId, $personal);
        if (!$training) {
            throw new UnprocessableEntityHttpException('Treino não encontrado');
        }

        $ownerClientId = $training->getClient()->getId();
        $clientIds = array_values(array_filter(
            array_map('intval', $clientIds),
            static fn (int $id) => $id !== $ownerClientId
        ));

        if (empty($clientIds)) {
            throw new UnprocessableEntityHttpException('Selecione pelo menos um aluno (exceto o dono do treino).');
        }

        foreach ($clientIds as $clientId) {
            $client = $this->clientService->find($clientId);
            if (!$client) {
                throw new UnprocessableEntityHttpException('Cliente não encontrado.');
            }
            $clientPersonal = $client->getPersonal();
            if (!$clientPersonal || $clientPersonal->getId() !== $personal->getId()) {
                throw new UnprocessableEntityHttpException('Cliente não pertence ao seu cadastro.');
            }

            $this->copyTrainingToClient($training, $personal, $client);
        }
    }

    private function copyTrainingToClient(Training $source, Personal $personal, Client $client): void
    {
        $training = new Training();
        $training->setName($source->getName() ?? '');
        $training->setPersonal($personal);
        $training->setClient($client);
        $this->trainingRepository->add($training, true);

        foreach ($source->getPeriods() as $period) {
            $newPeriod = new TrainingPeriod();
            $newPeriod->setName($period->getName());
            $newPeriod->setTraining($training);
            $this->trainingPeriodRepository->add($newPeriod, true);

            foreach ($period->getPeriodExercises() as $pe) {
                $exercise = $pe->getExercise();
                if (!$exercise) {
                    continue;
                }
                $newPe = new PeriodExercise();
                $newPe->setExercise($exercise);
                $newPe->setTrainingPeriod($newPeriod);
                $newPe->getDataFromArray([
                    'series' => $pe->getSeries(),
                    'reps' => $pe->getRepeats(),
                    'rest' => $pe->getRest(),
                    'obs' => $pe->getObservation(),
                ]);
                $this->periodExerciseService->add($newPe, true);
            }
        }
    }

    public function updateTraining(User $user, array $data, int $id): void
    {
        $training = $this->trainingRepository->find($id);
        if (!$training || $training->getPersonal()->getUser()->getId() !== $user->getId()) {
            throw new UnprocessableEntityHttpException('Treino não encontrado');
        }

        $name = $data['name'] ?? null;
        $periodsData = $data['periods'] ?? [];

        if (!$name || !is_array($periodsData)) {
            throw new UnprocessableEntityHttpException('Dados inválidos');
        }

        $training->setName($name);

        foreach ($training->getPeriods() as $period) {
            $this->em->remove($period);
        }

        foreach ($periodsData as $pData) {
            $trainingPeriod = $this->createTrainingPeriod(
                $training,
                $pData['name']
            );
            foreach ($pData['exercises'] as $exerciseData) {
                $exercise = $this->exerciseRepository->find($exerciseData['id']);
                if (!$exercise) {
                    throw new UnprocessableEntityHttpException("Exercício não encontrado");
                }

                $this->createPeriodExercise(
                    $trainingPeriod,
                    $exercise,
                    $exerciseData
                );
            }
        }
    }

    public function deleteTraining(int $trainingId, User $user): void
    {
        $personal = $user->getPersonal();
        if (!$personal) {
            throw new \Exception('Personal não encontrado.');
        }

        $training = $this->trainingRepository->find($trainingId);
        if (!$training || $training->getPersonal()->getUser()->getId() !== $user->getId()) {
            throw new \Exception('Treino não encontrado.');
        }

        $this->em->remove($training);
        $this->em->flush();
    }
}
