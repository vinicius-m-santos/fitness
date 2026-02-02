<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260201160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Adiciona due_date em training_standards';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE training_standards ADD due_date DATE DEFAULT NULL');
        $this->addSql("COMMENT ON COLUMN training_standards.due_date IS '(DC2Type:date_immutable)'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE training_standards DROP due_date');
    }
}
