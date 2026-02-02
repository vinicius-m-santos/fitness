import { useEffect, useState, useRef } from "react";
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
import { clearTrainingDraft, notifyTrainingDraftCleared } from "@/utils/trainingDraftStorage";
import type { TrainingDraft } from "@/types/trainingDraft";
import { NormalizeTrainingData } from "@/utils/NormalizeTrainingData";

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
  const [restoreApplied, setRestoreApplied] = useState(false);

  const [loading, setLoading] = useState(false);

  const training = useTrainingForm();
  const formData = training.form.watch();

  const draftEnabled = open && (!initialDraft || restoreApplied);

  const { flushDraft } = useTrainingDraft({
    type: "training-create",
    clientId: client,
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
    if (!open) {
      if (!initialDraft) training.resetForm();
      restoredRef.current = false;
      setRestoreApplied(false);
    }
  }, [open, initialDraft]);

  useEffect(() => {
    if (open && initialDraft && initialDraft.type === "training-create" && !restoredRef.current) {
      restoredRef.current = true;
      setRestoreApplied(true);
      const normalized = NormalizeTrainingData(initialDraft.formData);
      training.resetForm(normalized, {
        step: initialDraft.step,
        selectedExerciseByPeriod: initialDraft.selectedExerciseByPeriod ?? {},
      });
      // Não chamar clearTrainingDraft aqui: é assíncrono e pode completar depois do próximo save,
      // apagando o rascunho que o usuário acabou de salvar. O próximo save sobrescreve o draft.
    }
  }, [open, initialDraft]);

  const onSubmit = async (data: TrainingCreateSchema) => {
    try {
      setLoading(true);
      const payload: Record<string, unknown> = { ...data, client };
      if (data.dueDate) payload.dueDate = data.dueDate;
      await api.post("/training/create", payload);
      toast.success("Treino criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      await clearTrainingDraft();
      notifyTrainingDraftCleared();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar treino");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) onRestored?.();
      }}
    >
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Criar treino</DialogTitle>
          <DialogDescription>Criação guiada de treino</DialogDescription>
        </DialogHeader>

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
              />
            )}

            {training.currentStep === 4 && (
              <StepReview periods={training.periods} form={training.form} />
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
      </DialogContent>
    </Dialog>
  );
}
