<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260130223800 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE training ADD due_date DATE DEFAULT NULL');
        $this->addSql('COMMENT ON COLUMN training.due_date IS \'(DC2Type:date_immutable)\'');
        $this->addSql('ALTER TABLE training_executions DROP rating');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE training DROP due_date');
        $this->addSql('ALTER TABLE training_executions ADD rating VARCHAR(20) DEFAULT NULL');
    }
}
