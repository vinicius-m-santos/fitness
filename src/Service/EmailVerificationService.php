<?php

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class EmailVerificationService
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly UrlGeneratorInterface $urlGenerator,
        private readonly EntityManagerInterface $em,
        private readonly string $appUrl
    ) {}

    public function sendVerificationEmail(User $user): void
    {
        // Gerar token de verificação
        $token = bin2hex(random_bytes(32));
        $user->setVerificationToken($token);

        // Persistir o token no banco
        $this->em->flush();

        // Gerar URL de verificação (frontend)
        $verificationUrl = rtrim($this->appUrl, '/') . '/verify-email/' . $token;

        // Criar email
        $email = (new Email())
            ->from('noreply@fitrise.app')
            ->to($user->getEmail())
            ->subject('Verificação de Conta - Fitrise')
            ->text(
                "Olá {$user->getFirstName()},\n\n" .
                    "Obrigado por se cadastrar!\n\n" .
                    "Por favor, clique no link abaixo para verificar sua conta:\n" .
                    $verificationUrl . "\n\n" .
                    "Se você não se cadastrou, pode ignorar este email.\n\n" .
                    "Atenciosamente,\nEquipe Fitrise"
            );

        // Enviar email
        $this->mailer->send($email);
    }
}
