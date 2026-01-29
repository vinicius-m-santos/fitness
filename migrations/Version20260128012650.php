<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260128012650 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE period_exercise_standards (id SERIAL NOT NULL, training_period_standard_id INT NOT NULL, exercise_id INT NOT NULL, series VARCHAR(50) DEFAULT NULL, repeats VARCHAR(50) DEFAULT NULL, rest VARCHAR(100) DEFAULT NULL, observation VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_7F8DEAEDF374FCD7 ON period_exercise_standards (training_period_standard_id)');
        $this->addSql('CREATE INDEX IDX_7F8DEAEDE934951A ON period_exercise_standards (exercise_id)');
        $this->addSql('COMMENT ON COLUMN period_exercise_standards.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN period_exercise_standards.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE training_period_standards (id SERIAL NOT NULL, training_standard_id INT NOT NULL, name VARCHAR(150) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_DA2EB10CBF08695 ON training_period_standards (training_standard_id)');
        $this->addSql('COMMENT ON COLUMN training_period_standards.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN training_period_standards.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE training_standards (id SERIAL NOT NULL, personal_id INT NOT NULL, name VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_64E4DAB5D430949 ON training_standards (personal_id)');
        $this->addSql('COMMENT ON COLUMN training_standards.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN training_standards.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE period_exercise_standards ADD CONSTRAINT FK_7F8DEAEDF374FCD7 FOREIGN KEY (training_period_standard_id) REFERENCES training_period_standards (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE period_exercise_standards ADD CONSTRAINT FK_7F8DEAEDE934951A FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE training_period_standards ADD CONSTRAINT FK_DA2EB10CBF08695 FOREIGN KEY (training_standard_id) REFERENCES training_standards (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE training_standards ADD CONSTRAINT FK_64E4DAB5D430949 FOREIGN KEY (personal_id) REFERENCES personal (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE period_exercise_standards DROP CONSTRAINT FK_7F8DEAEDF374FCD7');
        $this->addSql('ALTER TABLE period_exercise_standards DROP CONSTRAINT FK_7F8DEAEDE934951A');
        $this->addSql('ALTER TABLE training_period_standards DROP CONSTRAINT FK_DA2EB10CBF08695');
        $this->addSql('ALTER TABLE training_standards DROP CONSTRAINT FK_64E4DAB5D430949');
        $this->addSql('DROP TABLE period_exercise_standards');
        $this->addSql('DROP TABLE training_period_standards');
        $this->addSql('DROP TABLE training_standards');
    }
}
