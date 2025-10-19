<?php

namespace App\Validator;

use App\Entity\Anamnese;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ValidAnamneseValidator extends ConstraintValidator
{
    /**
     * @param Anamnese $anamnese
     */
    public function validate($anamnese, Constraint $constraint)
    {
        if (!$anamnese instanceof Anamnese) {
            return;
        }

        $violations = [
            'name' => empty($anamnese->getMedicalRestriction())
                ? $constraint->medicalRestriction
                : null,
            'lastName' => empty($anamnese->getCronicalPain())
                ? $constraint->cronicalPain
                : null,
            'age' => empty($anamnese->getControledMedicine())
                ? $constraint->controledMedicine
                : null,
            'gender' => empty($anamnese->getHeartProblem())
                ? $constraint->heartProblem
                : null,
            'weight' => empty($anamnese->getRecentSurgery())
                ? $constraint->recentSurgery
                : null,
            'height' => empty($anamnese->getTimeWithoutGym())
                ? $constraint->timeWithoutGym
                : null,
            'objective' => empty($anamnese->getOcupation())
                ? $constraint->ocupation
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
