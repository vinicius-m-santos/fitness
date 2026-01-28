<?php

namespace App\Controller;

use App\Entity\Client;
use App\Entity\Gallery;
use App\Enum\GalleryVisibilityEnum;
use App\Service\ClientService;
use App\Repository\ClientRepository;
use App\Repository\UserRepository;
use App\Service\GalleryService;
use App\Service\S3Service;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/gallery')]
class GalleryController extends AbstractController
{
    public function __construct(
        private readonly ValidatorInterface $validator,
        private readonly NormalizerInterface $normalizer,
        private readonly GalleryService $galleryService,
        private readonly ClientService $clientService,
        private readonly ClientRepository $clientRepository,
        private readonly UserRepository $userRepository,
        private readonly S3Service $s3Service
    ) {}

    #[Route('/client/{id}', name: 'gallery_get_by_client', methods: ['GET'])]
    public function galleryGetByClient(Client $client): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Usuário não encontrado');
        }

        if (
            $client->getUser()->getId() !== $user->getId() &&
            $client->getPersonal()->getUser()->getId() !== $user->getId()
        ) {
            throw new AccessDeniedHttpException('Acesso negado');
        }

        if ($user->getId() === $client->getPersonal()->getUser()->getId()) {
            $galleries = $this->galleryService->findBy(
                ['client' => $client, 'visibility' => GalleryVisibilityEnum::PUBLIC],
                ['date' => 'DESC']
            );
        } else {
            $galleries = $this->galleryService->findBy(
                ['client' => $client],
                ['date' => 'DESC']
            );
        }

        $groups = [];
        foreach ($galleries as $gallery) {
            $key = $gallery->getDate()->format('Y-m');

            if (!isset($groups[$key])) {
                $groups[$key] = [];
            }

            $groups[$key][] = [
                'id' => $gallery->getId(),
                'url' => $this->s3Service->generateFileUrl(
                    $gallery->getStorageKey()
                ),
                'note' => $gallery->getNote(),
                'date' => $gallery->getDate()->format(DATE_ATOM),
                'visibility' => $gallery->getVisibility()->value,
            ];
        }

        return new JsonResponse([
            'success' => true,
            'data' => [
                'groups' => $groups,
            ]
        ], 200);
    }

    #[Route('/client/{id}', name: 'gallery_create_by_client', methods: ['POST'])]
    public function galleryCreateByClient(Client $client, Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        if (!$file) {
            throw new UnprocessableEntityHttpException('Arquivo não enviado');
        }

        $user = $this->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Usuário não encontrado');
        }

        $data = $request->request->all();

        $gallery = new Gallery();
        $gallery->getDataFromArray($data);
        $gallery->setClient($client);

        $errors = $this->validator->validate($gallery);
        if (count($errors) > 0) {
            throw new UnprocessableEntityHttpException($errors[0]->getMessage());
        }

        $url = $this->galleryService->createGalleryWithImage(
            $gallery,
            $file,
            $user
        );

        return new JsonResponse([
            'success' => true,
            'data' => [
                'url' => $url,
            ]
        ], 201);
    }

    #[Route('/{id}', name: 'gallery_update', methods: ['POST', 'PUT'])]
    public function galleryUpdate(
        Gallery $gallery,
        Request $request
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Usuário não encontrado');
        }

        $data = $request->request->all();
        $file = $request->files->get('file');

        $gallery->getDataFromArray($data);

        $errors = $this->validator->validate($gallery);
        if (count($errors) > 0) {
            throw new UnprocessableEntityHttpException($errors[0]->getMessage());
        }

        if ($file) {
            $this->galleryService->replaceGalleryImage(
                $gallery,
                $file,
                $user
            );
        }

        $this->galleryService->add($gallery);

        return new JsonResponse([
            'success' => true,
        ]);
    }

    #[Route('/{id}', name: 'gallery_delete', methods: ['DELETE'])]
    public function galleryDelete(
        Gallery $gallery
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Usuário não encontrado');
        }

        if (
            $gallery->getClient()->getUser()->getId() !== $user->getId() &&
            $gallery->getClient()->getPersonal()->getUser()->getId() !== $user->getId()
        ) {
            throw new AccessDeniedHttpException('Acesso negado');
        }

        $this->galleryService->delete($gallery, $user);

        return new JsonResponse([
            'success' => true,
        ]);
    }
}
