<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251020025753 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE clients DROP CONSTRAINT fk_c82e74a76ed395');
        $this->addSql('DROP INDEX idx_c82e74a76ed395');
        $this->addSql('ALTER TABLE clients DROP user_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE clients ADD user_id INT NOT NULL');
        $this->addSql('ALTER TABLE clients ADD CONSTRAINT fk_c82e74a76ed395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_c82e74a76ed395 ON clients (user_id)');
    }
}
