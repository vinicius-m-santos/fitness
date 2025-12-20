<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute(\Attribute::TARGET_CLASS)]
final class ValidGallery extends Constraint
{
    public string $date = 'Date cannot be empty.';
    public string $visibility = 'Visibility cannot be empty.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}
