<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Service\UserService;
use DateTime;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

#[Route('/api/user', name: 'api_user', methods: ['GET', 'POST'])]
class UserController extends AbstractController
{
    public function __construct(
        private readonly UserService $userService,
        private readonly UserRepository $userRepository,
        private readonly NormalizerInterface $normalizer
    )
    {
    }

    #[Route('/check-token/{token}', name: 'check_user_token', methods: ['GET'])]
    public function checkUserToken(string $token): JsonResponse
    {
        try {
            $token = trim($token);
            if (strlen($token) === 0) {
                return new JsonResponse(['status' => false], 200);
            }

            $user = $this->userRepository->findOneBy(['uuid' => $token]);
            if ($user === null) {
                return new JsonResponse(['status' => false], 200);
            }

            return new JsonResponse(['status' => true], 200);
        } catch (Exception $e) {
            return new JsonResponse(['status' => false], 200);
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
