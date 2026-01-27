<?php

namespace App\Service;

use Aws\Ses\SesClient;
use Aws\Exception\AwsException;
use Psr\Log\LoggerInterface;

class AwsSesService
{
    private SesClient $sesClient;

    public function __construct(
        private readonly LoggerInterface $logger
    ) {
        $this->sesClient = new SesClient([
            'version' => 'latest',
            'region' => $_ENV['AWS_REGION'] ?? 'sa-east-1',
            'credentials' => [
                'key' => $_ENV['AWS_ACCESS_KEY_ID'],
                'secret' => $_ENV['AWS_SECRET_ACCESS_KEY']
            ]
        ]);
    }

    /**
     * Envia um email via AWS SES
     *
     * @param string $to Email do destinatário
     * @param string $subject Assunto do email
     * @param string $body Corpo do email (texto simples)
     * @param string|null $from Email do remetente (opcional, usa SES_FROM do env se não fornecido)
     * @return bool True se enviado com sucesso, false caso contrário
     */
    public function sendEmail(
        string $to,
        string $subject,
        string $body,
        ?string $from = null
    ): bool {
        try {
            $from = $from ?? $_ENV['SES_FROM'] ?? 'noreply@fitrise.app';

            $result = $this->sesClient->sendEmail([
                'Source' => $from,
                'Destination' => [
                    'ToAddresses' => [$to],
                ],
                'Message' => [
                    'Subject' => [
                        'Data' => $subject,
                        'Charset' => 'UTF-8',
                    ],
                    'Body' => [
                        'Text' => [
                            'Data' => $body,
                            'Charset' => 'UTF-8',
                        ],
                    ],
                ],
            ]);

            $this->logger->info('Email enviado via AWS SES', [
                'messageId' => $result->get('MessageId'),
                'to' => $to,
                'subject' => $subject,
            ]);

            return true;
        } catch (AwsException $e) {
            $this->logger->error('Erro ao enviar email via AWS SES', [
                'error' => $e->getMessage(),
                'code' => $e->getAwsErrorCode(),
                'to' => $to,
                'subject' => $subject,
            ]);

            return false;
        }
    }
}
