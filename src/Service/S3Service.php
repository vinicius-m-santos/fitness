<?php

namespace App\Service;

use Aws\S3\S3Client;
use Psr\Log\LoggerInterface;

class S3Service
{
    private S3Client $s3Client;

    public function __construct(
        private readonly LoggerInterface $logger
    )
    {
        $this->s3Client = new S3Client([
            'version' => 'latest',
            'region' => $_ENV['AWS_REGION'],
            'credentials' => [
                'key' => $_ENV['AWS_ACCESS_KEY_ID'],
                'secret' => $_ENV['AWS_SECRET_ACCESS_KEY']
            ]
        ]);
    }

    public function putObject(array $data)
    {
        return $this->s3Client->putObject($data);
    }

    public function getObjectUrl($filePath)
    {
        return $this->s3Client->getObjectUrl($_ENV['AWS_BUCKET'], $filePath);
    }

    public function generateFileUrl(string $key): string
    {
        if (empty($key)) {
            return $key;
        }

        $cmd = $this->s3Client->getCommand('GetObject', [
            'Bucket' => $_ENV['AWS_BUCKET'],
            'Key' => $key,
        ]);

        $request = $this->s3Client->createPresignedRequest($cmd, '+1 hour');

        return (string) $request->getUri();
    }

    public function deleteObject(string $key): void
    {
        $this->s3Client->deleteObject(
            [
                'Bucket' => $_ENV['AWS_BUCKET'],
                'Key' => $key
            ]
        );
    }
}
