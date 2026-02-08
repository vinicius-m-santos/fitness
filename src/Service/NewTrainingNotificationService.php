<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Training;

class NewTrainingNotificationService
{
    public function __construct(
        private readonly MailgunEmailService $mailgunEmailService,
        private readonly string $appUrl
    ) {}

    public function sendNewTrainingEmail(Training $training): void
    {
        $client = $training->getClient();
        $user = $client->getUser();
        if ($user === null) {
            return;
        }

        if (!$user->isEmailNotifications()) {
            return;
        }

        $email = $user->getEmail();
        if (empty($email)) {
            return;
        }

        $clientName = $client->getName() . ' ' . $client->getLastName();
        $trainingName = $training->getName();
        $personalName = $training->getPersonal()->getUser()->getFirstName()
            . ' '
            . $training->getPersonal()->getUser()->getLastName();
        $loginUrl = rtrim($this->appUrl, '/') . '/login';

        $body = "Olá {$clientName},\n\n"
            . "Seu personal {$personalName} cadastrou um novo treino para você: \"{$trainingName}\".\n\n"
            . "Acesse o app para visualizar:\n"
            . $loginUrl . "\n\n"
            . "Se você já estiver logado, será redirecionado para sua área do aluno.\n\n"
            . "Atenciosamente,\nEquipe Fitrise";

        $this->mailgunEmailService->sendEmail(
            to: $email,
            subject: 'Novo treino cadastrado - Fitrise',
            body: $body
        );
    }
}
