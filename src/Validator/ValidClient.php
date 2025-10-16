<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute(\Attribute::TARGET_CLASS)]
final class ValidClient extends Constraint
{
    public string $name = 'Name cannot be empty.';
    public string $lastName = 'Lastname cannot be empty.';
    public string $age = 'Age cannot be empty.';
    public string $gender = 'Gender cannot be empty.';
    public string $weight = 'Weight cannot be empty.';
    public string $height = 'Height cannot be empty.';
    public string $objective = 'Objective cannot be empty.';
    public string $bloodPressure = 'Blood pressure cannot be empty.';
    public string $workoutDaysPerWeek = 'Workout days per week cannot be empty.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}
