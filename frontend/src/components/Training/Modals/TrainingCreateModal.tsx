import { useEffect, useState } from "react";
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
import { TrainingCreateSchema } from "@/schemas/training";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: number;
};

export default function TrainingCreateModal({
  open,
  onOpenChange,
  client,
}: Props) {
  const api = useApi();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [loading, setLoading] = useState(false);

  const training = useTrainingForm();

  useEffect(() => {
    if (!open) {
      training.resetForm();
    }
  }, [open]);

  const onSubmit = async (data: TrainingCreateSchema) => {
    try {
      setLoading(true);
      const payload: Record<string, unknown> = { ...data, client };
      if (data.dueDate) payload.dueDate = data.dueDate;
      await api.post("/training/create", payload);
      toast.success("Treino criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar treino");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
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
                onRemovePeriod={training.removePeriod}
                onUpdatePeriodName={training.updatePeriodName}
                isMobile={isMobile}
              />
            )}

            {training.currentStep === 3 && (
              <StepExercises
                periods={training.periods}
                isMobile={isMobile}
                selectedExerciseByPeriod={training.selectedExerciseByPeriod}
                setSelectedExerciseByPeriod={training.setSelectedExerciseByPeriod}
                onAddExercise={training.addExercise}
                onUpdateExercise={training.updateExercise}
                onRemoveExercise={training.removeExercise}
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
