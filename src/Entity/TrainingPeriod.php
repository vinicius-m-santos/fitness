<?php

namespace App\Entity;

use App\Repository\TrainingPeriodRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TrainingPeriodRepository::class)]
#[ORM\Table(name: 'training_periods')]
class TrainingPeriod
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 150)]
    private string $name;

    #[ORM\ManyToOne(targetEntity: Training::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Training $training;

    #[ORM\ManyToOne(targetEntity: Exercise::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Exercise $exercise;

    #[ORM\Column(type: 'string', length: 50)]
    private string $rest;

    #[ORM\Column(type: 'integer')]
    private int $repeats;

    #[ORM\Column(type: 'integer')]
    private int $series;

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

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getTraining(): Training
    {
        return $this->training;
    }

    public function setTraining(Training $training): self
    {
        $this->training = $training;

        return $this;
    }

    public function getExercise(): Exercise
    {
        return $this->exercise;
    }

    public function setExercise(Exercise $exercise): self
    {
        $this->exercise = $exercise;

        return $this;
    }

    public function getRest(): string
    {
        return $this->rest;
    }

    public function setRest(string $rest): self
    {
        $this->rest = $rest;

        return $this;
    }

    public function getRepeats(): int
    {
        return $this->repeats;
    }

    public function setRepeats(int $repeats): self
    {
        $this->repeats = $repeats;

        return $this;
    }

    public function getSeries(): int
    {
        return $this->series;
    }

    public function setSeries(int $series): self
    {
        $this->series = $series;

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

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }
}
