<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251024021607 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE clients ADD observation VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE clients ADD avatar_key VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE clients ADD avatar_url TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE clients ADD phone VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE clients ADD email VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE clients ALTER gender DROP NOT NULL');
        $this->addSql('ALTER TABLE clients ALTER objective DROP NOT NULL');
        $this->addSql('ALTER TABLE clients ALTER blood_pressure DROP NOT NULL');
        $this->addSql('ALTER TABLE clients ALTER workout_days_per_week DROP NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE clients DROP observation');
        $this->addSql('ALTER TABLE clients DROP avatar_key');
        $this->addSql('ALTER TABLE clients DROP avatar_url');
        $this->addSql('ALTER TABLE clients DROP phone');
        $this->addSql('ALTER TABLE clients DROP email');
        $this->addSql('ALTER TABLE clients ALTER gender SET NOT NULL');
        $this->addSql('ALTER TABLE clients ALTER objective SET NOT NULL');
        $this->addSql('ALTER TABLE clients ALTER blood_pressure SET NOT NULL');
        $this->addSql('ALTER TABLE clients ALTER workout_days_per_week SET NOT NULL');
    }
}
