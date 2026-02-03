import { useEffect, useMemo, useRef, useState } from "react";
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
import { NormalizeTrainingData } from "@/utils/NormalizeTrainingData";
import { useWorkoutDraftStore, getDraftContextKey } from "@/stores/workoutDraftStore";
import type { TrainingDraft } from "@/types/trainingDraft";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingId: number;
  initialData: TrainingCreateSchema;
  clientId?: number;
  initialDraft?: TrainingDraft | null;
  onRestored?: () => void;
};

export default function TrainingUpdateModal({
  open,
  onOpenChange,
  trainingId,
  initialData,
  clientId,
  initialDraft,
  onRestored,
}: Props) {
  const api = useApi();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const restoredRef = useRef(false);
  const [restoreApplied, setRestoreApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const training = useTrainingForm({
    defaultValues: initialData,
  });
  const formData = training.form.watch();
  const normalized = useMemo(() => NormalizeTrainingData(initialData), [initialData]);
  const prevOpenRef = useRef(false);
  const navigate = useNavigate();
  const draftEnabled = open;

  const { flushDraft } = useTrainingDraft({
    type: "training-update",
    clientId,
    trainingId,
    enabled: draftEnabled,
    step: training.currentStep,
    formData,
    getFormData: () => training.form.getValues(),
    selectedExerciseByPeriod: training.selectedExerciseByPeriod,
    formSubscribe: draftEnabled
      ? (cb) =>
        training.form.subscribe({
          formState: { values: true },
          callback: cb,
        })
      : undefined,
  });

  useEffect(() => {
    if (open && !initialDraft) {
      if (!prevOpenRef.current) {
        training.resetForm(normalized);
        setTimeout(() => training.form.trigger());
      }
      prevOpenRef.current = true;
    }
    if (!open) {
      prevOpenRef.current = false;
      if (!open) {
        restoredRef.current = false;
        setRestoreApplied(false);
      }
    }
  }, [open, normalized, initialDraft]);

  useEffect(() => {
    if (open && initialDraft && initialDraft.type === "training-update" && !restoredRef.current) {
      restoredRef.current = true;
      setRestoreApplied(true);
      const normalizedDraft = NormalizeTrainingData(initialDraft.formData);
      training.resetForm(normalizedDraft, {
        step: initialDraft.step,
        selectedExerciseByPeriod: initialDraft.selectedExerciseByPeriod ?? {},
      });
      setTimeout(() => training.form.trigger());
    }
  }, [open, initialDraft]);

  useEffect(() => {
    if (!open || !initialDraft || restoredRef.current) return;

    restoredRef.current = true;

    training.resetForm(
      NormalizeTrainingData(initialDraft.formData),
      {
        step: initialDraft.step,
        selectedExerciseByPeriod: initialDraft.selectedExerciseByPeriod ?? {},
      }
    );
  }, [open, initialDraft]);

  const onSubmit = async (data: TrainingCreateSchema) => {
    try {
      setLoading(true);
      await api.put(`/training/${trainingId}`, data);
      toast.success("Treino atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      useWorkoutDraftStore.getState().clearDraft(getDraftContextKey("training-update", { trainingId }));
      navigate(location.pathname, { replace: true, state: undefined });
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar treino");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="flex max-h-[85vh] max-w-[calc(100vw-1rem)] flex-col gap-4 overflow-hidden rounded-2xl sm:max-w-3xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>Editar treino</DialogTitle>
          <DialogDescription>Atualize os dados do treino</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Form {...training.form}>
            <form
              onSubmit={training.form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {training.currentStep === 1 && <StepName form={training.form} />}

              {training.currentStep === 2 && (
                <StepPeriods
                  periods={training.periods}
                  onAddPeriod={training.addPeriod}
                  onRemovePeriod={(id) => {
                    training.removePeriod(id);
                    setTimeout(() => flushDraft(), 0);
                  }}
                  onUpdatePeriodName={(id, name) => {
                    training.updatePeriodName(id, name);
                    setTimeout(() => flushDraft(), 0);
                  }}
                  onReorderPeriods={(oldIndex, newIndex) => {
                    training.reorderPeriods(oldIndex, newIndex);
                    setTimeout(() => flushDraft(), 0);
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
                    setTimeout(() => flushDraft(), 0);
                  }}
                  onReorderExercises={(periodId, oldIndex, newIndex) => {
                    training.reorderExercises(periodId, oldIndex, newIndex);
                    setTimeout(() => flushDraft(), 0);
                  }}
                />
              )}

              {training.currentStep === 4 && (
                <StepReview form={training.form} periods={training.periods} />
              )}

              {/* FOOTER */}
              <div
                className={
                  training.currentStep === 1
                    ? "flex justify-end pt-4"
                    : "flex justify-between pt-4"
                }
              >
                {training.currentStep > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={training.prevStep}
                    className="cursor-pointer"
                  >
                    Voltar
                  </Button>
                )}

                {training.currentStep < 4 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={training.nextStep}
                    className="cursor-pointer"
                  >
                    Próximo
                  </Button>
                )}

                {training.currentStep === 4 && (
                  <SaveButton
                    size="sm"
                    type="submit"
                    loading={loading}
                    disabled={!training.form.formState.isValid}
                  />
                )}
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
