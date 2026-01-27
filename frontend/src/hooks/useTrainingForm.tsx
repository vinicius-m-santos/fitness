"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useRequest } from "@/api/request";
import { trainingCreateSchema, TrainingCreateSchema } from "@/schemas/training";
import getFirstErrorMessage from "@/utils/ValidatorMessageExtractor";

type UseTrainingFormProps = {
  defaultValues?: TrainingCreateSchema;
  onInvalidStep?: () => void;
};

export function useTrainingForm({
  defaultValues,
  onInvalidStep,
}: UseTrainingFormProps = {}) {
  const request = useRequest();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedExercises, setSelectedExercises] = useState<
    Record<number, string>
  >({});

  const form = useForm<TrainingCreateSchema>({
    resolver: zodResolver(trainingCreateSchema),
    mode: "onChange",
    defaultValues: defaultValues ?? {
      name: "",
      periods: [],
    },
  });

  const periods = form.watch("periods");

  /* =====================
   * DATA
   * ===================== */

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const res = await request({ method: "GET", url: "/exercise/all" });
      return res.exercises;
    },
    staleTime: 5 * 60 * 1000,
  });

  /* =====================
   * STEP CONTROL
   * ===================== */

  const nextStep = async () => {
    let valid = false;

    if (currentStep === 1) {
      valid = await form.trigger("name");
    }

    if (currentStep === 2) {
      if (periods.length === 0) {
        toast.error("Adicione pelo menos um período");
        onInvalidStep?.();
        return;
      }

      const paths = periods.map((_, index) => `periods.${index}.name` as const);
      valid = await form.trigger(paths);
    }

    if (currentStep === 3) {
      valid = await form.trigger("periods");
    }

    if (!valid) {
      console.log(form.formState);
      const message = getFirstErrorMessage(form.formState.errors);
      if (message) toast.error(message);
      onInvalidStep?.();
      return;
    }

    setCurrentStep((s) => s + 1);
  };

  const prevStep = () => setCurrentStep((s) => s - 1);

  /* =====================
   * PERIOD HELPERS
   * ===================== */

  const addPeriod = (name: string) => {
    form.setValue(
      "periods",
      [...periods, { id: Date.now(), name, exercises: [] }],
      { shouldValidate: true }
    );
  };

  const removePeriod = (id: number) => {
    form.setValue(
      "periods",
      periods.filter((p) => p.id !== id),
      { shouldValidate: true }
    );
  };

  const updatePeriodName = (id: number, name: string) => {
    form.setValue(
      "periods",
      periods.map((p) => (p.id === id ? { ...p, name } : p)),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  /* =====================
   * EXERCISE HELPERS
   * ===================== */

  const addExercise = (periodId: number) => {
    const exerciseId = selectedExercises[periodId];
    if (!exerciseId) return;

    const exercise = exercises.find((e) => e.id.toString() === exerciseId);
    if (!exercise) return;

    form.setValue(
      "periods",
      periods.map((p) =>
        p.id === periodId
          ? {
              ...p,
              exercises: [
                ...p.exercises,
                {
                  instanceId: `${p.id}-${exercise.id}-${Math.random()
                    .toString(36)
                    .slice(2)}`,
                  id: exercise.id,
                  name: exercise.name,
                  series: "",
                  reps: "",
                  rest: "",
                  obs: "",
                },
              ],
            }
          : p
      ),
      { shouldValidate: true }
    );

    setSelectedExercises((prev) => ({ ...prev, [periodId]: "" }));
  };

  const updateExercise = (
    periodId: number,
    instanceId: string | undefined,
    field: string,
    value: string
  ) => {
    form.setValue(
      "periods",
      periods.map((p) =>
        p.id === periodId
          ? {
              ...p,
              exercises: p.exercises.map((e) =>
                e.instanceId === instanceId ? { ...e, [field]: value } : e
              ),
            }
          : p
      ),
      { shouldValidate: true }
    );
  };

  const removeExercise = (periodId: number, instanceId: string | undefined) => {
    form.setValue(
      "periods",
      periods.map((p) =>
        p.id === periodId
          ? {
              ...p,
              exercises: p.exercises.filter((e) => e.instanceId !== instanceId),
            }
          : p
      ),
      { shouldValidate: true }
    );
  };

  /* =====================
   * RESET
   * ===================== */

  const resetForm = (values?: TrainingCreateSchema) => {
    form.reset(values ?? { name: "", periods: [] });
    setCurrentStep(1);
    setSelectedExercises({});
  };

  return {
    form,
    periods,
    exercises,
    currentStep,
    nextStep,
    prevStep,
    resetForm,
    selectedExercises,
    setSelectedExercises,
    addPeriod,
    removePeriod,
    updatePeriodName,
    addExercise,
    updateExercise,
    removeExercise,
  };
}
