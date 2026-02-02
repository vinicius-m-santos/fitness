<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260202170521 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE exercise_categories_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE muscle_groups_id_seq CASCADE');
        $this->addSql('ALTER TABLE exercise_categories ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE muscle_groups ALTER id DROP DEFAULT');
        $this->addSql('ALTER INDEX uniq_plan_code RENAME TO UNIQ_DD5A5B7D77153098');
        $this->addSql('ALTER INDEX idx_subscription_personal RENAME TO IDX_A3C664D35D430949');
        $this->addSql('ALTER INDEX idx_subscription_plan RENAME TO IDX_A3C664D3E899029B');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('CREATE SEQUENCE exercise_categories_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE muscle_groups_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('ALTER INDEX uniq_dd5a5b7d77153098 RENAME TO uniq_plan_code');
        $this->addSql('ALTER INDEX idx_a3c664d35d430949 RENAME TO idx_subscription_personal');
        $this->addSql('ALTER INDEX idx_a3c664d3e899029b RENAME TO idx_subscription_plan');
        $this->addSql('CREATE SEQUENCE muscle_groups_id_seq');
        $this->addSql('SELECT setval(\'muscle_groups_id_seq\', (SELECT MAX(id) FROM muscle_groups))');
        $this->addSql('ALTER TABLE muscle_groups ALTER id SET DEFAULT nextval(\'muscle_groups_id_seq\')');
        $this->addSql('CREATE SEQUENCE exercise_categories_id_seq');
        $this->addSql('SELECT setval(\'exercise_categories_id_seq\', (SELECT MAX(id) FROM exercise_categories))');
        $this->addSql('ALTER TABLE exercise_categories ALTER id SET DEFAULT nextval(\'exercise_categories_id_seq\')');
    }
}
