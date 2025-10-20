<?php

namespace App\Entity;

use App\Validator as AppAssert;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: \App\Repository\PersonalRepository::class)]
#[ORM\Table(name: "personal")]
#[AppAssert\ValidPersonal]
class Personal
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['client_all', 'personal_all'])]
    private int $id;

    #[ORM\Column(length: 255)]
    #[Groups(['client_all', 'personal_all'])]
    private string $cref = "";

    #[ORM\OneToOne(inversedBy: 'personal', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\OneToMany(mappedBy: 'personal', targetEntity: Client::class, cascade: ['persist', 'remove'])]
    private Collection $clients;

    #[ORM\Column(type: "datetime_immutable")]
    #[Groups(['client_all', 'personal_all'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: "datetime_immutable", nullable: true)]
    #[Groups(['client_all', 'personal_all'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->clients = new ArrayCollection();
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getCref(): string
    {
        return $this->cref;
    }

    public function setCref(string $cref): self
    {
        $this->cref = $cref;
        return $this;
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

    public function addClient(Client $client): self
    {
        if (!$this->clients->contains($client)) {
            $this->clients->add($client);
            $client->setPersonal($this);
        }

        return $this;
    }

    public function removeClient(Client $client): self
    {
        if ($this->clients->removeElement($client)) {
            if ($client->getPersonal() === $this) {
                $client->setPersonal(null);
            }
        }

        return $this;
    }

    public function getDataFromArray(array $data): self
    {
        if (isset($data['cref'])) {
            $this->cref = $data['cref'];
        }

        return $this;
    }
}
