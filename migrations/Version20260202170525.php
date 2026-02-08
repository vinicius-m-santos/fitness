<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260202170525 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add executed flag to exercise_executions (false = not started or duration < 1 min, excluded from metrics)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE exercise_executions ADD executed BOOLEAN DEFAULT true NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE exercise_executions DROP executed');
    }
}
