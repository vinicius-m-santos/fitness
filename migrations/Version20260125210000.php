<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260125210000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add deletedAt, emailNotifications and appNotifications columns to users table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users ADD deleted_at DATE DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD email_notifications TINYINT(1) DEFAULT 1 NOT NULL');
        $this->addSql('ALTER TABLE users ADD app_notifications TINYINT(1) DEFAULT 1 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users DROP deleted_at');
        $this->addSql('ALTER TABLE users DROP email_notifications');
        $this->addSql('ALTER TABLE users DROP app_notifications');
    }
}
