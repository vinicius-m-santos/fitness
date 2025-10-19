<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute(\Attribute::TARGET_CLASS)]
final class ValidAnamnese extends Constraint
{
    public string $medicalRestriction = 'Medical restriction cannot be empty.';
    public string $cronicalPain = 'Cronical pain cannot be empty.';
    public string $controledMedicine = 'Controled medicine cannot be empty.';
    public string $heartProblem = 'Heart problem cannot be empty.';
    public string $recentSurgery = 'Recent surgery cannot be empty.';
    public string $timeWithoutGym = 'Time without gym cannot be empty.';
    public string $ocupation = 'Ocupation cannot be empty.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}
