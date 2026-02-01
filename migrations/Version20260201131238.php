<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260201150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cria tabelas plan e subscription para planos do personal';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE plan (
            id SERIAL NOT NULL,
            code VARCHAR(50) NOT NULL,
            name VARCHAR(100) NOT NULL,
            capabilities JSON NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_PLAN_CODE ON plan (code)');

        $this->addSql('CREATE TABLE subscription (
            id SERIAL NOT NULL,
            personal_id INT NOT NULL,
            plan_id INT NOT NULL,
            status VARCHAR(20) NOT NULL,
            started_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            ends_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_SUBSCRIPTION_PERSONAL ON subscription (personal_id)');
        $this->addSql('CREATE INDEX IDX_SUBSCRIPTION_PLAN ON subscription (plan_id)');
        $this->addSql('COMMENT ON COLUMN subscription.started_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN subscription.ends_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_SUBSCRIPTION_PERSONAL FOREIGN KEY (personal_id) REFERENCES personal (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_SUBSCRIPTION_PLAN FOREIGN KEY (plan_id) REFERENCES plan (id) NOT DEFERRABLE INITIALLY IMMEDIATE');

        $now = (new \DateTimeImmutable())->format('Y-m-d H:i:s');
        $this->addSql("INSERT INTO plan (id, code, name, capabilities) VALUES (1, 'free', 'Gratuito', '{\"max_students\": 3}')");
        $this->addSql("INSERT INTO plan (id, code, name, capabilities) VALUES (2, 'pro', 'Pro', '{\"max_students\": null}')");
        $this->addSql("INSERT INTO plan (id, code, name, capabilities) VALUES (3, 'lifetime', 'Lifetime', '{\"max_students\": null}')");
        $this->addSql("SELECT setval('plan_id_seq', 3)");

        $this->addSql("INSERT INTO subscription (personal_id, plan_id, status, started_at, ends_at)
            SELECT p.id, 1, 'active', CURRENT_TIMESTAMP, NULL FROM personal p");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE subscription DROP CONSTRAINT FK_SUBSCRIPTION_PERSONAL');
        $this->addSql('ALTER TABLE subscription DROP CONSTRAINT FK_SUBSCRIPTION_PLAN');
        $this->addSql('DROP TABLE subscription');
        $this->addSql('DROP TABLE plan');
    }
}
