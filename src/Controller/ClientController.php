<?php

namespace App\Controller;

use App\Entity\Anamnese;
use App\Entity\Client;
use App\Repository\AnamneseRepository;
use App\Service\ClientService;
use App\Repository\ClientRepository;
use App\Repository\PersonalRepository;
use App\Repository\UserRepository;
use App\Service\AnamneseService;
use App\Service\S3Service;
use App\Service\ClientRegistrationService;
use App\Service\EmailVerificationService;
use App\Service\SubscriptionService;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
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
        private readonly AnamneseRepository $anamneseRepository,
        private readonly PersonalRepository $personalRepository,
        private readonly S3Service $s3Service,
        private readonly ClientRegistrationService $clientRegistrationService,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly SubscriptionService $subscriptionService,
        private readonly EmailVerificationService $emailVerificationService
    ) {}

    #[Route('/personal-link-info/{personalUuid}', name: 'client_personal_link_info', methods: ['GET'])]
    public function personalLinkInfo(string $personalUuid): JsonResponse
    {
        $personalUuid = trim($personalUuid);
        if ($personalUuid === '') {
            throw new UnprocessableEntityHttpException('Link inválido');
        }

        $personal = $this->personalRepository->findOneByUserUuid($personalUuid);
        if ($personal === null) {
            throw new UnprocessableEntityHttpException('Personal não encontrado');
        }

        $user = $personal->getUser();
        return new JsonResponse([
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
        ]);
    }

    #[Route('/register-by-personal-link/{personalUuid}', name: 'client_register_by_personal_link', methods: ['POST'])]
    public function registerByPersonalLink(Request $request, string $personalUuid): JsonResponse
    {
        $personalUuid = trim($personalUuid);
        if ($personalUuid === '') {
            throw new UnprocessableEntityHttpException('Link inválido');
        }

        $personal = $this->personalRepository->findOneByUserUuid($personalUuid);
        if ($personal === null) {
            throw new UnprocessableEntityHttpException('Personal não encontrado');
        }

        $this->subscriptionService->ensureActiveSubscription($personal);
        if (!$this->subscriptionService->canAddStudent($personal)) {
            throw new UnprocessableEntityHttpException(
                'O personal atingiu o limite de alunos do plano. Tente novamente mais tarde.'
            );
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            throw new UnprocessableEntityHttpException('Dados inválidos');
        }

        if (isset($data['password']) && isset($data['confirmPassword']) && $data['password'] !== $data['confirmPassword']) {
            throw new UnprocessableEntityHttpException('As senhas não coincidem');
        }

        if (strlen($data['password'] ?? '') < 8) {
            throw new UnprocessableEntityHttpException('A senha deve ter pelo menos 8 caracteres');
        }
        if (!preg_match('/[a-z]/', $data['password'] ?? '')) {
            throw new UnprocessableEntityHttpException('A senha deve conter letras minúsculas');
        }
        if (!preg_match('/[A-Z]/', $data['password'] ?? '')) {
            throw new UnprocessableEntityHttpException('A senha deve conter letras maiúsculas');
        }
        if (!preg_match('/[0-9]/', $data['password'] ?? '')) {
            throw new UnprocessableEntityHttpException('A senha deve conter números');
        }

        $client = $this->clientService->createClientFromPersonalLink($personal, $data);

        try {
            $this->emailVerificationService->sendVerificationEmail($client->getUser());
        } catch (\Exception $e) {
            error_log('Erro ao enviar email de verificação (cadastro por link): ' . $e->getMessage());
        }

        return new JsonResponse([
            'success' => true,
            'message' => 'Cadastro realizado. Verifique seu email para ativar sua conta.',
        ], 201);
    }

    #[Route('/send-registration-link/{clientId}', name: 'client_send_registration_link', methods: ['POST'])]
    public function sendRegistrationLink(int $clientId): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Usuário não encontrado');
        }

        $client = $this->clientRepository->find($clientId);
        if (!$client) {
            throw new UnprocessableEntityHttpException('Cliente não encontrado');
        }

        if ($client->getHasRegistered()) {
            throw new UnprocessableEntityHttpException('Aluno já se cadastrou');
        }

        $personal = $this->personalRepository->findOneBy(['user' => $user]);
        if (!$personal) {
            throw new UnprocessableEntityHttpException('Personal trainer não encontrado');
        }

        try {
            $this->clientRegistrationService->sendRegistrationEmail($client, $personal);
            return new JsonResponse(['success' => true, 'message' => 'Email enviado com sucesso'], 200);
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException('Erro ao enviar email: ' . $e->getMessage());
        }
    }

    #[Route('/clientByPersonal', name: 'client_create_by_personal', methods: ['POST'])]
    public function createClientByPersonal(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Usuário não encontrado');
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

            throw new Exception($errorMessage, 400);
        }

        try {
            $email = $data['email'] ?? null;
            if ($email) {
                $userExists = $this->userRepository->findOneBy(['email' => $email]);
                if ($userExists) {
                    throw new UnprocessableEntityHttpException('Email já cadastrado');
                }
            }

            $personal = $this->personalRepository->findOneBy(['user' => $user]);
            if (!$personal) {
                throw new UnprocessableEntityHttpException('Personal trainer não encontrado');
            }

            $this->subscriptionService->ensureActiveSubscription($personal);
            if (!$this->subscriptionService->canAddStudent($personal)) {
                throw new UnprocessableEntityHttpException(
                    'Você atingiu o limite de alunos do seu plano atual. Em breve teremos planos pagos com mais vagas.'
                );
            }

            $client = $this->clientService->createClient($personal, $client, $data);

            if (isset($data['sendAccessEmail']) && $data['sendAccessEmail'] === true) {
                try {
                    $this->clientRegistrationService->sendRegistrationEmail($client, $personal);
                } catch (Exception $e) {
                    error_log('Erro ao enviar email de cadastro: ' . $e->getMessage());
                }
            }
        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }

        $normalizedData = $this->normalizer->normalize($client, 'json', ['groups' => ['client_all']]);

        return $this->json(['success' => true, 'data' => $normalizedData], 200);
    }

    #[Route('/avatar/{id}', name: 'client_upload_avatar', methods: ['POST'])]
    public function uploadAvatar(Request $request, Client $client): JsonResponse
    {
        $file = $request->files->get('avatar');
        if (!$file) {
            throw new UnprocessableEntityHttpException('Arquivo não enviado');
        }

        $user = $this->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Erro ao realizar upload');
        }

        $url = $this->clientService->saveClientProfileImage($file, $user, $client);
        return new JsonResponse(['data' => $url]);
    }

    #[Route('/{id}', name: 'client_delete', methods: ['DELETE'])]
    public function delete(Client $client): JsonResponse
    {
        $this->clientRepository->delete($client);
        return new JsonResponse(null);
    }

    #[Route('/avatar/{id}', name: 'client_delete_avatar', methods: ['DELETE'])]
    public function deleteAvatar(Client $client): JsonResponse
    {
        $user = $client->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Cliente não possui usuário associado');
        }

        $key = $user->getAvatarKey();
        if (empty($key)) {
            $user->setAvatarKey(null);
            $user->setAvatarUrl(null);
            $this->userRepository->add($user, false);
            $this->clientService->add($client);

            return new JsonResponse(['data' => 'Sucesso']);
        }

        $this->s3Service->deleteObject($key);
        $user->setAvatarKey(null);
        $user->setAvatarUrl(null);
        $this->userRepository->add($user, false);
        $this->clientService->add($client);

        return new JsonResponse(['data' => 'Sucesso']);
    }

    #[Route('/{token}/{client}', name: 'client_create', methods: ['POST'])]
    public function create(Request $request, string $token, string $client): JsonResponse
    {
        $token = trim($token);
        $client = trim($client);
        if (strlen($token) === 0 || strlen($client) === 0) {
            throw new Exception('Link de Personal inválido', 200);
        }

        $data = json_decode($request->getContent(), true);

        $client = $this->clientService->findOneBy(['uuid' => $client]);
        if ($client === null) {
            throw new UnprocessableEntityHttpException('Link de Personal inválido');
        }

        try {
            $anamnese = new Anamnese();
            $anamnese->getDataFromArray($data);

            $errors = $this->validator->validate($anamnese);
            if (count($errors) > 0) {
                $errorMessage = null;
                foreach ($errors as $error) {
                    $errorMessage = $error->getMessage();
                    break;
                }

                throw new UnprocessableEntityHttpException($errorMessage);
            }

            $personal = $this->personalRepository->findOneByUserUuid($token);
            if ($personal === null) {
                throw new UnprocessableEntityHttpException('Personal não encontrado');
            }

            $anamnese->setClient($client);
            $this->anamneseService->add($anamnese);

            $client->getDataFromArray($data);
            $this->clientService->add($client);

            $normalizedData = $this->normalizer->normalize($client, 'json', ['groups' => ['client_all']]);
            return $this->json(['success' => true, 'data' => $normalizedData], 200);
        } catch (Exception $e) {
            throw new Exception($e);
        }
    }

    #[Route('/{id}', name: 'client_update', methods: ['PATCH'])]
    public function update(Request $request, Client $client): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            throw new UnprocessableEntityHttpException('Erro ao atualizar aluno');
        }

        unset($data['email']);
        $client->getDataFromArray($data);

        $errors = $this->validator->validate($client);
        if (count($errors) > 0) {
            $errorMessage = null;
            foreach ($errors as $error) {
                $errorMessage = $error->getMessage();
                break;
            }

            throw new Exception($errorMessage, 400);
        }

        $anamnese = $client->getAnamnese();
        if (!$anamnese) {
            $anamnese = new Anamnese();
        }

        $anamnese->getDataFromArray($data);

        $anamnese->setClient($client);
        $this->anamneseService->add($anamnese);

        $user = $client->getUser();
        if ($user) {
            $avatarKey = $user->getAvatarKey();
            if (isset($avatarKey)) {
                $user->setAvatarUrl($this->s3Service->generateFileUrl($avatarKey));
                $this->userRepository->add($user, false);
            }

            if (isset($data['phone'])) {
                $user->setPhone($data['phone']);
                $this->userRepository->add($user, false);
            }
        }
        $this->clientService->add($client);

        $normalizedData = $this->normalizer->normalize($client, 'json', ['groups' => ['client_all']]);
        return new JsonResponse(['data' => $normalizedData]);
    }

    #[Route('/all', name: 'get_all_clients', methods: ['GET'])]
    public function getAll(): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            throw new Exception('Unauthorized', 401);
        }

        $clients = $this->clientRepository->findAllClientsByUserId($user->getId());
        foreach ($clients as $client) {
            $clientUser = $client->getUser();
            if ($clientUser) {
                $avatarKey = $clientUser->getAvatarKey();
                if (isset($avatarKey)) {
                    $clientUser->setAvatarUrl($this->s3Service->generateFileUrl($avatarKey));
                    $this->userRepository->add($clientUser, false);
                }
            }
        }
        $normalizedData = $this->normalizer->normalize($clients, 'json', ['groups' => ['client_list']]);

        return new JsonResponse(['clients' => $normalizedData], 200);
    }

    #[Route('/{clientId}', name: 'get_client', methods: ['GET'])]
    public function get(int $clientId): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if (!$user) {
            throw new Exception('Unauthorized', 401);
        }

        $client = $this->clientRepository->findWithAnamnese($clientId);

        $clientUser = $client->getUser();
        if ($clientUser) {
            $avatarKey = $clientUser->getAvatarKey();
            if (isset($avatarKey)) {
                $clientUser->setAvatarUrl($this->s3Service->generateFileUrl($avatarKey));
                $this->userRepository->add($clientUser, false);
            }
        }

        $normalizedData = $this->normalizer->normalize($client, 'json', ['groups' => ['client_all']]);
        return new JsonResponse(['data' => $normalizedData]);
    }

    #[Route('/register/{token}/{clientUuid}', name: 'client_register_password', methods: ['POST'])]
    public function registerPassword(Request $request, string $token, string $clientUuid): JsonResponse
    {
        $token = trim($token);
        $clientUuid = trim($clientUuid);

        if (strlen($token) === 0 || strlen($clientUuid) === 0) {
            throw new UnprocessableEntityHttpException('Link inválido');
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['password']) || !isset($data['confirmPassword'])) {
            throw new UnprocessableEntityHttpException('Senha e confirmação de senha são obrigatórias');
        }

        if ($data['password'] !== $data['confirmPassword']) {
            throw new UnprocessableEntityHttpException('As senhas não coincidem');
        }

        $client = $this->clientService->findOneBy(['uuid' => $clientUuid]);
        if ($client === null) {
            throw new UnprocessableEntityHttpException('Cliente não encontrado');
        }

        $personal = $this->personalRepository->findOneByUserUuid($token);
        if ($personal === null) {
            throw new UnprocessableEntityHttpException('Personal trainer não encontrado');
        }

        if ($client->getPersonal() !== $personal) {
            throw new UnprocessableEntityHttpException('Link inválido');
        }

        if ($client->getHasRegistered()) {
            throw new UnprocessableEntityHttpException('Aluno já se cadastrou');
        }

        $user = $client->getUser();
        if (!$user) {
            throw new UnprocessableEntityHttpException('Usuário do cliente não encontrado');
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);
        $user->setIsVerified(true);
        $this->userRepository->add($user, false);

        $client->setHasRegistered(true);
        $this->clientService->add($client);

        $normalizedData = $this->normalizer->normalize($client, 'json', ['groups' => ['client_all']]);
        return $this->json(['success' => true, 'data' => $normalizedData], 200);
    }
}
