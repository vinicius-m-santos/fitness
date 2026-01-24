<?php

namespace App\Service;

use App\Entity\Gallery;
use App\Repository\GalleryRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\File\File;
use App\Entity\User;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class GalleryService
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly GalleryRepository $galleryRepository,
        private readonly S3Service $s3Service
    )
    {
    }

    public function add(Gallery $gallery, bool $flush = true): Gallery
    {
        return $this->galleryRepository->add($gallery, $flush);
    }

    public function remove(Gallery $gallery): void
    {
        $this->galleryRepository->delete($gallery);
    }

    public function findBy(
        array $criteria,
        array|null $orderBy = null,
        int|null $limit = null,
        int|null $offset = null
    ): array {
        return $this->galleryRepository->findBy($criteria, $orderBy, $limit, $offset);
    }

    public function createGalleryWithImage(
        Gallery $gallery,
        File $file,
        User $user
    ): string {
        $clientOriginalName = trim($file->getClientOriginalName() ?? '');

        if (empty($clientOriginalName)) {
            throw new UnprocessableEntityHttpException('Nome de arquivo inválido');
        }

        $this->add($gallery);

        $filename = sprintf('%s-%s', uniqid(), $clientOriginalName);
        $filePath = sprintf(
            '%s/galleries/%s/%s',
            $user->getUuid(),
            $gallery->getId(),
            $filename
        );

        try {
            $this->s3Service->saveFile($file, $filePath);
        } catch (\Throwable $e) {
            $this->remove($gallery);
            throw new UnprocessableEntityHttpException('Erro ao salvar imagem');
        }

        $gallery->setStorageKey($filePath);
        $url = $this->s3Service->generateFileUrl($filePath);

        if (!$url) {
            $this->remove($gallery);
            throw new UnprocessableEntityHttpException('Erro ao salvar imagem');
        }

        $this->add($gallery);

        return $url;
    }

    public function replaceGalleryImage(
        Gallery $gallery,
        UploadedFile $file,
        User $user
    ): void {
        $clientOriginalName = trim($file->getClientOriginalName() ?? '');

        if (empty($clientOriginalName)) {
            throw new UnprocessableEntityHttpException('Nome de arquivo inválido');
        }

        if ($gallery->getStorageKey()) {
            $this->s3Service->deleteObject($gallery->getStorageKey());
        }

        $filename = sprintf('%s-%s', uniqid(), $clientOriginalName);
        $filePath = sprintf(
            '%s/galleries/%s/%s',
            $user->getUuid(),
            $gallery->getId(),
            $filename
        );

        $this->s3Service->saveFile($file, $filePath);
        $gallery->setStorageKey($filePath);
    }

    public function delete(Gallery $gallery): void
    {
        if ($storageKey = $gallery->getStorageKey()) {
            $this->s3Service->deleteObject($storageKey);
        }

        $this->galleryRepository->delete($gallery);
    }
}


