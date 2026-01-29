<?php

namespace App\Entity;

use App\Repository\TrainingPeriodStandardRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TrainingPeriodStandardRepository::class)]
#[ORM\Table(name: 'training_period_standards')]
class TrainingPeriodStandard
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 150)]
    private string $name;

    #[ORM\ManyToOne(targetEntity: TrainingStandard::class, inversedBy: 'periods')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?TrainingStandard $trainingStandard = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    /** @var Collection<int, PeriodExerciseStandard> */
    #[ORM\OneToMany(mappedBy: 'trainingPeriodStandard', targetEntity: PeriodExerciseStandard::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $periodExercises;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->periodExercises = new ArrayCollection();
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

    public function getTrainingStandard(): ?TrainingStandard
    {
        return $this->trainingStandard;
    }

    public function setTrainingStandard(?TrainingStandard $trainingStandard): self
    {
        $this->trainingStandard = $trainingStandard;
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

    /** @return Collection<int, PeriodExerciseStandard> */
    public function getPeriodExercises(): Collection
    {
        return $this->periodExercises;
    }

    public function addPeriodExercise(PeriodExerciseStandard $pe): self
    {
        if (!$this->periodExercises->contains($pe)) {
            $this->periodExercises->add($pe);
            $pe->setTrainingPeriodStandard($this);
        }
        return $this;
    }

    public function removePeriodExercise(PeriodExerciseStandard $pe): self
    {
        if ($this->periodExercises->removeElement($pe)) {
            if ($pe->getTrainingPeriodStandard() === $this) {
                $pe->setTrainingPeriodStandard(null);
            }
        }
        return $this;
    }
}
