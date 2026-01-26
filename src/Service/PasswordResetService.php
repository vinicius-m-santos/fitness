<?php

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class PasswordResetService
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly UrlGeneratorInterface $urlGenerator,
        private readonly EntityManagerInterface $em,
        private readonly string $appUrl
    ) {}

    public function sendPasswordResetEmail(User $user): void
    {
        // Gerar token de reset
        $token = bin2hex(random_bytes(32));
        $user->setResetToken($token);
        
        // Definir expiração do token (24 horas)
        $user->setResetTokenExpiresAt(new \DateTimeImmutable('+24 hours'));

        // Persistir o token no banco
        $this->em->flush();

        // Gerar URL de reset (frontend)
        $resetUrl = rtrim($this->appUrl, '/') . '/reset-password/' . $token;

        // Criar email
        $email = (new Email())
            ->from('noreply@fitrise.app')
            ->to($user->getEmail())
            ->subject('Recuperação de Senha - Fitrise')
            ->text(
                "Olá {$user->getFirstName()},\n\n" .
                    "Recebemos uma solicitação para redefinir sua senha.\n\n" .
                    "Por favor, clique no link abaixo para redefinir sua senha:\n" .
                    $resetUrl . "\n\n" .
                    "Este link expira em 24 horas.\n\n" .
                    "Se você não solicitou esta recuperação de senha, pode ignorar este email.\n\n" .
                    "Atenciosamente,\nEquipe Fitrise"
            );

        // Enviar email
        $this->mailer->send($email);
    }
}
