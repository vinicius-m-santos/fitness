<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251220192228 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE period_exercises ALTER series TYPE VARCHAR(50)');
        $this->addSql('ALTER TABLE period_exercises ALTER repeats TYPE VARCHAR(50)');
        $this->addSql('ALTER TABLE period_exercises ALTER rest TYPE VARCHAR(100)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE period_exercises ALTER series TYPE VARCHAR(10)');
        $this->addSql('ALTER TABLE period_exercises ALTER repeats TYPE VARCHAR(10)');
        $this->addSql('ALTER TABLE period_exercises ALTER rest TYPE VARCHAR(50)');
    }
}
