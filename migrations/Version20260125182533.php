<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260125182533 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE users ADD deleted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD email_notifications BOOLEAN DEFAULT true NOT NULL');
        $this->addSql('ALTER TABLE users ADD app_notifications BOOLEAN DEFAULT true NOT NULL');
        $this->addSql('ALTER TABLE users ADD birth_date DATE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE users DROP deleted_at');
        $this->addSql('ALTER TABLE users DROP email_notifications');
        $this->addSql('ALTER TABLE users DROP app_notifications');
        $this->addSql('ALTER TABLE users DROP birth_date');
    }
}
