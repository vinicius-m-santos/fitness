<?php

namespace App\Entity;

use App\Enum\WorkoutRatingEnum;
use App\Repository\TrainingExecutionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TrainingExecutionRepository::class)]
#[ORM\Table(name: 'training_executions')]
class TrainingExecution
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Training $training = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Client $client = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $startedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $finishedAt = null;

    #[ORM\Column(length: 20, nullable: true, enumType: WorkoutRatingEnum::class)]
    private ?WorkoutRatingEnum $rating = null;

    /**
     * @var Collection<int, ExerciseExecution>
     */
    #[ORM\OneToMany(mappedBy: 'trainingExecution', targetEntity: ExerciseExecution::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $exerciseExecutions;

    public function __construct()
    {
        $this->exerciseExecutions = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTraining(): ?Training
    {
        return $this->training;
    }

    public function setTraining(?Training $training): self
    {
        $this->training = $training;
        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): self
    {
        $this->client = $client;
        return $this;
    }

    public function getStartedAt(): ?\DateTimeImmutable
    {
        return $this->startedAt;
    }

    public function setStartedAt(\DateTimeImmutable $startedAt): self
    {
        $this->startedAt = $startedAt;
        return $this;
    }

    public function getFinishedAt(): ?\DateTimeImmutable
    {
        return $this->finishedAt;
    }

    public function setFinishedAt(?\DateTimeImmutable $finishedAt): self
    {
        $this->finishedAt = $finishedAt;
        return $this;
    }

    public function getRating(): ?WorkoutRatingEnum
    {
        return $this->rating;
    }

    public function setRating(?WorkoutRatingEnum $rating): self
    {
        $this->rating = $rating;
        return $this;
    }

    /**
     * @return Collection<int, ExerciseExecution>
     */
    public function getExerciseExecutions(): Collection
    {
        return $this->exerciseExecutions;
    }

    public function addExerciseExecution(ExerciseExecution $exerciseExecution): self
    {
        if (!$this->exerciseExecutions->contains($exerciseExecution)) {
            $this->exerciseExecutions->add($exerciseExecution);
            $exerciseExecution->setTrainingExecution($this);
        }
        return $this;
    }
}
