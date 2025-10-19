<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251019142738 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE anamnese ADD client_id INT NOT NULL');
        $this->addSql('ALTER TABLE anamnese ADD CONSTRAINT FK_ACCF11EE19EB6921 FOREIGN KEY (client_id) REFERENCES clients (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_ACCF11EE19EB6921 ON anamnese (client_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE anamnese DROP CONSTRAINT FK_ACCF11EE19EB6921');
        $this->addSql('DROP INDEX UNIQ_ACCF11EE19EB6921');
        $this->addSql('ALTER TABLE anamnese DROP client_id');
    }
}
