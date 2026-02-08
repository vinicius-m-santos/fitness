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
import StepName from "@/components/Training/Modals/TrainingCreateModal/Steps/StepName";
import StepPeriods from "@/components/Training/Modals/TrainingCreateModal/Steps/StepPeriods";
import StepExercises from "@/components/Training/Modals/TrainingCreateModal/Steps/StepExercises";
import StepReview from "@/components/Training/Modals/TrainingCreateModal/Steps/StepReview";
import { useTrainingForm } from "@/hooks/useTrainingForm";
import { useTrainingDraft } from "@/hooks/useTrainingDraft";
import { TrainingCreateSchema } from "@/schemas/training";
import { prepareTrainingPayload } from "@/utils/prepareTrainingPayload";
import { useWorkoutDraftStore, getDraftContextKey } from "@/stores/workoutDraftStore";
import type { TrainingDraft } from "@/types/trainingDraft";
import { NormalizeTrainingData } from "@/utils/NormalizeTrainingData";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDraft?: TrainingDraft | null;
};

export default function TrainingStandardCreateModal({ open, onOpenChange, initialDraft }: Props) {
  const api = useApi();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const restoredRef = useRef(false);
  const [restoreApplied, setRestoreApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const training = useTrainingForm();
  const formData = training.form.watch();
  const navigate = useNavigate();
  const draftEnabled = open;

  const { flushDraft } = useTrainingDraft({
    type: "training-standard-create",
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
    if (open && initialDraft && initialDraft.type === "training-standard-create" && !restoredRef.current) {
      restoredRef.current = true;
      setRestoreApplied(true);
      const normalized = NormalizeTrainingData(initialDraft.formData);
      training.resetForm(normalized, {
        step: initialDraft.step,
        selectedExerciseByPeriod: initialDraft.selectedExerciseByPeriod ?? {},
      });
    }
  }, [open, initialDraft]);

  const onSubmit = async (data: TrainingCreateSchema) => {
    setLoading(true);
    try {
      const payload = prepareTrainingPayload(data);
      await api.post("/training-standard/create", payload);
      toast.success("Treino padrão criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["training-standards"] });
      useWorkoutDraftStore.getState().clearDraft(getDraftContextKey("training-standard-create"));
      navigate(location.pathname, { replace: true, state: undefined });
      setLoading(false);
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar treino padrão");
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Criar treino padrão</DialogTitle>
          <DialogDescription>Modelo de treino para replicar para os alunos</DialogDescription>
        </DialogHeader>
        <Form {...training.form}>
          <form onSubmit={training.form.handleSubmit(onSubmit)} className="space-y-6 overflow-hidden">
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
            {training.currentStep === 4 && <StepReview periods={training.periods} form={training.form} />}
            <div className={training.currentStep === 1 ? "flex justify-end pt-4" : "flex justify-between pt-4"}>
              {training.currentStep > 1 && (
                <Button type="button" size="sm" variant="outline" onClick={training.prevStep} className="cursor-pointer">
                  Voltar
                </Button>
              )}
              {training.currentStep < 4 && (
                <Button type="button" size="sm" onClick={training.nextStep} className="cursor-pointer">
                  Próximo
                </Button>
              )}
              {training.currentStep === 4 && (
                <SaveButton size="sm" type="submit" loading={loading} disabled={loading} />
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
