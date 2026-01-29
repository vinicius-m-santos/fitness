<?php

namespace App\Entity;

use App\Repository\PeriodExerciseStandardRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PeriodExerciseStandardRepository::class)]
#[ORM\Table(name: 'period_exercise_standards')]
#[ORM\HasLifecycleCallbacks]
class PeriodExerciseStandard
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: TrainingPeriodStandard::class, inversedBy: 'periodExercises')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?TrainingPeriodStandard $trainingPeriodStandard = null;

    #[ORM\ManyToOne(targetEntity: Exercise::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Exercise $exercise = null;

    #[ORM\Column(type: 'string', length: 50, nullable: true)]
    private ?string $series = null;

    #[ORM\Column(type: 'string', length: 50, nullable: true)]
    private ?string $repeats = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $rest = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $observation = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTrainingPeriodStandard(): ?TrainingPeriodStandard
    {
        return $this->trainingPeriodStandard;
    }

    public function setTrainingPeriodStandard(?TrainingPeriodStandard $trainingPeriodStandard): self
    {
        $this->trainingPeriodStandard = $trainingPeriodStandard;
        return $this;
    }

    public function getExercise(): ?Exercise
    {
        return $this->exercise;
    }

    public function setExercise(?Exercise $exercise): self
    {
        $this->exercise = $exercise;
        return $this;
    }

    public function getSeries(): ?string
    {
        return $this->series;
    }

    public function setSeries(?string $series): self
    {
        $this->series = $series;
        return $this;
    }

    public function getRepeats(): ?string
    {
        return $this->repeats;
    }

    public function setRepeats(?string $repeats): self
    {
        $this->repeats = $repeats;
        return $this;
    }

    public function getRest(): ?string
    {
        return $this->rest;
    }

    public function setRest(?string $rest): self
    {
        $this->rest = $rest;
        return $this;
    }

    public function getObservation(): ?string
    {
        return $this->observation;
    }

    public function setObservation(?string $observation): self
    {
        $this->observation = $observation;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function getDataFromArray(array $data): self
    {
        if (isset($data['rest'])) {
            $this->rest = $data['rest'];
        }
        if (isset($data['reps'])) {
            $this->repeats = $data['reps'];
        }
        if (isset($data['series'])) {
            $this->series = $data['series'];
        }
        if (isset($data['obs'])) {
            $this->observation = $data['obs'];
        }
        return $this;
    }
}
