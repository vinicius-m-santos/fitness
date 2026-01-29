import { useEffect, useMemo, useState } from "react";
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
import { TrainingCreateSchema } from "@/schemas/training";
import { NormalizeTrainingData } from "@/utils/NormalizeTrainingData";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingId: number;
  initialData: TrainingCreateSchema;
};

export default function TrainingStandardUpdateModal({
  open,
  onOpenChange,
  trainingId,
  initialData,
}: Props) {
  const api = useApi();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [loading, setLoading] = useState(false);
  const training = useTrainingForm({ defaultValues: initialData });
  const normalized = useMemo(() => NormalizeTrainingData(initialData), [initialData]);

  useEffect(() => {
    if (open) training.resetForm(normalized);
    setTimeout(() => training.form.trigger());
  }, [open, normalized]);

  const onSubmit = async (data: TrainingCreateSchema) => {
    try {
      setLoading(true);
      await api.put(`/training-standard/${trainingId}`, data);
      toast.success("Treino padrão atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["training-standards"] });
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar treino padrão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar treino padrão</DialogTitle>
          <DialogDescription>Atualize os dados do treino</DialogDescription>
        </DialogHeader>
        <Form {...training.form}>
          <form onSubmit={training.form.handleSubmit(onSubmit)} className="space-y-6">
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
                exercises={training.exercises}
                isMobile={isMobile}
                selectedExercises={training.selectedExercises}
                setSelectedExercises={training.setSelectedExercises}
                onAddExercise={training.addExercise}
                onUpdateExercise={training.updateExercise}
                onRemoveExercise={training.removeExercise}
              />
            )}
            {training.currentStep === 4 && <StepReview periods={training.periods} />}
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
                <SaveButton size="sm" type="submit" loading={loading} disabled={!training.form.formState.isValid} />
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
