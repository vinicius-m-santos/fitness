<?php

namespace App\Validator;

use App\Entity\Gallery;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ValidGalleryValidator extends ConstraintValidator
{
    /**
     * @param Gallery $gallery
     */
    public function validate($gallery, Constraint $constraint)
    {
        if (!$gallery instanceof Gallery) {
            return;
        }

        $violations = [
            'name' => empty($gallery->getName())
                ? $constraint->name
                : null,
        ];

        foreach ($violations as $field => $message) {
            if ($message) {
                $this->context->buildViolation($message)
                    ->atPath($field)
                    ->addViolation();
            }
        }
    }
}
