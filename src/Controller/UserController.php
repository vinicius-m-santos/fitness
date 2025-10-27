<?php

namespace App\Controller;

use App\Repository\ClientRepository;
use App\Repository\UserRepository;
use App\Service\UserService;
use DateTime;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

#[Route('/api/user', name: 'api_user', methods: ['GET', 'POST'])]
class UserController extends AbstractController
{
    public function __construct(
        private readonly UserService $userService,
        private readonly UserRepository $userRepository,
        private readonly ClientRepository $clientRepository,
        private readonly NormalizerInterface $normalizer
    )
    {
    }

    #[Route('/check-token/{token}/{client}', name: 'check_user_token', methods: ['GET'])]
    public function checkUserToken(string $token, string $client): JsonResponse
    {
        try {
            $token = trim($token);
            $client = trim($client);
            if (strlen($token) === 0 || strlen($client) === 0) {
                throw new UnprocessableEntityHttpException('Link inválido');
            }

            $user = $this->userRepository->findOneBy(['uuid' => $token]);
            if ($user === null) {
                throw new UnprocessableEntityHttpException('Link inválido');
            }

            $client = $this->clientRepository->findOneBy(['uuid' => $client]);
            if ($client === null) {
                throw new UnprocessableEntityHttpException('Link inválido');
            }
            
            $normalizedData = $this->normalizer->normalize($client, 'json', ['groups' => ['client_all']]);
            return new JsonResponse(['data' => $normalizedData], 200);
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException('Erro ao carregar página');
        }
    }

    // #[Route('/update', name: 'update_user', methods: ['PUT'])]
    // public function update(Request $request): JsonResponse
    // {
    //     $user = $this->getUser();

    //     if (!$user) {
    //         return new JsonResponse(['error' => 'Unauthorized'], 401);
    //     }

    //     $data = json_decode($request->getContent(), true);

    //     $convertedDob = $user->getDob() ?? null;
    //     if (isset($data['dob'])) {
    //         $convertedDob = \DateTime::createFromFormat('Y-m-d', $data['dob']) ?: null;
    //     }

    //     $user->setFirstName($data['firstName']);
    //     $user->setLastName($data['lastName']);
    //     $user->setDob($convertedDob);
    //     $user->setEmail($data['email']);
    //     $user->setCpf($data['cpf']);
    //     $user->setPhoneNumber($data['phoneNumber']);
    //     $user->setState($data['state']);
    //     $user->setCity($data['city']);

    //     $this->userService->add($user);

    //     return new JsonResponse(['status' => 'User Updated'], 200);
    // }

    // #[Route('/getsfdasf', name: 'api_get_userrrr', method: ['GET'])]
    // public function getsss(Request $request): JsonResponse
    // {
    //     // $user = $this->getUser();

    //     // if ($user) {
    //     //     return new JsonResponse(['error' => 'Unauthorized', 401]);
    //     // }

    //     // $data = $this->normalizer->normalize($user, 'json', ['user_all']);
    //     return new JsonResponse(['user' => 'ss'], 200);
    // }
}
