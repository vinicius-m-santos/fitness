<?php

namespace App\Entity;

use App\Repository\MeasurementRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(repositoryClass: MeasurementRepository::class)]
#[ORM\Table(name: "measurements")]
class Measurement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['measurement_all', 'client_all'])]
    private int $id;

    #[ORM\ManyToOne(inversedBy: 'measurements')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['measurement_all'])]
    private ?Client $client = null;

    #[ORM\Column(type: "datetime_immutable")]
    #[Groups(['measurement_all', 'client_all'])]
    private \DateTimeImmutable $date;

    #[ORM\Column(type: "float")]
    #[Groups(['measurement_all', 'client_all'])]
    private float $rightArm;

    #[ORM\Column(type: "float")]
    #[Groups(['measurement_all', 'client_all'])]
    private float $leftArm;

    #[ORM\Column(type: "float")]
    #[Groups(['measurement_all', 'client_all'])]
    private float $waist;

    #[ORM\Column(type: "float")]
    #[Groups(['measurement_all', 'client_all'])]
    private float $rightLeg;

    #[ORM\Column(type: "float")]
    #[Groups(['measurement_all', 'client_all'])]
    private float $leftLeg;

    #[ORM\Column(type: "float")]
    #[Groups(['measurement_all', 'client_all'])]
    private float $chest;

    #[ORM\Column(type: "float", nullable: true)]
    #[Groups(['measurement_all', 'client_all'])]
    private ?float $weight = null;

    #[ORM\Column(type: "float", nullable: true)]
    #[Groups(['measurement_all', 'client_all'])]
    private ?float $fatPercentage = null;

    #[ORM\Column(type: "float", nullable: true)]
    #[Groups(['measurement_all', 'client_all'])]
    private ?float $leanMass = null;

    #[ORM\Column(type: "datetime_immutable")]
    #[Groups(['measurement_all', 'client_all'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: "datetime_immutable", nullable: true)]
    #[Groups(['measurement_all', 'client_all'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->date = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): int
    {
        return $this->id;
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

    public function getDate(): \DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(\DateTimeImmutable $date): self
    {
        $this->date = $date;
        return $this;
    }

    public function getRightArm(): float
    {
        return $this->rightArm;
    }

    public function setRightArm(float $rightArm): self
    {
        $this->rightArm = $rightArm;
        return $this;
    }

    public function getLeftArm(): float
    {
        return $this->leftArm;
    }

    public function setLeftArm(float $leftArm): self
    {
        $this->leftArm = $leftArm;
        return $this;
    }

    public function getWaist(): float
    {
        return $this->waist;
    }

    public function setWaist(float $waist): self
    {
        $this->waist = $waist;
        return $this;
    }

    public function getRightLeg(): float
    {
        return $this->rightLeg;
    }

    public function setRightLeg(float $rightLeg): self
    {
        $this->rightLeg = $rightLeg;
        return $this;
    }

    public function getLeftLeg(): float
    {
        return $this->leftLeg;
    }

    public function setLeftLeg(float $leftLeg): self
    {
        $this->leftLeg = $leftLeg;
        return $this;
    }

    public function getChest(): float
    {
        return $this->chest;
    }

    public function setChest(float $chest): self
    {
        $this->chest = $chest;
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

    public function getFatPercentage(): ?float
    {
        return $this->fatPercentage;
    }

    public function setFatPercentage(?float $fatPercentage): self
    {
        $this->fatPercentage = $fatPercentage;
        return $this;
    }

    public function getLeanMass(): ?float
    {
        return $this->leanMass;
    }

    public function setLeanMass(?float $leanMass): self
    {
        $this->leanMass = $leanMass;
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

    public function getDataFromArray(array $data): self
    {
        if (!empty($data['date'])) {
            if (is_string($data['date'])) {
                $this->date = new \DateTimeImmutable($data['date']);
            } elseif ($data['date'] instanceof \DateTimeImmutable) {
                $this->date = $data['date'];
            }
        }

        if (isset($data['rightArm'])) {
            $this->rightArm = (float) $data['rightArm'];
        }

        if (isset($data['leftArm'])) {
            $this->leftArm = (float) $data['leftArm'];
        }

        if (isset($data['waist'])) {
            $this->waist = (float) $data['waist'];
        }

        if (isset($data['rightLeg'])) {
            $this->rightLeg = (float) $data['rightLeg'];
        }

        if (isset($data['leftLeg'])) {
            $this->leftLeg = (float) $data['leftLeg'];
        }

        if (isset($data['chest'])) {
            $this->chest = (float) $data['chest'];
        }

        if (isset($data['weight'])) {
            $this->weight = $data['weight'] !== null && $data['weight'] !== '' ? (float) $data['weight'] : null;
        }

        if (isset($data['fatPercentage'])) {
            $this->fatPercentage = $data['fatPercentage'] !== null && $data['fatPercentage'] !== '' ? (float) $data['fatPercentage'] : null;
        }

        if (isset($data['leanMass'])) {
            $this->leanMass = $data['leanMass'] !== null && $data['leanMass'] !== '' ? (float) $data['leanMass'] : null;
        }

        return $this;
    }
}
