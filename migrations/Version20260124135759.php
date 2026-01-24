<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260124135759 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DELETE FROM measurements');
        $this->addSql('ALTER TABLE measurements ADD date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL');
        $this->addSql('ALTER TABLE measurements ADD right_arm DOUBLE PRECISION NOT NULL');
        $this->addSql('ALTER TABLE measurements ADD left_arm DOUBLE PRECISION NOT NULL');
        $this->addSql('ALTER TABLE measurements ADD right_leg DOUBLE PRECISION NOT NULL');
        $this->addSql('ALTER TABLE measurements ADD left_leg DOUBLE PRECISION NOT NULL');
        $this->addSql('ALTER TABLE measurements DROP month');
        $this->addSql('ALTER TABLE measurements DROP arm');
        $this->addSql('ALTER TABLE measurements DROP leg');
        $this->addSql('COMMENT ON COLUMN measurements.date IS \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE measurements ADD month VARCHAR(50) NOT NULL');
        $this->addSql('ALTER TABLE measurements ADD arm DOUBLE PRECISION NOT NULL');
        $this->addSql('ALTER TABLE measurements ADD leg DOUBLE PRECISION NOT NULL');
        $this->addSql('ALTER TABLE measurements DROP date');
        $this->addSql('ALTER TABLE measurements DROP right_arm');
        $this->addSql('ALTER TABLE measurements DROP left_arm');
        $this->addSql('ALTER TABLE measurements DROP right_leg');
        $this->addSql('ALTER TABLE measurements DROP left_leg');
    }
}
