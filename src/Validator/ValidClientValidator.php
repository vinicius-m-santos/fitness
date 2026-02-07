<?php

namespace App\Validator;

use App\Entity\Client;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ValidClientValidator extends ConstraintValidator
{
    /**
     * @param Client $client
     */
    public function validate($client, Constraint $constraint)
    {
        if (!$client instanceof Client) {
            return;
        }

        $violations = [
            'name' => empty($client->getName())
                ? $constraint->name
                : null,
            'lastName' => empty($client->getLastName())
                ? $constraint->lastName
                : null,
            // 'phone' => empty($client->getPhone())
            //     ? $constraint->phone
            //     : null,
            // 'age' => empty($client->getUser()?->getAge())
            //     ? $constraint->age
            //     : null,
            // 'gender' => empty($client->getGender())
            //     ? $constraint->gender
            //     : null,
            // 'weight' => empty($client->getWeight())
            //     ? $constraint->weight
            //     : null,
            // 'height' => empty($client->getHeight())
            //     ? $constraint->height
            //     : null,
            // 'objective' => empty($client->getObjective())
            //     ? $constraint->objective
            //     : null,
            // 'workoutDaysPerWeek' => empty($client->getWorkoutDaysPerWeek())
            //     ? $constraint->workoutDaysPerWeek
            //     : null,
            // 'bloodPressure' => empty($client->getBloodPressure())
            //     ? $constraint->bloodPressure
            //     : null,
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
