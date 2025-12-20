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
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
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
        private readonly TranslatorInterface $translator,
        private readonly ClientRepository $clientRepository,
        private readonly UserRepository $userRepository,
        private readonly AnamneseService $anamneseService,
        private readonly AnamneseRepository $anamneseRepository,
        private readonly PersonalRepository $personalRepository,
        private readonly S3Service $s3Service
    )
    {
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
            $personal = $this->personalRepository->findOneBy(['user' => $user]);
            $client = $this->clientService->createClient($personal, $client);
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
        $key = $client->getAvatarKey();
        if (empty($key)) {
            $client->setAvatarKey(null);
            $client->setAvatarUrl(null);
            $this->clientService->add($client);

            return new JsonResponse(['data' => 'Sucesso']);
        }

        $this->s3Service->deleteObject($key);
        $client->setAvatarKey(null);
        $client->setAvatarUrl(null);
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

        $avatarKey = $client->getAvatarKey();
        if (isset($avatarKey)) {
            $client->setAvatarUrl($this->s3Service->generateFileUrl($avatarKey));
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
            $avatarKey = $client->getAvatarKey();
            if (isset($avatarKey)) {
                $client->setAvatarUrl($this->s3Service->generateFileUrl($avatarKey));
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

        $avatarKey = $client->getAvatarKey();
        if (isset($avatarKey)) {
            $client->setAvatarUrl($this->s3Service->generateFileUrl($avatarKey));
        }

        $normalizedData = $this->normalizer->normalize($client, 'json', ['groups' => ['client_all']]);
        return new JsonResponse(['data' => $normalizedData]);
    }
}
