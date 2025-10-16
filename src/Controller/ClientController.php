<?php

namespace App\Controller;

use App\Entity\Client;
use App\Service\ClientService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
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
        private readonly TranslatorInterface $translator
    )
    {
    }

    #[Route('/', name: 'client_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
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

        $client = $this->clientService->add($client);
        $normalizedData = $this->normalizer->normalize($client, 'json', ['client_all']);

        return $this->json(['success' => true, 'data' => $normalizedData], 200);
    }
}
