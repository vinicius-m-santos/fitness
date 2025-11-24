<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251217144142 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE anamnese ADD diet VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE anamnese ADD sleep VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE anamnese ADD physical_activity VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE anamnese DROP diet');
        $this->addSql('ALTER TABLE anamnese DROP sleep');
        $this->addSql('ALTER TABLE anamnese DROP physical_activity');
    }
}
