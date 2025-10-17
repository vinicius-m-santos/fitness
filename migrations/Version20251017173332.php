<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251017173332 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE anamnese (id SERIAL NOT NULL, medical_restriction VARCHAR(255) NOT NULL, cronical_pain VARCHAR(255) NOT NULL, controled_medicine VARCHAR(255) NOT NULL, heart_problem VARCHAR(255) NOT NULL, recent_surgery VARCHAR(255) NOT NULL, time_without_gym VARCHAR(255) NOT NULL, ocupation VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN anamnese.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN anamnese.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE clients (id SERIAL NOT NULL, user_id INT NOT NULL, name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, age INT DEFAULT NULL, gender VARCHAR(1) NOT NULL, weight DOUBLE PRECISION DEFAULT NULL, height DOUBLE PRECISION DEFAULT NULL, objective INT NOT NULL, blood_pressure VARCHAR(10) NOT NULL, workout_days_per_week INT NOT NULL, active BOOLEAN DEFAULT true NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_C82E74A76ED395 ON clients (user_id)');
        $this->addSql('COMMENT ON COLUMN clients.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN clients.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE "refresh_tokens" (id SERIAL NOT NULL, refresh_token VARCHAR(128) NOT NULL, username VARCHAR(255) NOT NULL, valid TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_9BACE7E1C74F2195 ON "refresh_tokens" (refresh_token)');
        $this->addSql('CREATE TABLE "user" (id SERIAL NOT NULL, email VARCHAR(255) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649E7927C74 ON "user" (email)');
        $this->addSql('COMMENT ON COLUMN "user".created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN "user".updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE clients ADD CONSTRAINT FK_C82E74A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE clients DROP CONSTRAINT FK_C82E74A76ED395');
        $this->addSql('DROP TABLE anamnese');
        $this->addSql('DROP TABLE clients');
        $this->addSql('DROP TABLE "refresh_tokens"');
        $this->addSql('DROP TABLE "user"');
    }
}
