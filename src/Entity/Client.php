<?php

namespace App\Entity;

use App\Validator as AppAssert;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: \App\Repository\ClientRepository::class)]
#[ORM\Table(name: "clients")]
#[AppAssert\ValidClient]
class Client
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['client_all'])]
    private int $id;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all'])]
    private string $name;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all'])]
    private string $lastName;

    #[ORM\Column(type: "integer", nullable: true)]
    #[Groups(['client_all'])]
    private int $age;

    #[ORM\Column(length: 1)]
    #[Groups(['client_all'])]
    private string $gender;

    #[ORM\Column(type: "float", nullable: true)]
    #[Groups(['client_all'])]
    private ?float $weight;

    #[ORM\Column(type: "float", nullable: true)]
    #[Groups(['client_all'])]
    private ?float $height;

    #[ORM\Column(type: "integer")]
    #[Groups(['client_all'])]
    private int $objective;

    #[ORM\Column(length: 10)]
    #[Groups(['client_all'])]
    private string $bloodPressure = "";

    #[ORM\Column(type: "integer")]
    #[Groups(['client_all'])]
    private int $workoutDaysPerWeek;

    #[ORM\Column(type: "boolean", options: ['default' => true])]
    #[Groups(['client_all'])]
    private bool $active = true;

    #[ORM\OneToOne(mappedBy:"client", cascade: ['persist', 'remove'])]
    #[Groups(['client_all'])]
    private ?Anamnese $anamnese = null;

    #[ORM\Column(type: "datetime_immutable")]
    #[Groups(['client_all'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: "datetime_immutable", nullable: true)]
    #[Groups(['client_all'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: "clients")]
    #[ORM\JoinColumn(name: "user_id", referencedColumnName: "id", nullable: false)]
    #[Groups(['client_all'])]
    private User $user;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): int
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

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): self
    {
        $this->lastName = $lastName;
        return $this;
    }

    public function getAge(): int
    {
        return $this->age;
    }

    public function setAge(int $age): self
    {
        $this->age = $age;
        return $this;
    }

    public function getGender(): string
    {
        return $this->gender;
    }

    public function setGender(string $gender): self
    {
        $this->gender = $gender;
        return $this;
    }

    public function getWeight(): float
    {
        return $this->weight;
    }

    public function setWeight(float $weight): self
    {
        $this->weight = $weight;
        return $this;
    }

    public function getHeight(): float
    {
        return $this->height;
    }

    public function setHeight(float $height): self
    {
        $this->height = $height;
        return $this;
    }

    public function getObjective(): int
    {
        return $this->objective;
    }

    public function setObjective(int $objective): self
    {
        $this->objective = $objective;
        return $this;
    }

    public function getBloodPressure(): string
    {
        return $this->bloodPressure;
    }

    public function setBloodPressure(string $bloodPressure): self
    {
        $this->bloodPressure = $bloodPressure;
        return $this;
    }

    public function getWorkoutDaysPerWeek(): int
    {
        return $this->workoutDaysPerWeek;
    }

    public function setWorkoutDaysPerWeek(int $workoutDaysPerWeek): self
    {
        $this->workoutDaysPerWeek = $workoutDaysPerWeek;
        return $this;
    }

    public function getActive(): bool
    {
        return $this->active;
    }

    public function setActive(bool $active): self
    {
        $this->active = $active;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;
        return $this;
    }

    public function getDataFromArray(array $data): self
    {
        if (isset($data['name'])) {
            $this->name = $data['name'];
        }

        if (isset($data['lastName'])) {
            $this->lastName = $data['lastName'];
        }

        if (isset($data['age'])) {
            $this->age = (int) $data['age'];
        }

        if (isset($data['gender'])) {
            $this->gender = $data['gender'];
        }

        if (isset($data['weight'])) {
            $this->weight = (float) $data['weight'];
        }

        if (isset($data['height'])) {
            $this->height = (float) $data['height'];
        }

        if (isset($data['objective'])) {
            $this->objective = (int) $data['objective'];
        }

        if (isset($data['workoutDaysPerWeek'])) {
            $this->workoutDaysPerWeek = (int) $data['workoutDaysPerWeek'];
        }

        if (isset($data['bloodPressureProblem'])) {
            $this->bloodPressure = (int) $data['bloodPressureProblem'];
        }

        if (isset($data['active'])) {
            $this->active = $data['active'];
        }

        if (isset($data['createdAt'])) {
            $this->active = $data['createdAt'];
        }

        if (isset($data['user'])) {
            $this->active = $data['user'];
        }

        return $this;
    }
}
