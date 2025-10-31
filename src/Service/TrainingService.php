<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Exercise;
use App\Entity\PeriodExercise;
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

        // $result = [];
        // foreach ($trainings as $training) {
        //     $periods = [];

        //     foreach ($training->getPeriods() as $period) {
        //         $exercises = [];

        //         foreach ($period->getPeriodExercises() as $pe) {
        //             $exercises[] = [
        //                 'id' => $pe->getExercise()->getId(),
        //                 'name' => $pe->getExercise()->getName(),
        //                 'series' => $pe->getSeries(),
        //                 'reps' => $pe->getRepeats(),
        //                 'rest' => $pe->getRest(),
        //                 'notes' => $pe->getObservation(),
        //             ];
        //         }

        //         $periods[] = [
        //             'id' => $period->getId(),
        //             'name' => $period->getName(),
        //             'exercises' => $exercises,
        //         ];
        //     }

        //     $result[] = [
        //         'id' => $training->getId(),
        //         'name' => $training->getName(),
        //         'createdAt' => $training->getCreatedAt()->format('d/m/Y'),
        //         'periods' => $periods,
        //     ];
        // }

        return $trainings;
    }

    public function updateTraining(User $user, array $data, int $id): void
    {
        $training = $this->trainingRepository->find($id);
        if (!$training || $training->getPersonal()->getId() !== $user->getId()) {
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
        $personal = $this->personalRepository->findOneBy(['user' => $user]);
        if (!$personal) {
            throw new \Exception('Personal não encontrado.');
        }

        $training = $this->trainingRepository->findOneBy([
            'id' => $trainingId,
            'personal' => $personal
        ]);

        if (!$training) {
            throw new \Exception('Treino não encontrado.');
        }

        $this->em->remove($training);
        $this->em->flush();
    }
}
