<?php

namespace App\Controller;

use App\Entity\Anamnese;
use App\Entity\Client;
use App\Repository\AnamneseRepository;
use App\Service\ClientService;
use App\Repository\ClientRepository;
use App\Repository\UserRepository;
use App\Service\AnamneseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Encoder\JsonEncode;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

#[Route('/api/client')]
class ClientController extends AbstractController
{
    public function __construct(
        private readonly ValidatorInterface $validator,
        private readonly NormalizerInterface $normalizer,
        private readonly ClientService $clientService,
        private readonly TranslatorInterface $translator,
        private readonly ClientRepository $clientRepository,
        private readonly UserRepository $userRepository,
        private readonly AnamneseService $anamneseService,
        private readonly AnamneseRepository $anamneseRepository
    )
    {
    }

    #[Route('/{token}', name: 'client_create', methods: ['POST'])]
    public function create(Request $request, string $token): JsonResponse
    {
        $token = trim($token);
        if (strlen($token) === 0) {
            return $this->json(['success' => false, 'error' => 'Link de Personal inválido'], 200);
        }

        $data = json_decode($request->getContent(), true);
        
        $client = new Client();
        $client->getDataFromArray($data);

        $errors = $this->validator->validate($client);
        if (count($errors) > 0) {
            $errorMessage = null;
            foreach ($errors as $error) {
                $errorMessage = $error->getMessage();
                break;
            }

            return $this->json([
                'success' => false,
                'error' => $errorMessage,
            ], 400);
        }

        $anamnese = new Anamnese();
        $anamnese->getDataFromArray($data);

        $errors = $this->validator->validate($anamnese);
        if (count($errors) > 0) {
            $errorMessage = null;
            foreach ($errors as $error) {
                $errorMessage = $error->getMessage();
                break;
            }

            return $this->json([
                'success' => false,
                'error' => $errorMessage,
            ], 400);
        }

        $personal = $this->userRepository->findOneBy(['uuid' => $token]);

        if ($personal === null) {
            return $this->json([
                'success' => false,
                'error' => 'Personal não encontrado',
            ], 400);
        }

        $client->setUser($personal);
        $client = $this->clientService->add($client);

        $anamnese->setClient($client);
        $this->anamneseService->add($anamnese);

        $normalizedData = $this->normalizer->normalize($client, 'json', ['client_all']);

        return $this->json(['success' => true, 'data' => $normalizedData], 200);
    }

    #[Route('/all', name: 'get_all_clients', methods: ['GET'])]
    public function getAll(): JsonResponse
    {
         /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized', 401]);
        }

        $clients = $this->clientRepository->findBy(['user' => $user->getId()]);
        $normalizedData = $this->normalizer->normalize($clients, 'json', ['client_all']);

        return new JsonResponse(['clients' => $normalizedData], 200);
    }

    #[Route('/{clientId}', name: 'get_client', methods: ['GET'])]
    public function get(int $clientId): JsonResponse
    {
         /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(
                [
                    'success' => false,
                    'error' => 'Unauthorized'
                ],
                401
            );
        }

        $client = $this->anamneseRepository->findOneBy(
            [
                'client' => $clientId
            ]
        );

        $normalizedData = $this->normalizer->normalize($client, 'json', ['anamnese_all']);
        return new JsonResponse(
            [
                'success' => true,
                'client' => $normalizedData
            ],
            200
        );
    }
}
