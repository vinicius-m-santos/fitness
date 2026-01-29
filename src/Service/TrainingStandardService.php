<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Exercise;
use App\Entity\PeriodExercise;
use App\Entity\PeriodExerciseStandard;
use App\Entity\Personal;
use App\Entity\Training;
use App\Entity\TrainingPeriod;
use App\Entity\TrainingPeriodStandard;
use App\Entity\TrainingStandard;
use App\Entity\User;
use App\Repository\ClientRepository;
use App\Repository\ExerciseRepository;
use App\Repository\PeriodExerciseRepository;
use App\Repository\PeriodExerciseStandardRepository;
use App\Repository\PersonalRepository;
use App\Repository\TrainingPeriodStandardRepository;
use App\Repository\TrainingPeriodRepository;
use App\Repository\TrainingStandardRepository;
use App\Repository\TrainingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TrainingStandardService
{
    public function __construct(
        private TrainingStandardRepository $trainingStandardRepo,
        private TrainingPeriodStandardRepository $periodRepo,
        private PeriodExerciseStandardRepository $periodExerciseStandardRepo,
        private PersonalRepository $personalRepo,
        private ExerciseRepository $exerciseRepo,
        private ClientRepository $clientRepo,
        private TrainingRepository $trainingRepo,
        private TrainingPeriodRepository $trainingPeriodRepo,
        private PeriodExerciseRepository $periodExerciseRepo,
        private EntityManagerInterface $em,
    ) {}

    public function create(User $user, array $data): TrainingStandard
    {
        $personal = $this->personalRepo->findOneByUserUuid($user->getUuid());
        if (!$personal) {
            throw new UnprocessableEntityHttpException('Personal não encontrado');
        }
        if (empty($data['name'])) {
            throw new UnprocessableEntityHttpException('Nome do treino não informado');
        }

        $training = new TrainingStandard();
        $training->setName($data['name']);
        $training->setPersonal($personal);
        $this->trainingStandardRepo->add($training, true);

        foreach ($data['periods'] ?? [] as $pData) {
            $period = new TrainingPeriodStandard();
            $period->setName($pData['name']);
            $period->setTrainingStandard($training);
            $this->periodRepo->add($period, true);

            foreach ($pData['exercises'] ?? [] as $exData) {
                $exercise = $this->exerciseRepo->find($exData['id'] ?? null);
                if (!$exercise) {
                    throw new UnprocessableEntityHttpException('Exercício não encontrado');
                }
                $pe = new PeriodExerciseStandard();
                $pe->getDataFromArray($exData);
                $pe->setExercise($exercise);
                $pe->setTrainingPeriodStandard($period);
                $this->periodExerciseStandardRepo->add($pe, true);
            }
        }

        return $training;
    }

    /** @return array<int, array{id: int, name: string, createdAt: string, periods: array}> */
    public function listByPersonal(Personal $personal): array
    {
        $trainings = $this->trainingStandardRepo->findWithRelationsByPersonal($personal);
        $out = [];
        foreach ($trainings as $t) {
            $periods = [];
            foreach ($t->getPeriods() as $p) {
                $exercises = [];
                foreach ($p->getPeriodExercises() as $pe) {
                    $exercises[] = [
                        'id' => $pe->getExercise()->getId(),
                        'name' => $pe->getExercise()->getName(),
                        'series' => $pe->getSeries(),
                        'reps' => $pe->getRepeats(),
                        'rest' => $pe->getRest(),
                        'obs' => $pe->getObservation() ? trim($pe->getObservation()) : '',
                    ];
                }
                $periods[] = [
                    'id' => $p->getId(),
                    'name' => $p->getName(),
                    'exercises' => $exercises,
                ];
            }
            $out[] = [
                'id' => $t->getId(),
                'name' => $t->getName(),
                'createdAt' => $t->getCreatedAt()->format('d/m/Y'),
                'periods' => $periods,
            ];
        }
        return $out;
    }

    public function update(User $user, int $id, array $data): void
    {
        $personal = $this->personalRepo->findOneByUserUuid($user->getUuid());
        if (!$personal) {
            throw new UnprocessableEntityHttpException('Personal não encontrado');
        }

        $training = $this->trainingStandardRepo->find($id);
        if (!$training || $training->getPersonal()->getId() !== $personal->getId()) {
            throw new UnprocessableEntityHttpException('Treino padrão não encontrado');
        }

        $name = $data['name'] ?? null;
        $periodsData = $data['periods'] ?? [];
        if (!$name || !is_array($periodsData)) {
            throw new UnprocessableEntityHttpException('Dados inválidos');
        }

        $training->setName($name);

        foreach ($training->getPeriods() as $p) {
            $this->em->remove($p);
        }
        $this->em->flush();

        foreach ($periodsData as $pData) {
            $period = new TrainingPeriodStandard();
            $period->setName($pData['name']);
            $period->setTrainingStandard($training);
            $this->periodRepo->add($period, true);

            foreach ($pData['exercises'] ?? [] as $exData) {
                $exercise = $this->exerciseRepo->find($exData['id'] ?? null);
                if (!$exercise) {
                    throw new UnprocessableEntityHttpException('Exercício não encontrado');
                }
                $pe = new PeriodExerciseStandard();
                $pe->getDataFromArray($exData);
                $pe->setExercise($exercise);
                $pe->setTrainingPeriodStandard($period);
                $this->periodExerciseStandardRepo->add($pe, true);
            }
        }
    }

    public function delete(User $user, int $id): void
    {
        $personal = $this->personalRepo->findOneByUserUuid($user->getUuid());
        if (!$personal) {
            throw new UnprocessableEntityHttpException('Personal não encontrado');
        }

        $standard = $this->trainingStandardRepo->findOneWithTrainingByPersonal($id, $personal);
        if (!$standard) {
            throw new UnprocessableEntityHttpException('Treino padrão não encontrado');
        }

        $sourceTraining = $standard->getTraining();
        if ($sourceTraining !== null) {
            $sourceTraining->setIsStandard(false);
            $this->em->persist($sourceTraining);
        }

        $this->em->remove($standard);
        $this->em->flush();
    }

    /**
     * Cria um treino padrão a partir de um treino do aluno. Define a FK no padrão
     * e isStandard = true no treino.
     */
    public function createFromTraining(User $user, int $trainingId): TrainingStandard
    {
        $personal = $this->personalRepo->findOneByUserUuid($user->getUuid());
        if (!$personal) {
            throw new UnprocessableEntityHttpException('Personal não encontrado');
        }

        $training = $this->trainingRepo->findOneWithRelations($trainingId, $personal);
        if (!$training) {
            throw new UnprocessableEntityHttpException('Treino não encontrado');
        }

        if ($training->getClient()->getPersonal()->getId() !== $personal->getId()) {
            throw new UnprocessableEntityHttpException('Treino não pertence ao seu cadastro.');
        }

        $standard = new TrainingStandard();
        $standard->setName($training->getName() ?? '');
        $standard->setPersonal($personal);
        $standard->setTraining($training);
        $this->trainingStandardRepo->add($standard, true);

        foreach ($training->getPeriods() as $period) {
            $periodStandard = new TrainingPeriodStandard();
            $periodStandard->setName($period->getName());
            $periodStandard->setTrainingStandard($standard);
            $this->periodRepo->add($periodStandard, true);

            foreach ($period->getPeriodExercises() as $pe) {
                $exercise = $pe->getExercise();
                if (!$exercise) {
                    continue;
                }
                $peStandard = new PeriodExerciseStandard();
                $peStandard->setExercise($exercise);
                $peStandard->setTrainingPeriodStandard($periodStandard);
                $peStandard->getDataFromArray([
                    'series' => $pe->getSeries(),
                    'reps' => $pe->getRepeats(),
                    'rest' => $pe->getRest(),
                    'obs' => $pe->getObservation(),
                ]);
                $this->periodExerciseStandardRepo->add($peStandard, true);
            }
        }

        $training->setIsStandard(true);
        $this->em->persist($training);
        $this->em->flush();

        return $standard;
    }

    /**
     * Exclui o treino padrão vinculado ao treino do aluno e define isStandard = false no treino.
     */
    public function deleteByTraining(User $user, int $trainingId): void
    {
        $personal = $this->personalRepo->findOneByUserUuid($user->getUuid());
        if (!$personal) {
            throw new UnprocessableEntityHttpException('Personal não encontrado');
        }

        $training = $this->trainingRepo->find($trainingId);
        if (!$training || $training->getPersonal()->getId() !== $personal->getId()) {
            throw new UnprocessableEntityHttpException('Treino não encontrado');
        }

        $standard = $this->trainingStandardRepo->findOneByTraining($training);
        if (!$standard) {
            throw new UnprocessableEntityHttpException('Nenhum treino padrão vinculado a este treino.');
        }

        $training->setIsStandard(false);
        $this->em->persist($training);
        $this->em->remove($standard);
        $this->em->flush();
    }

    /**
     * Copia o treino padrão como novo Training para cada um dos clientes indicados.
     *
     * @param int[] $clientIds
     */
    public function applyToClients(User $user, int $trainingStandardId, array $clientIds): void
    {
        $personal = $this->personalRepo->findOneByUserUuid($user->getUuid());
        if (!$personal) {
            throw new UnprocessableEntityHttpException('Personal não encontrado');
        }

        $standard = $this->trainingStandardRepo->findOneWithRelationsByPersonal($trainingStandardId, $personal);
        if (!$standard) {
            throw new UnprocessableEntityHttpException('Treino padrão não encontrado');
        }

        if (empty($clientIds)) {
            throw new UnprocessableEntityHttpException('Selecione pelo menos um aluno.');
        }

        foreach ($clientIds as $clientId) {
            $client = $this->clientRepo->find($clientId);
            if (!$client instanceof Client) {
                throw new UnprocessableEntityHttpException('Cliente não encontrado.');
            }
            $clientPersonal = $client->getPersonal();
            if (!$clientPersonal || $clientPersonal->getId() !== $personal->getId()) {
                throw new UnprocessableEntityHttpException('Cliente não pertence ao seu cadastro.');
            }

            $this->copyStandardToTraining($standard, $personal, $client);
        }
    }

    private function copyStandardToTraining(TrainingStandard $standard, Personal $personal, Client $client): void
    {
        $training = new Training();
        $training->setName($standard->getName() ?? '');
        $training->setPersonal($personal);
        $training->setClient($client);
        $this->trainingRepo->add($training, true);

        foreach ($standard->getPeriods() as $periodStandard) {
            $period = new TrainingPeriod();
            $period->setName($periodStandard->getName());
            $period->setTraining($training);
            $this->trainingPeriodRepo->add($period, true);

            foreach ($periodStandard->getPeriodExercises() as $peStandard) {
                $exercise = $peStandard->getExercise();
                if (!$exercise) {
                    continue;
                }
                $pe = new PeriodExercise();
                $pe->setExercise($exercise);
                $pe->setTrainingPeriod($period);
                $pe->getDataFromArray([
                    'series' => $peStandard->getSeries(),
                    'reps' => $peStandard->getRepeats(),
                    'rest' => $peStandard->getRest(),
                    'obs' => $peStandard->getObservation(),
                ]);
                $this->periodExerciseRepo->add($pe, true);
            }
        }
    }
}
