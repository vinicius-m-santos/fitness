<?php

declare(strict_types=1);

namespace App\Command;

use App\Data\ReferenceData;
use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:seed-reference-data',
    description: 'Popula exercise_categories e muscle_groups com dados fixos (IDs sequenciais) para previsibilidade entre ambientes.',
)]
final class SeedReferenceDataCommand extends Command
{
    public function __construct(
        private readonly Connection $connection,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption(
            'force',
            'f',
            InputOption::VALUE_NONE,
            'Executar sem pedir confirmação (apaga dados atuais de categorias e grupos)',
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if (!$input->getOption('force')) {
            $io->warning('Isso irá apagar todos os dados de exercise_categories e muscle_groups (e exercises por CASCADE) e inserir os dados fixos.');
            if (!$io->confirm('Continuar?', false)) {
                return Command::SUCCESS;
            }
        }

        $now = (new \DateTimeImmutable())->format('Y-m-d H:i:s');

        $this->connection->executeStatement('DELETE FROM exercise_categories');
        $this->connection->executeStatement('DELETE FROM muscle_groups');

        foreach (ReferenceData::getExerciseCategories() as $id => $name) {
            $this->connection->executeStatement(
                'INSERT INTO exercise_categories (id, name, created_at, updated_at) VALUES (?, ?, ?, NULL)',
                [$id, $name, $now],
            );
        }

        foreach (ReferenceData::getMuscleGroups() as $id => $name) {
            $this->connection->executeStatement(
                'INSERT INTO muscle_groups (id, name, created_at, updated_at) VALUES (?, ?, ?, NULL)',
                [$id, $name, $now],
            );
        }

        $io->success([
            'Dados de referência inseridos.',
            'Exercise categories: ' . count(ReferenceData::getExerciseCategories()) . ' registros (IDs 1–' . count(ReferenceData::getExerciseCategories()) . ').',
            'Muscle groups: ' . count(ReferenceData::getMuscleGroups()) . ' registros (IDs 1–' . count(ReferenceData::getMuscleGroups()) . ').',
        ]);

        return Command::SUCCESS;
    }
}
