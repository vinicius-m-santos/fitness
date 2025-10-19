<?php

namespace App\Service;

use App\Entity\Anamnese;
use App\Repository\AnamneseRepository;
use Psr\Log\LoggerInterface;

class AnamneseService
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly AnamneseRepository $anamneseRepository
    )
    {
    }

    public function add(Anamnese $anamnese, bool $flush = true): Anamnese
    {
        return $this->anamneseRepository->add($anamnese, $flush);
    }
}
