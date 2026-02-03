"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedExerciseByPeriod, setSelectedExerciseByPeriod] = useState<
    Record<number, { id: number; name: string } | null>
  >({});

  const form = useForm<TrainingCreateSchema>({
    resolver: zodResolver(trainingCreateSchema),
    mode: "onChange",
    defaultValues: defaultValues ?? {
      name: "",
      dueDate: "",
      periods: [],
    },
  });

  const periods = form.watch("periods");

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

  const reorderPeriods = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0 || oldIndex >= periods.length || newIndex >= periods.length) return;
    const next = [...periods];
    const [removed] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, removed);
    form.setValue("periods", next, { shouldDirty: true, shouldValidate: true });
  };

  /* =====================
   * EXERCISE HELPERS
   * ===================== */

  const addExercise = (periodId: number) => {
    const selected = selectedExerciseByPeriod[periodId];
    if (!selected) return;

    form.setValue(
      "periods",
      periods.map((p) =>
        p.id === periodId
          ? {
            ...p,
            exercises: [
              ...p.exercises,
              {
                instanceId: `${p.id}-${selected.id}-${Math.random()
                  .toString(36)
                  .slice(2)}`,
                id: selected.id,
                name: selected.name,
                series: "1",
                reps: "1",
                rest: "0",
                obs: "",
              },
            ],
          }
          : p
      ),
      { shouldValidate: true }
    );

    setSelectedExerciseByPeriod((prev) => ({ ...prev, [periodId]: null }));
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

  const reorderExercises = (periodId: number, oldIndex: number, newIndex: number) => {
    const period = periods.find((p) => p.id === periodId);
    if (!period || oldIndex === newIndex || oldIndex < 0 || newIndex < 0 || oldIndex >= period.exercises.length || newIndex >= period.exercises.length) return;
    const nextExercises = [...period.exercises];
    const [removed] = nextExercises.splice(oldIndex, 1);
    nextExercises.splice(newIndex, 0, removed);
    form.setValue(
      "periods",
      periods.map((p) => (p.id === periodId ? { ...p, exercises: nextExercises } : p)),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  /* =====================
   * RESET
   * ===================== */

  const resetForm = (
    values?: TrainingCreateSchema,
    options?: {
      step?: number;
      selectedExerciseByPeriod?: Record<number, { id: number; name: string } | null>;
    }
  ) => {
    form.reset(values ?? { name: "", dueDate: "", periods: [] });
    setCurrentStep(options?.step ?? 1);
    setSelectedExerciseByPeriod(options?.selectedExerciseByPeriod ?? {});
  };

  return {
    form,
    periods,
    currentStep,
    nextStep,
    prevStep,
    resetForm,
    selectedExerciseByPeriod,
    setSelectedExerciseByPeriod,
    addPeriod,
    removePeriod,
    updatePeriodName,
    reorderPeriods,
    addExercise,
    updateExercise,
    removeExercise,
    reorderExercises,
  };
}
