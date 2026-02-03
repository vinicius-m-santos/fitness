<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add show_platform_exercises to personal (flag for ROLE_PERSONAL to show/hide platform exercises).
 */
final class Version20250203120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add show_platform_exercises to personal';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE personal ADD show_platform_exercises BOOLEAN DEFAULT true NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE personal DROP show_platform_exercises');
    }
}
