<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260131215536 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users ADD gender VARCHAR(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD active BOOLEAN DEFAULT true NOT NULL');

        $this->addSql('
            UPDATE users u
            SET first_name = c.name,
                last_name = c.last_name,
                gender = c.gender,
                active = c.active
            FROM clients c
            WHERE c.user_id = u.id
        ');

        $this->addSql('ALTER TABLE clients DROP name');
        $this->addSql('ALTER TABLE clients DROP last_name');
        $this->addSql('ALTER TABLE clients DROP age');
        $this->addSql('ALTER TABLE clients DROP gender');
        $this->addSql('ALTER TABLE clients DROP active');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE clients ADD name VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE clients ADD last_name VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE clients ADD age INT DEFAULT NULL');
        $this->addSql('ALTER TABLE clients ADD gender VARCHAR(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE clients ADD active BOOLEAN DEFAULT true NOT NULL');

        $this->addSql('
            UPDATE clients c
            SET name = u.first_name,
                last_name = u.last_name,
                gender = u.gender,
                active = u.active
            FROM users u
            WHERE c.user_id = u.id
        ');

        $this->addSql('ALTER TABLE clients ALTER COLUMN name DROP DEFAULT');
        $this->addSql('ALTER TABLE clients ALTER COLUMN last_name DROP DEFAULT');
        $this->addSql('ALTER TABLE clients ALTER COLUMN active DROP DEFAULT');

        $this->addSql('ALTER TABLE users DROP gender');
        $this->addSql('ALTER TABLE users DROP active');
    }
}
