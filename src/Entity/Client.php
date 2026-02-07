<?php

namespace App\Entity;

use App\Validator as AppAssert;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
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
    #[Groups(['client_all', 'anamnese_all', 'client_list', 'measurement_all'])]
    private int $id;

    #[ORM\Column(type: "uuid", unique: true, nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?Uuid $uuid = null;

    /** @var array{name?: string, lastName?: string, gender?: string, active?: bool}|null Dados pendentes quando User ainda não existe (fluxo de criação) */
    private ?array $pendingUserData = null;

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

    #[ORM\OneToOne(mappedBy: "client", cascade: ['persist', 'remove'])]
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
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'clients')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['client_all'])]
    private ?Personal $personal = null;

    #[ORM\OneToMany(mappedBy: 'client', targetEntity: Training::class, cascade: ['persist', 'remove'])]
    private Collection $trainings;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?string $observation = '';

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private ?array $tags = null;

    #[ORM\Column(type: "boolean", options: ['default' => false])]
    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    private bool $hasRegistered = false;

    #[ORM\OneToMany(mappedBy: 'client', targetEntity: Gallery::class, orphanRemoval: true)]
    #[Groups(['client_all'])]
    private Collection $galleries;

    #[ORM\OneToMany(mappedBy: 'client', targetEntity: Measurement::class, orphanRemoval: true)]
    #[Groups(['client_all'])]
    private Collection $measurements;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->galleries = new ArrayCollection();
        $this->measurements = new ArrayCollection();
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

    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    public function getName(): string
    {
        if ($this->user !== null) {
            return $this->user->getFirstName();
        }
        return $this->pendingUserData['name'] ?? '';
    }

    public function setPendingName(?string $name): self
    {
        $this->pendingUserData = $this->pendingUserData ?? [];
        $this->pendingUserData['name'] = $name ?? '';
        return $this;
    }

    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    public function getLastName(): string
    {
        if ($this->user !== null) {
            return $this->user->getLastName();
        }
        return $this->pendingUserData['lastName'] ?? '';
    }

    public function setPendingLastName(?string $lastName): self
    {
        $this->pendingUserData = $this->pendingUserData ?? [];
        $this->pendingUserData['lastName'] = $lastName ?? '';
        return $this;
    }

    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    public function getGender(): ?string
    {
        if ($this->user !== null) {
            return $this->user->getGender();
        }
        return $this->pendingUserData['gender'] ?? null;
    }

    public function setPendingGender(?string $gender): self
    {
        $this->pendingUserData = $this->pendingUserData ?? [];
        $this->pendingUserData['gender'] = $gender;
        return $this;
    }

    #[Groups(['client_all', 'anamnese_all', 'client_list'])]
    public function getActive(): bool
    {
        if ($this->user !== null) {
            return $this->user->isActive();
        }
        return $this->pendingUserData['active'] ?? true;
    }

    public function setPendingActive(bool $active): self
    {
        $this->pendingUserData = $this->pendingUserData ?? [];
        $this->pendingUserData['active'] = $active;
        return $this;
    }

    public function getPendingUserData(): ?array
    {
        return $this->pendingUserData;
    }

    public function clearPendingUserData(): self
    {
        $this->pendingUserData = null;
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

    /**
     * @return Gallery[]
     */
    public function getGalleries(): Collection
    {
        return $this->galleries;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUser(): ?User
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

    public function getHasRegistered(): bool
    {
        return $this->hasRegistered;
    }

    public function setHasRegistered(bool $hasRegistered): self
    {
        $this->hasRegistered = $hasRegistered;
        return $this;
    }

    public function addGallery(Gallery $gallery): self
    {
        if (!$this->galleries->contains($gallery)) {
            $this->galleries->add($gallery);
            $gallery->setClient($this);
        }

        return $this;
    }

    public function removeGallery(Gallery $gallery): self
    {
        if ($this->galleries->removeElement($gallery)) {
            if ($gallery->getClient() === $this) {
                $gallery->setClient(null);
            }
        }

        return $this;
    }

    /**
     * @return Measurement[]
     */
    public function getMeasurements(): Collection
    {
        return $this->measurements;
    }

    public function addMeasurement(Measurement $measurement): self
    {
        if (!$this->measurements->contains($measurement)) {
            $this->measurements->add($measurement);
            $measurement->setClient($this);
        }

        return $this;
    }

    public function removeMeasurement(Measurement $measurement): self
    {
        if ($this->measurements->removeElement($measurement)) {
            if ($measurement->getClient() === $this) {
                $measurement->setClient(null);
            }
        }

        return $this;
    }

    public function getDataFromArray(array $data): self
    {
        $user = $this->user;
        if ($user !== null) {
            if (isset($data['name']) && !empty($data['name'])) {
                $user->setFirstName($data['name']);
            }
            if (isset($data['lastName']) && !empty($data['lastName'])) {
                $user->setLastName($data['lastName']);
            }
            if (isset($data['gender'])) {
                $user->setGender($data['gender'] ?? null);
            }
            if (isset($data['birthDate']) && !empty($data['birthDate'])) {
                $birthDate = \DateTimeImmutable::createFromFormat('Y-m-d', $data['birthDate']);
                if ($birthDate) {
                    $user->setBirthDate($birthDate);
                }
            }
            if (isset($data['active'])) {
                $user->setActive((bool) $data['active']);
            }
            if (isset($data['phone'])) {
                $user->setPhone($data['phone'] ?? null);
            }
        } else {
            if (isset($data['name'])) {
                $this->setPendingName($data['name']);
            }
            if (isset($data['lastName'])) {
                $this->setPendingLastName($data['lastName']);
            }
            if (isset($data['gender'])) {
                $this->setPendingGender($data['gender'] ?? null);
            }
            if (isset($data['active'])) {
                $this->setPendingActive((bool) $data['active']);
            }
        }

        if (isset($data['weight'])) {
            $data['weight'] = str_replace(',', '.', $data['weight']);
            $this->weight = (float) preg_replace('/[^0-9.,]/', '', $data['weight']);
        }

        if (isset($data['height'])) {
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

        if (isset($data['user']) && !empty($data['user'])) {
            $this->user = $data['user'];
        }

        if (isset($data['observation'])) {
            $this->observation = $data['observation'];
        }

        if (isset($data['tags']) && is_array($data['tags'])) {
            $this->tags = $data['tags'];
        }

        return $this;
    }
}
