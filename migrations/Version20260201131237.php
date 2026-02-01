<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use App\Data\ReferenceData;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Limpa exercise_categories e muscle_groups e insere dados fixos com IDs sequenciais
 * (1, 2, 3...) para previsibilidade entre ambientes.
 */
final class Version20260201140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Popula exercise_categories e muscle_groups com IDs sequenciais fixos';
    }

    public function up(Schema $schema): void
    {
        // Remove categorias (CASCADE remove exercises que referenciam); depois remove muscle_groups
        $this->connection->executeStatement('DELETE FROM exercise_categories');
        $this->connection->executeStatement('DELETE FROM muscle_groups');

        $now = (new \DateTimeImmutable())->format('Y-m-d H:i:s');

        foreach (ReferenceData::getExerciseCategories() as $id => $name) {
            $this->connection->executeStatement(
                'INSERT INTO exercise_categories (id, name, created_at, updated_at) VALUES (?, ?, ?, NULL)',
                [$id, $name, $now]
            );
        }

        foreach (ReferenceData::getMuscleGroups() as $id => $name) {
            $this->connection->executeStatement(
                'INSERT INTO muscle_groups (id, name, created_at, updated_at) VALUES (?, ?, ?, NULL)',
                [$id, $name, $now]
            );
        }

        // Recria sequences para futuros inserts (próximos IDs: 9 para categorias, 17 para grupos)
        $this->addSql('CREATE SEQUENCE exercise_categories_id_seq');
        $this->addSql("SELECT setval('exercise_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM exercise_categories))");
        $this->addSql('ALTER TABLE exercise_categories ALTER id SET DEFAULT nextval(\'exercise_categories_id_seq\')');

        $this->addSql('CREATE SEQUENCE muscle_groups_id_seq');
        $this->addSql("SELECT setval('muscle_groups_id_seq', (SELECT COALESCE(MAX(id), 1) FROM muscle_groups))");
        $this->addSql('ALTER TABLE muscle_groups ALTER id SET DEFAULT nextval(\'muscle_groups_id_seq\')');
    }

    public function down(Schema $schema): void
    {
        $this->connection->executeStatement('DELETE FROM exercise_categories');
        $this->connection->executeStatement('DELETE FROM muscle_groups');

        $this->addSql('DROP SEQUENCE exercise_categories_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE muscle_groups_id_seq CASCADE');
        $this->addSql('ALTER TABLE exercise_categories ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE muscle_groups ALTER id DROP DEFAULT');
    }
}
