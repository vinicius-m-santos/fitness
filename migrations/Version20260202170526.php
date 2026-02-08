<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260202170526 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add google_id to users and make password nullable for Google sign-in';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users ADD google_id VARCHAR(255) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX users_google_id_unique ON users (google_id)');
        $this->addSql('ALTER TABLE users ALTER COLUMN password DROP NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX users_google_id_unique');
        $this->addSql('ALTER TABLE users DROP google_id');
        $this->addSql('ALTER TABLE users ALTER COLUMN password SET NOT NULL');
    }
}
