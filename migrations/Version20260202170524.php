<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260202170524 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add method, skinfold fields (pectoral, abdominal, thigh, triceps, suprailiac) and fat_mass to measurements';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE measurements ADD method VARCHAR(50) DEFAULT \'pollock_3\' NOT NULL');
        $this->addSql('ALTER TABLE measurements ADD pectoral DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE measurements ADD abdominal DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE measurements ADD thigh DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE measurements ADD triceps DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE measurements ADD suprailiac DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE measurements ADD fat_mass DOUBLE PRECISION DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE measurements DROP method');
        $this->addSql('ALTER TABLE measurements DROP pectoral');
        $this->addSql('ALTER TABLE measurements DROP abdominal');
        $this->addSql('ALTER TABLE measurements DROP thigh');
        $this->addSql('ALTER TABLE measurements DROP triceps');
        $this->addSql('ALTER TABLE measurements DROP suprailiac');
        $this->addSql('ALTER TABLE measurements DROP fat_mass');
    }
}
