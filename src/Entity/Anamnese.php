<?php

namespace App\Entity;

use App\Validator as AppAssert;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: \App\Repository\AnamneseRepository::class)]
#[ORM\Table(name: "anamnese")]
#[AppAssert\ValidAnamnese]
class Anamnese
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['client_all', 'anamnese_all'])]
    private int $id;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all', 'anamnese_all'])]
    private string $medicalRestriction = "";

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client_all', 'anamnese_all'])]
    private string $previousInjuries = "";

    #[ORM\Column(length: 255)]
    #[Groups(['client_all', 'anamnese_all'])]
    private string $cronicalPain = "";

    #[ORM\Column(length: 255)]
    #[Groups(['client_all', 'anamnese_all'])]
    private string $controledMedicine = "";

    #[ORM\Column(length: 255)]
    #[Groups(['client_all', 'anamnese_all'])]
    private string $heartProblem = "";

    #[ORM\Column(length: 255)]
    #[Groups(['client_all', 'anamnese_all'])]
    private string $recentSurgery = "";

    #[ORM\Column(length: 255)]
    #[Groups(['client_all', 'anamnese_all'])]
    private string $timeWithoutGym = "";

    #[ORM\Column(length: 255)]
    #[Groups(['client_all', 'anamnese_all'])]
    private string $ocupation = "";

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client_all', 'anamnese_all'])]
    private string $observation = "";

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client_all', 'anamnese_all'])]
    private ?string $diet = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client_all', 'anamnese_all'])]
    private ?string $sleep = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client_all', 'anamnese_all'])]
    private ?string $physicalActivity = null;

    #[ORM\OneToOne(inversedBy: "anamnese")]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['anamnese_all'])]
    private ?Client $client = null;

    #[ORM\Column(type: "datetime_immutable")]
    #[Groups(['client_all', 'anamnese_all'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: "datetime_immutable", nullable: true)]
    #[Groups(['client_all', 'anamnese_all'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
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

    public function getPreviousInjuries(): string
    {
        return $this->previousInjuries;
    }

    public function setPreviousInjuries(string $previousInjuries): self
    {
        $this->previousInjuries = $previousInjuries;
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

    public function getHeartProblem(): string
    {
        return $this->heartProblem;
    }

    public function setHeartProblem(string $heartProblem): self
    {
        $this->heartProblem = $heartProblem;
        return $this;
    }

    public function getRecentSurgery(): string
    {
        return $this->recentSurgery;
    }

    public function setRecentSurgery(string $recentSurgery): self
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

    public function getObservation(): string
    {
        return $this->observation;
    }

    public function setObservation(string $observation): self
    {
        $this->observation = $observation;
        return $this;
    }

    public function getDiet(): ?string
    {
        return $this->diet;
    }

    public function setDiet(string $diet): self
    {
        $this->diet = $diet;
        return $this;
    }

    public function getSleep(): ?string
    {
        return $this->sleep;
    }

    public function setSleep(string $sleep): self
    {
        $this->sleep = $sleep;
        return $this;
    }

    public function getPhysicalActivity(): ?string
    {
        return $this->physicalActivity;
    }

    public function setPhysicalActivity(string $physicalActivity): self
    {
        $this->physicalActivity = $physicalActivity;
        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(Client $client): self
    {
        $this->client = $client;
        return $this;
    }

    public function getDataFromArray(array $data): self
    {
        if (isset($data['medicalRestriction'])) {
            $this->medicalRestriction = $data['medicalRestriction'];
        }

        if (isset($data['previousInjuries'])) {
            $this->previousInjuries = $data['previousInjuries'];
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

        if (isset($data['observation'])) {
            $this->observation = $data['observation'];
        }

        if (isset($data['diet'])) {
            $this->diet = $data['diet'];
        }

        if (isset($data['sleep'])) {
            $this->sleep = $data['sleep'];
        }

        if (isset($data['physicalActivity'])) {
            $this->physicalActivity = $data['physicalActivity'];
        }

        return $this;
    }
}
