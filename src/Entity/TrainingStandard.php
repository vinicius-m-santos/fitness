<?php

namespace App\Entity;

use App\Repository\TrainingStandardRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TrainingStandardRepository::class)]
#[ORM\Table(name: 'training_standards')]
#[ORM\HasLifecycleCallbacks]
class TrainingStandard
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'trainingsStandard')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Personal $personal = null;

    #[ORM\ManyToOne(targetEntity: Training::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Training $training = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $dueDate = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updatedAt = null;

    /** @var Collection<int, TrainingPeriodStandard> */
    #[ORM\OneToMany(mappedBy: 'trainingStandard', targetEntity: TrainingPeriodStandard::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $periods;

    public function __construct()
    {
        $this->periods = new ArrayCollection();
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
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

    public function getPersonal(): ?Personal
    {
        return $this->personal;
    }

    public function setPersonal(?Personal $personal): self
    {
        $this->personal = $personal;
        return $this;
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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getDueDate(): ?\DateTimeImmutable
    {
        return $this->dueDate;
    }

    public function setDueDate(?\DateTimeImmutable $dueDate): self
    {
        $this->dueDate = $dueDate;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    /** @return Collection<int, TrainingPeriodStandard> */
    public function getPeriods(): Collection
    {
        return $this->periods;
    }

    public function addPeriod(TrainingPeriodStandard $period): self
    {
        if (!$this->periods->contains($period)) {
            $this->periods->add($period);
            $period->setTrainingStandard($this);
        }
        return $this;
    }

    public function removePeriod(TrainingPeriodStandard $period): self
    {
        if ($this->periods->removeElement($period)) {
            if ($period->getTrainingStandard() === $this) {
                $period->setTrainingStandard(null);
            }
        }
        return $this;
    }
}
