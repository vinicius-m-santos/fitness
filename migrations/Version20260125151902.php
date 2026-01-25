<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260125151902 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE measurements ADD weight DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE measurements ADD fat_percentage DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE measurements ADD lean_mass DOUBLE PRECISION DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE measurements DROP weight');
        $this->addSql('ALTER TABLE measurements DROP fat_percentage');
        $this->addSql('ALTER TABLE measurements DROP lean_mass');
    }
}
