<?php

namespace App\Entity;

use App\Repository\ExerciseRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ExerciseRepository::class)]
#[ORM\Table(name: 'exercises')]
class Exercise
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['exercise_all', 'training_client'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 150)]
    #[Groups(['exercise_all', 'training_client'])]
    private string $name;

    #[ORM\ManyToOne(targetEntity: ExerciseCategory::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['exercise_all', 'training_client'])]
    private ExerciseCategory $exerciseCategory;

    #[ORM\ManyToOne(targetEntity: MuscleGroup::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['exercise_all', 'training_client'])]
    private MuscleGroup $muscleGroup;

    #[ORM\ManyToOne(targetEntity: Personal::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    #[Groups(['exercise_all', 'training_client'])]
    private ?Personal $personal = null;

    #[ORM\OneToMany(mappedBy: "trainingPeriod", targetEntity: PeriodExercise::class, cascade: ["persist", "remove"])]
    private Collection $periodExercises;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['exercise_all', 'training_client'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['exercise_all', 'training_client'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['exercise_all', 'training_client'])]
    private bool $isStandard = false;

    /** @var int[] Array of personal IDs who favorited this exercise */
    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['exercise_all', 'training_client'])]
    private ?array $favorite = [];

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

    public function getExerciseCategory(): ExerciseCategory
    {
        return $this->exerciseCategory;
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

    public function setExerciseCategory(ExerciseCategory $exerciseCategory): self
    {
        $this->exerciseCategory = $exerciseCategory;
        return $this;
    }

    public function getMuscleGroup(): MuscleGroup
    {
        return $this->muscleGroup;
    }

    public function setMuscleGroup(MuscleGroup $muscleGroup): self
    {
        $this->muscleGroup = $muscleGroup;
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

    public function isStandard(): bool
    {
        return $this->isStandard;
    }

    public function setIsStandard(bool $isStandard): self
    {
        $this->isStandard = $isStandard;
        return $this;
    }

    /** @return int[] */
    public function getFavorite(): array
    {
        return $this->favorite ?? [];
    }

    /** @param int[] $favorite */
    public function setFavorite(array $favorite): self
    {
        $this->favorite = $favorite;
        return $this;
    }
}
