<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260127115428 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE muscle_groups (id SERIAL NOT NULL, name VARCHAR(150) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_113C5C255E237E06 ON muscle_groups (name)');
        $this->addSql('COMMENT ON COLUMN muscle_groups.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN muscle_groups.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE exercises ADD muscle_group_id INT NOT NULL');
        $this->addSql('ALTER TABLE exercises ADD CONSTRAINT FK_FA1499144004D0 FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_FA1499144004D0 ON exercises (muscle_group_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE exercises DROP CONSTRAINT FK_FA1499144004D0');
        $this->addSql('DROP TABLE muscle_groups');
        $this->addSql('DROP INDEX IDX_FA1499144004D0');
        $this->addSql('ALTER TABLE exercises DROP muscle_group_id');
    }
}
