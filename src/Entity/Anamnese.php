<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: \App\Repository\AnamneseRepository::class)]
#[ORM\Table(name: "anamnese")]
class Anamnese
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['client_all'])]
    private int $id;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all'])]
    private string $medicalRestriction;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all'])]
    private string $cronicalPain;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all'])]
    private string $controledMedicine;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all'])]
    private string $heartProblem;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all'])]
    private string $recentSurgery;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all'])]
    private string $timeWithoutGym;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all'])]
    private string $ocupation;

    #[ORM\Column(type: "datetime_immutable")]
    #[Groups(['client_all'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: "datetime_immutable", nullable: true)]
    #[Groups(['client_all'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getMedicalRestriction(): string
    {
        return $this->medicalRestriction;
    }

    public function setMedicalRestriction(string $medicalRestriction): self
    {
        $this->medicalRestriction = $medicalRestriction;
        return $this;
    }

    public function getCronicalPain(): string
    {
        return $this->cronicalPain;
    }

    public function setCronicalPain(string $cronicalPain): self
    {
        $this->cronicalPain = $cronicalPain;
        return $this;
    }

    public function getControledMedicine(): string
    {
        return $this->controledMedicine;
    }

    public function setControledMedicine(string $controledMedicine): self
    {
        $this->controledMedicine = $controledMedicine;
        return $this;
    }

    public function getHeartProblem(): float
    {
        return $this->heartProblem;
    }

    public function setHeartProblem(float $heartProblem): self
    {
        $this->heartProblem = $heartProblem;
        return $this;
    }

    public function getRecentSurgery(): int
    {
        return $this->recentSurgery;
    }

    public function setRecentSurgery(int $recentSurgery): self
    {
        $this->recentSurgery = $recentSurgery;
        return $this;
    }

    public function getTimeWithoutGym(): string
    {
        return $this->timeWithoutGym;
    }

    public function setTimeWithoutGym(string $timeWithoutGym): self
    {
        $this->timeWithoutGym = $timeWithoutGym;
        return $this;
    }

    public function getOcupation(): string
    {
        return $this->ocupation;
    }

    public function setOcupation(string $ocupation): self
    {
        $this->ocupation = $ocupation;
        return $this;
    }

    public function getDataFromArray(array $data): self
    {
        if (isset($data['medicalRestriction'])) {
            $this->medicalRestriction = $data['medicalRestriction'];
        }

        if (isset($data['cronicalPain'])) {
            $this->cronicalPain = $data['cronicalPain'];
        }

        if (isset($data['controledMedicine'])) {
            $this->controledMedicine = $data['controledMedicine'];
        }

        if (isset($data['heartProblem'])) {
            $this->heartProblem = $data['heartProblem'];
        }

        if (isset($data['recentSurgery'])) {
            $this->recentSurgery = $data['recentSurgery'];
        }

        if (isset($data['timeWithoutGym'])) {
            $this->timeWithoutGym = $data['timeWithoutGym'];
        }

        if (isset($data['ocupation'])) {
            $this->ocupation = $data['ocupation'];
        }

        return $this;
    }
}
