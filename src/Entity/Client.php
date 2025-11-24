<?php

namespace App\Entity;

use App\Validator as AppAssert;
use Doctrine\ORM\Mapping as ORM;
use Exception;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(repositoryClass: \App\Repository\ClientRepository::class)]
#[ORM\Table(name: "clients")]
#[AppAssert\ValidClient]
class Client
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private int $id;

    #[ORM\Column(type: "uuid", unique: true, nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?Uuid $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private string $name;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private string $lastName;

    #[ORM\Column(type: "integer", nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?int $age;

    #[ORM\Column(length: 1, nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?string $gender;

    #[ORM\Column(type: "float", nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?float $weight;

    #[ORM\Column(type: "float", nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?float $height;

    #[ORM\Column(type: "integer", nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?int $objective;

    #[ORM\Column(length: 10, nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?string $bloodPressure = "";

    #[ORM\Column(type: "integer", nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?int $workoutDaysPerWeek;

    #[ORM\Column(type: "boolean", options: ['default' => true])]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private bool $active = true;

    #[ORM\OneToOne(mappedBy:"client", cascade: ['persist', 'remove'])]
    #[Groups(['client_all'])]
    private ?Anamnese $anamnese = null;

    #[ORM\Column(type: "datetime_immutable")]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: "datetime_immutable", nullable: true)]
    #[Groups(['client_all', 'client_list'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\OneToOne(inversedBy: 'client', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $user = null;
    
    #[ORM\ManyToOne(inversedBy: 'clients')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['client_all'])]
    private ?Personal $personal = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?string $observation = '';

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?string $avatarKey = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?string $avatarUrl = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?string $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?string $email = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?array $tags = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PrePersist]
    public function initializeUuid(): void
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }
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

    public function getWeight(): ?float
    {
        return $this->weight;
    }

    public function setWeight(?float $weight): self
    {
        $this->weight = $weight;
        return $this;
    }

    public function getHeight(): ?float
    {
        return $this->height;
    }

    public function setHeight(?float $height): self
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

    public function getPersonal(): ?Personal
    {
        return $this->personal;
    }

    public function setPersonal(?Personal $personal): self
    {
        $this->personal = $personal;
        return $this;
    }

    public function getAnamnese(): ?Anamnese
    {
        return $this->anamnese;
    }

    public function setAnamnese(?Anamnese $anamnese): self
    {
        $this->anamnese = $anamnese;
        return $this;
    }

    public function setObservation(string $observation): self
    {
        $this->observation = $observation;
        return $this;
    }

    public function getObservation(): string
    {
        return $this->observation;
    }

    public function setAvatarKey(?string $avatarKey): self
    {
        $this->avatarKey = $avatarKey;
        return $this;
    }

    public function getAvatarKey(): string|null
    {
        return $this->avatarKey;
    }

    public function setAvatarUrl(?string $avatarUrl): self
    {
        $this->avatarUrl = $avatarUrl;
        return $this;
    }

    public function getAvatarUrl(): string|null
    {
        return $this->avatarUrl;
    }

    public function setPhone(?string $phone): self
    {
        $this->phone = $phone;
        return $this;
    }

    public function getPhone(): string|null
    {
        return $this->phone;
    }

    public function setEmail(?string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getEmail(): string|null
    {
        return $this->email;
    }

    public function getUuid(): string
    {
        return $this->uuid;
    }

    public function getTags(): array|null
    {
        return $this->tags;
    }

    public function setTags(array $tags): self
    {
        $this->tags = $tags;
        return $this;
    }

    public function getDataFromArray(array $data): self
    {
        if (isset($data['name']) && !empty($data['name'])) {
            $this->name = $data['name'];
        }

        if (isset($data['lastName']) && !empty($data['lastName'])) {
            $this->lastName = $data['lastName'];
        }

        if (isset($data['age']) && !empty($data['age'])) {
            $this->age = (int) $data['age'];
        }

        if (isset($data['gender']) && !empty($data['gender'])) {
            $this->gender = $data['gender'];
        }

        if (isset($data['weight']) && !empty($data['weight'])) {
            $data['weight'] = str_replace(',', '.', $data['weight']);
            $this->weight = (float) preg_replace('/[^0-9.,]/', '', $data['weight']);
        }

        if (isset($data['height']) && !empty($data['height'])) {
            $this->height = (float) preg_replace('/\D/', '', $data['height']);
        }

        if (isset($data['objective']) && !empty($data['objective'])) {
            $this->objective = (int) $data['objective'];
        }

        if (isset($data['workoutDaysPerWeek']) && !empty($data['workoutDaysPerWeek'])) {
            $this->workoutDaysPerWeek = (int) $data['workoutDaysPerWeek'];
        }

        if (isset($data['bloodPressure']) && !empty($data['bloodPressure'])) {
            $this->bloodPressure = (int) $data['bloodPressure'];
        }

        if (isset($data['active']) && !empty($data['active'])) {
            $this->active = $data['active'];
        }

        if (isset($data['user']) && !empty($data['user'])) {
            $this->user = $data['user'];
        }

        if (isset($data['observation']) && !empty($data['observation'])) {
            $this->observation = $data['observation'];
        }

        if (isset($data['avatarKey']) && !empty($data['avatarKey'])) {
            $this->avatarKey = $data['avatarKey'];
        }

        if (isset($data['avatarUrl']) && !empty($data['avatarUrl'])) {
            $this->avatarUrl = $data['avatarUrl'];
        }

        if (isset($data['phone'])) {
            $this->phone = $data['phone'];
        }

        if (isset($data['email']) && !empty($data['email'])) {
            $this->email = $data['email'];
        }

        if (is_array($data['tags'])) {
            $this->tags = $data['tags'];
        }

        return $this;
    }
}
