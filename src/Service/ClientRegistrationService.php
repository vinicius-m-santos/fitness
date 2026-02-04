<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Personal;

class ClientRegistrationService
{
    public function __construct(
        private readonly MailgunEmailService $mailgunEmailService,
        private readonly string $appUrl
    ) {}

    public function sendRegistrationEmail(Client $client, Personal $personal): void
    {
        $clientUser = $client->getUser();
        if (!$clientUser) {
            throw new \RuntimeException('Cliente não possui usuário associado');
        }

        $personalName = $personal->getUser()->getFirstName() . ' ' . $personal->getUser()->getLastName();
        $registrationUrl = rtrim($this->appUrl, '/') . '/client-register/' . $personal->getUser()->getUuid() . '/' . $client->getUuid();

        $emailBody = "Olá {$client->getName()},\n\n" .
            "O personal trainer {$personalName} o cadastrou como aluno em nossa plataforma.\n\n" .
            "Para completar seu cadastro e definir sua senha, clique no link abaixo:\n" .
            $registrationUrl . "\n\n" .
            "Atenciosamente,\nEquipe Fitrise";

        $this->mailgunEmailService->sendEmail(
            to: $clientUser->getEmail(),
            subject: 'Cadastro como Aluno - Fitrise',
            body: $emailBody
        );
    }
}
