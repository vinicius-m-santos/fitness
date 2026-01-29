<?php

namespace App\Entity;

use App\Repository\SetExecutionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SetExecutionRepository::class)]
#[ORM\Table(name: 'set_executions')]
class SetExecution
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'setExecutions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?ExerciseExecution $exerciseExecution = null;

    #[ORM\Column(type: 'integer')]
    private int $setNumber = 1;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $loadKg = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $restSeconds = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getExerciseExecution(): ?ExerciseExecution
    {
        return $this->exerciseExecution;
    }

    public function setExerciseExecution(?ExerciseExecution $exerciseExecution): self
    {
        $this->exerciseExecution = $exerciseExecution;
        return $this;
    }

    public function getSetNumber(): int
    {
        return $this->setNumber;
    }

    public function setSetNumber(int $setNumber): self
    {
        $this->setNumber = $setNumber;
        return $this;
    }

    public function getLoadKg(): ?float
    {
        return $this->loadKg;
    }

    public function setLoadKg(?float $loadKg): self
    {
        $this->loadKg = $loadKg;
        return $this;
    }

    public function getRestSeconds(): ?int
    {
        return $this->restSeconds;
    }

    public function setRestSeconds(?int $restSeconds): self
    {
        $this->restSeconds = $restSeconds;
        return $this;
    }
}
