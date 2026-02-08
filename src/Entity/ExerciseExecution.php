<?php

namespace App\Entity;

use App\Repository\ExerciseExecutionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ExerciseExecutionRepository::class)]
#[ORM\Table(name: 'exercise_executions')]
class ExerciseExecution
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'exerciseExecutions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?TrainingExecution $trainingExecution = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?PeriodExercise $periodExercise = null;

    #[ORM\Column(type: 'integer', options: ['default' => 1])]
    private int $executionOrder = 1;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $durationSeconds = null;

    /** Se false: exercício não foi iniciado ou teve duração < 1 min. Não conta em métricas. */
    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $executed = true;

    /**
     * @var Collection<int, SetExecution>
     */
    #[ORM\OneToMany(mappedBy: 'exerciseExecution', targetEntity: SetExecution::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['setNumber' => 'ASC'])]
    private Collection $setExecutions;

    public function __construct()
    {
        $this->setExecutions = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTrainingExecution(): ?TrainingExecution
    {
        return $this->trainingExecution;
    }

    public function setTrainingExecution(?TrainingExecution $trainingExecution): self
    {
        $this->trainingExecution = $trainingExecution;
        return $this;
    }

    public function getPeriodExercise(): ?PeriodExercise
    {
        return $this->periodExercise;
    }

    public function setPeriodExercise(?PeriodExercise $periodExercise): self
    {
        $this->periodExercise = $periodExercise;
        return $this;
    }

    public function getExecutionOrder(): int
    {
        return $this->executionOrder;
    }

    public function setExecutionOrder(int $executionOrder): self
    {
        $this->executionOrder = $executionOrder;
        return $this;
    }

    public function getDurationSeconds(): ?int
    {
        return $this->durationSeconds;
    }

    public function setDurationSeconds(?int $durationSeconds): self
    {
        $this->durationSeconds = $durationSeconds;
        return $this;
    }

    public function isExecuted(): bool
    {
        return $this->executed;
    }

    public function setExecuted(bool $executed): self
    {
        $this->executed = $executed;
        return $this;
    }

    /**
     * @return Collection<int, SetExecution>
     */
    public function getSetExecutions(): Collection
    {
        return $this->setExecutions;
    }

    public function addSetExecution(SetExecution $setExecution): self
    {
        if (!$this->setExecutions->contains($setExecution)) {
            $this->setExecutions->add($setExecution);
            $setExecution->setExerciseExecution($this);
        }
        return $this;
    }
}
