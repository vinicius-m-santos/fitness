<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251022153956 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE exercise_categories (id SERIAL NOT NULL, name VARCHAR(150) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_7A829A085E237E06 ON exercise_categories (name)');
        $this->addSql('COMMENT ON COLUMN exercise_categories.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN exercise_categories.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE exercises (id SERIAL NOT NULL, exercise_category_id INT NOT NULL, personal_id INT DEFAULT NULL, name VARCHAR(150) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_FA149915FB48D66 ON exercises (exercise_category_id)');
        $this->addSql('CREATE INDEX IDX_FA149915D430949 ON exercises (personal_id)');
        $this->addSql('COMMENT ON COLUMN exercises.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN exercises.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE training (id SERIAL NOT NULL, personal_id INT NOT NULL, client_id INT NOT NULL, name VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_D5128A8F5D430949 ON training (personal_id)');
        $this->addSql('CREATE INDEX IDX_D5128A8F19EB6921 ON training (client_id)');
        $this->addSql('COMMENT ON COLUMN training.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN training.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE training_periods (id SERIAL NOT NULL, training_id INT NOT NULL, exercise_id INT NOT NULL, name VARCHAR(150) NOT NULL, rest VARCHAR(50) NOT NULL, repeats INT NOT NULL, series INT NOT NULL, observation VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_BA2908ACBEFD98D1 ON training_periods (training_id)');
        $this->addSql('CREATE INDEX IDX_BA2908ACE934951A ON training_periods (exercise_id)');
        $this->addSql('COMMENT ON COLUMN training_periods.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN training_periods.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE exercises ADD CONSTRAINT FK_FA149915FB48D66 FOREIGN KEY (exercise_category_id) REFERENCES exercise_categories (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE exercises ADD CONSTRAINT FK_FA149915D430949 FOREIGN KEY (personal_id) REFERENCES personal (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE training ADD CONSTRAINT FK_D5128A8F5D430949 FOREIGN KEY (personal_id) REFERENCES personal (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE training ADD CONSTRAINT FK_D5128A8F19EB6921 FOREIGN KEY (client_id) REFERENCES clients (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE training_periods ADD CONSTRAINT FK_BA2908ACBEFD98D1 FOREIGN KEY (training_id) REFERENCES training (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE training_periods ADD CONSTRAINT FK_BA2908ACE934951A FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE exercises DROP CONSTRAINT FK_FA149915FB48D66');
        $this->addSql('ALTER TABLE exercises DROP CONSTRAINT FK_FA149915D430949');
        $this->addSql('ALTER TABLE training DROP CONSTRAINT FK_D5128A8F5D430949');
        $this->addSql('ALTER TABLE training DROP CONSTRAINT FK_D5128A8F19EB6921');
        $this->addSql('ALTER TABLE training_periods DROP CONSTRAINT FK_BA2908ACBEFD98D1');
        $this->addSql('ALTER TABLE training_periods DROP CONSTRAINT FK_BA2908ACE934951A');
        $this->addSql('DROP TABLE exercise_categories');
        $this->addSql('DROP TABLE exercises');
        $this->addSql('DROP TABLE training');
        $this->addSql('DROP TABLE training_periods');
    }
}
