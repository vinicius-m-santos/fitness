<?php

namespace App\Entity;

use App\Repository\TrainingPeriodRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\PeriodExercise;

#[ORM\Entity(repositoryClass: TrainingPeriodRepository::class)]
#[ORM\Table(name: 'training_periods')]
class TrainingPeriod
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['training_client'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 150)]
    #[Groups(['training_client'])]
    private string $name;

    #[ORM\ManyToOne(targetEntity: Training::class, inversedBy: 'periods')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Training $training = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['training_client'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\OneToMany(mappedBy: "trainingPeriod", targetEntity: PeriodExercise::class, cascade: ["persist", "remove"], orphanRemoval: true)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['training_client'])]
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

    public function getTraining(): Training
    {
        return $this->training;
    }

    public function setTraining(?Training $training): self
    {
        $this->training = $training;
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

    public function getPeriodExercises(): Collection
    {
        return $this->periodExercises;
    }

    public function addPeriodExercise(PeriodExercise $pe): self
    {
        if (!$this->periodExercises->contains($pe)) {
            $this->periodExercises[] = $pe;
            $pe->setTrainingPeriod($this);
        }
        return $this;
    }

    public function removePeriodExercise(PeriodExercise $pe): self
    {
        if ($this->periodExercises->removeElement($pe)) {
            if ($pe->getTrainingPeriod() === $this) {
                $pe->setTrainingPeriod(null);
            }
        }
        return $this;
    }
}
