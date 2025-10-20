<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251020030042 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE personal (id SERIAL NOT NULL, user_id INT NOT NULL, cref VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_F18A6D84A76ED395 ON personal (user_id)');
        $this->addSql('COMMENT ON COLUMN personal.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN personal.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE personal ADD CONSTRAINT FK_F18A6D84A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE clients ADD user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE clients ADD personal_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE clients ADD CONSTRAINT FK_C82E74A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE clients ADD CONSTRAINT FK_C82E745D430949 FOREIGN KEY (personal_id) REFERENCES personal (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_C82E74A76ED395 ON clients (user_id)');
        $this->addSql('CREATE INDEX IDX_C82E745D430949 ON clients (personal_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE clients DROP CONSTRAINT FK_C82E745D430949');
        $this->addSql('ALTER TABLE personal DROP CONSTRAINT FK_F18A6D84A76ED395');
        $this->addSql('DROP TABLE personal');
        $this->addSql('ALTER TABLE clients DROP CONSTRAINT FK_C82E74A76ED395');
        $this->addSql('DROP INDEX UNIQ_C82E74A76ED395');
        $this->addSql('DROP INDEX IDX_C82E745D430949');
        $this->addSql('ALTER TABLE clients DROP user_id');
        $this->addSql('ALTER TABLE clients DROP personal_id');
    }
}
