<?php

namespace App\Entity;

use App\Repository\UserRepository;
use DateTime;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints\Date;

#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['user_all'])]
    private int $id;

    #[ORM\Column(type: "string", unique: true)]
    #[Groups(['user_all'])]
    private string $email;
    
    #[ORM\Column(type: 'json')]
    #[Groups(['user_all'])]
    private array $roles = [];

    #[ORM\Column]
    private string $password;

    #[ORM\Column]
    #[Groups(['user_all'])]
    private string $firstName;

    #[ORM\Column]
    #[Groups(['user_all'])]
    private string $lastName;

    #[ORM\OneToMany(mappedBy:"user", targetEntity:Client::class)]
    private $clients;

    #[ORM\Column(type: "datetime_immutable")]
    #[Groups(['user_all'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: "datetime_immutable", nullable: true)]
    #[Groups(['user_all'])]
    private ?\DateTimeImmutable $updatedAt = null;


    public function getId(): int
    {
        return $this->id;
    }

    public function setFirstName(string $firstName): void
    {
        $this->firstName = $firstName;
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function setLastName(string $lastName): void
    {
        $this->lastName = $lastName;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setPassword(string $password): void
    {
        $this->password = $password;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getUserIdentifier(): string { return $this->email; }
    public function getRoles(): array { return array_unique(array_merge($this->roles, ['ROLE_USER'])); }
    public function setRoles(array $roles): self { $this->roles = $roles; return $this; }
    public function eraseCredentials(): void {}
}
