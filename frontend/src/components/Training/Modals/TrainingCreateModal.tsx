import { useEffect, useRef, useState } from "react";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import toast from "react-hot-toast";
import { useApi } from "@/api/Api";
import { useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "react-responsive";

import StepName from "./TrainingCreateModal/Steps/StepName";
import StepPeriods from "./TrainingCreateModal/Steps/StepPeriods";
import StepExercises from "./TrainingCreateModal/Steps/StepExercises";
import StepReview from "./TrainingCreateModal/Steps/StepReview";

import { useTrainingForm } from "@/hooks/useTrainingForm";
import { useTrainingDraft } from "@/hooks/useTrainingDraft";
import { TrainingCreateSchema } from "@/schemas/training";
import { useWorkoutDraftStore, getDraftContextKey } from "@/stores/workoutDraftStore";
import type { TrainingDraft } from "@/types/trainingDraft";
import { NormalizeTrainingData } from "@/utils/NormalizeTrainingData";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: number;
  initialDraft?: TrainingDraft | null;
  onRestored?: () => void;
};

export default function TrainingCreateModal({
  open,
  onOpenChange,
  client,
  initialDraft,
  onRestored,
}: Props) {
  const api = useApi();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const restoredRef = useRef(false);
  const [loading, setLoading] = useState(false);

  const training = useTrainingForm();
  const formData = training.form.watch();
  const navigate = useNavigate();

  const { flushDraft } = useTrainingDraft({
    type: "training-create",
    clientId: client,
    enabled: open,
    step: training.currentStep,
    formData,
    getFormData: () => training.form.getValues(),
    selectedExerciseByPeriod: training.selectedExerciseByPeriod,
    formSubscribe: open
      ? (cb) =>
        training.form.subscribe({
          formState: { values: true },
          callback: cb,
        })
      : undefined,
  });

  useEffect(() => {
    if (!open || !initialDraft || restoredRef.current) return;

    restoredRef.current = true;

    const normalized = NormalizeTrainingData(initialDraft.formData);

    training.resetForm(normalized, {
      step: initialDraft.step,
      selectedExerciseByPeriod: initialDraft.selectedExerciseByPeriod ?? {},
    });
  }, [open, initialDraft]);

  // Reset flags ao fechar
  useEffect(() => {
    if (!open) {
      restoredRef.current = false;
      if (!initialDraft) training.resetForm();
    }
  }, [open, initialDraft]);

  const onSubmit = async (data: TrainingCreateSchema) => {
    try {
      setLoading(true);
      const payload: Record<string, unknown> = { ...data, client };
      await api.post("/training/create", payload);
      toast.success("Treino criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      useWorkoutDraftStore
        .getState()
        .clearDraft(getDraftContextKey("training-create", { clientId: client }));
      navigate(location.pathname, { replace: true, state: undefined });
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar treino");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) onRestored?.();
    }}>
      <DialogContent
        className="flex max-h-[85vh] max-w-[calc(100vw-1rem)] flex-col gap-4 overflow-hidden rounded-2xl sm:max-w-3xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Criar treino</DialogTitle>
          <DialogDescription>Criação guiada de treino</DialogDescription>
        </DialogHeader>

        <Form {...training.form}>
          <form onSubmit={training.form.handleSubmit(onSubmit)} className="space-y-6">
            {training.currentStep === 1 && <StepName form={training.form} />}

            {training.currentStep === 2 && (
              <StepPeriods
                periods={training.periods}
                onAddPeriod={training.addPeriod}
                onRemovePeriod={(id) => {
                  training.removePeriod(id);
                  flushDraft();
                }}
                onUpdatePeriodName={(id, name) => {
                  training.updatePeriodName(id, name);
                  flushDraft();
                }}
                onReorderPeriods={(oldIndex, newIndex) => {
                  training.reorderPeriods(oldIndex, newIndex);
                  flushDraft();
                }}
                isMobile={isMobile}
              />
            )}

            {training.currentStep === 3 && (
              <StepExercises
                periods={training.periods}
                isMobile={isMobile}
                selectedExerciseByPeriod={training.selectedExerciseByPeriod}
                setSelectedExerciseByPeriod={training.setSelectedExerciseByPeriod}
                onAddExercise={(periodId) => {
                  training.addExercise(periodId);
                  flushDraft();
                }}
                onUpdateExercise={training.updateExercise}
                onRemoveExercise={(periodId, instanceId) => {
                  training.removeExercise(periodId, instanceId);
                  flushDraft();
                }}
                onReorderExercises={(periodId, oldIndex, newIndex) => {
                  training.reorderExercises(periodId, oldIndex, newIndex);
                  flushDraft();
                }}
              />
            )}

            {training.currentStep === 4 && (
              <StepReview periods={training.periods} form={training.form} />
            )}

            <div className="flex justify-between pt-4">
              {training.currentStep > 1 && (
                <Button type="button" size="sm" variant="outline" onClick={training.prevStep}>
                  Voltar
                </Button>
              )}

              {training.currentStep < 4 ? (
                <Button type="button" size="sm" onClick={training.nextStep}>
                  Próximo
                </Button>
              ) : (
                <SaveButton size="sm" type="submit" loading={loading} />
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
