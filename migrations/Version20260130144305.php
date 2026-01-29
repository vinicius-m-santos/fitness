<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260130144305 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE exercise_executions (id SERIAL NOT NULL, training_execution_id INT NOT NULL, period_exercise_id INT NOT NULL, execution_order INT DEFAULT 1 NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_9D716A0E4F017949 ON exercise_executions (training_execution_id)');
        $this->addSql('CREATE INDEX IDX_9D716A0E9DED4EED ON exercise_executions (period_exercise_id)');
        $this->addSql('CREATE TABLE set_executions (id SERIAL NOT NULL, exercise_execution_id INT NOT NULL, set_number INT NOT NULL, load_kg DOUBLE PRECISION DEFAULT NULL, rest_seconds INT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_A6E9CB65BD8AE06D ON set_executions (exercise_execution_id)');
        $this->addSql('CREATE TABLE training_executions (id SERIAL NOT NULL, training_id INT NOT NULL, client_id INT NOT NULL, started_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, finished_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_67BE0C08BEFD98D1 ON training_executions (training_id)');
        $this->addSql('CREATE INDEX IDX_67BE0C0819EB6921 ON training_executions (client_id)');
        $this->addSql('COMMENT ON COLUMN training_executions.started_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN training_executions.finished_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE exercise_executions ADD CONSTRAINT FK_9D716A0E4F017949 FOREIGN KEY (training_execution_id) REFERENCES training_executions (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE exercise_executions ADD CONSTRAINT FK_9D716A0E9DED4EED FOREIGN KEY (period_exercise_id) REFERENCES period_exercises (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE set_executions ADD CONSTRAINT FK_A6E9CB65BD8AE06D FOREIGN KEY (exercise_execution_id) REFERENCES exercise_executions (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE training_executions ADD CONSTRAINT FK_67BE0C08BEFD98D1 FOREIGN KEY (training_id) REFERENCES training (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE training_executions ADD CONSTRAINT FK_67BE0C0819EB6921 FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE exercise_executions DROP CONSTRAINT FK_9D716A0E4F017949');
        $this->addSql('ALTER TABLE exercise_executions DROP CONSTRAINT FK_9D716A0E9DED4EED');
        $this->addSql('ALTER TABLE set_executions DROP CONSTRAINT FK_A6E9CB65BD8AE06D');
        $this->addSql('ALTER TABLE training_executions DROP CONSTRAINT FK_67BE0C08BEFD98D1');
        $this->addSql('ALTER TABLE training_executions DROP CONSTRAINT FK_67BE0C0819EB6921');
        $this->addSql('DROP TABLE exercise_executions');
        $this->addSql('DROP TABLE set_executions');
        $this->addSql('DROP TABLE training_executions');
    }
}
