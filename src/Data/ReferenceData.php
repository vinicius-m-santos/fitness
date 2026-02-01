<?php

declare(strict_types=1);

namespace App\Data;

/**
 * Dados fixos de referência para previsibilidade entre ambientes (local/produção).
 * IDs sequenciais garantem que frontend e backend usem os mesmos identificadores.
 */
final class ReferenceData
{
    /**
     * Ordem e IDs fixos para exercise_categories.
     * @return array<int, string> id => name
     */
    public static function getExerciseCategories(): array
    {
        return [
            1 => 'Musculação',
            2 => 'Aeróbico',
            3 => 'Funcional',
            4 => 'Alongamento',
            5 => 'Em casa',
            6 => 'Mobilidade',
            7 => 'Elástico',
            8 => 'MAT Pilates',
            9 => 'Laboral',
        ];
    }

    /**
     * Ordem e IDs fixos para muscle_groups.
     * @return array<int, string> id => name
     */
    public static function getMuscleGroups(): array
    {
        return [
            1 => 'Abdômen',
            2 => 'Aeróbio',
            3 => 'Alongamento',
            4 => 'Antebraço',
            5 => 'Bíceps',
            6 => 'Dorsal',
            7 => 'Elásticos e Faixas',
            8 => 'Funcional',
            9 => 'Inferiores',
            10 => 'Laboral',
            11 => 'MAT Pilates',
            12 => 'Mobilidade',
            13 => 'Ombro',
            14 => 'Outros',
            15 => 'Para Fazer em Casa',
            16 => 'Peitoral',
            17 => 'Tríceps',
        ];
    }
}
