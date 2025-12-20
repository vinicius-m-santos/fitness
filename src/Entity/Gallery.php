<?php

namespace App\Entity;

use App\Enum\GalleryVisibilityEnum;
use App\Repository\GalleryRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: GalleryRepository::class)]
#[ORM\Table(
    name: 'gallery',
    indexes: [
        new ORM\Index(name: 'idx_gallery_client_date', columns: ['client_id', 'date']),
    ]
)]
class Gallery
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['gallery_all', 'client_all'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 200, nullable: true)]
    #[Groups(['gallery_all', 'client_all'])]
    private ?string $note;

    #[ORM\Column(enumType: GalleryVisibilityEnum::class)]
    #[Groups(['gallery_all', 'client_all'])]
    private GalleryVisibilityEnum $visibility = GalleryVisibilityEnum::PRIVATE;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['gallery_all', 'client_all'])]
    private ?string $storageKey = null;

    #[ORM\ManyToOne(inversedBy: 'galleries')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['gallery_all'])]
    private ?Client $client = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['gallery_all', 'client_all'])]
    private \DateTimeImmutable $date;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['gallery_all', 'client_all'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['gallery_all', 'client_all'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $now = new \DateTimeImmutable();
        $this->createdAt = $now;
        $this->date = $now;
    }
    
    #[ORM\PreUpdate]
    public function onUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNote(): ?string
    {
        return $this->note;
    }

    public function setNote(?string $note): self
    {
        $this->note = $note;
        return $this;
    }

    public function getStorageKey(): ?string
    {
        return $this->storageKey;
    }

    public function setStorageKey(?string $storageKey): self
    {
        $this->storageKey = $storageKey;
        return $this;
    }
    
    public function getVisibility(): GalleryVisibilityEnum
    {
        return $this->visibility;
    }

    public function setVisibility(int $visibility): self
    {
        $this->setVisibilityFromPayload($visibility);
        return $this;
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

    private function setVisibilityFromPayload(int $value): self
    {
        $visibility = GalleryVisibilityEnum::tryFrom($value);

        if (!$visibility) {
            throw new \InvalidArgumentException('Visibilidade inválida');
        }

        $this->visibility = $visibility;

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
        if (isset($data['note'])) {
            $this->note = $data['note'];
        }

        if (!empty($data['date'])) {
            $this->date = new \DateTimeImmutable($data['date']);
        }

        if (isset($data['visibility'])) {
            $this->setVisibilityFromPayload((int) $data['visibility']);
        }

        return $this;
    }
}
