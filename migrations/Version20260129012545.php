<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260129012545 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE training ADD is_standard BOOLEAN DEFAULT false NOT NULL');
        $this->addSql('ALTER TABLE training_standards ADD training_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE training_standards ADD CONSTRAINT FK_64E4DABBEFD98D1 FOREIGN KEY (training_id) REFERENCES training (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_64E4DABBEFD98D1 ON training_standards (training_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE training DROP is_standard');
        $this->addSql('ALTER TABLE training_standards DROP CONSTRAINT FK_64E4DABBEFD98D1');
        $this->addSql('DROP INDEX IDX_64E4DABBEFD98D1');
        $this->addSql('ALTER TABLE training_standards DROP training_id');
    }
}
