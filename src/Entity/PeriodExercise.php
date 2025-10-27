<?php

namespace App\Entity;

use App\Repository\PeriodExerciseRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PeriodExerciseRepository::class)]
#[ORM\Table(name: "period_exercises")]
#[ORM\HasLifecycleCallbacks]
class PeriodExercise
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['training_client'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: TrainingPeriod::class, inversedBy: "periodExercises")]
    #[ORM\JoinColumn(nullable: false, onDelete: "CASCADE")]
    #[Groups(['training_client'])]
    private ?TrainingPeriod $trainingPeriod = null;

    #[ORM\ManyToOne(targetEntity: Exercise::class, inversedBy: "periodExercises")]
    #[ORM\JoinColumn(nullable: false, onDelete: "CASCADE")]
    #[Groups(['training_client'])]
    private ?Exercise $exercise = null;

    #[ORM\Column(type: "integer", nullable: true)]
    #[Groups(['training_client'])]
    private ?string $series = null;

    #[ORM\Column(type: "integer", nullable: true)]
    #[Groups(['training_client'])]
    private ?string $repeats = null;

    #[ORM\Column(type: "string", length: 50, nullable: true)]
    #[Groups(['training_client'])]
    private ?string $rest = null;

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    #[Groups(['training_client'])]
    private ?string $observation = null;

    #[ORM\Column(type: "datetime_immutable")]
    #[Groups(['training_client'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: "datetime_immutable", nullable: true)]
    #[Groups(['training_client'])]
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

    public function getTrainingPeriod(): ?TrainingPeriod
    {
        return $this->trainingPeriod;
    }

    public function setTrainingPeriod(?TrainingPeriod $trainingPeriod): self
    {
        $this->trainingPeriod = $trainingPeriod;
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

    public function getSeries(): ?int
    {
        return $this->series;
    }

    public function setSeries(?int $series): self
    {
        $this->series = $series;
        return $this;
    }

    public function getRepeats(): ?int
    {
        return $this->repeats;
    }

    public function setRepeats(?int $repeats): self
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
