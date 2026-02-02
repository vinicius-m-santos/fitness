<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Re-add rating column to training_executions (was dropped in Version20260130223800).
 * Stored as VARCHAR for PHP WorkoutRatingEnum (bad, neutral, good).
 */
final class Version20260202180000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Re-add rating column to training_executions';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE training_executions ADD rating VARCHAR(20) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE training_executions DROP rating');
    }
}
