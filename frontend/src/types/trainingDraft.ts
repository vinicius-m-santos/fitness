import type { TrainingCreateSchema } from "@/schemas/training";

export type TrainingDraftType =
  | "training-create"
  | "training-update"
  | "training-standard-create"
  | "training-standard-update";

export type TrainingDraft = {
  type: TrainingDraftType;
  step: number;
  formData: TrainingCreateSchema;
  selectedExerciseByPeriod: Record<number, { id: number; name: string } | null>;
  /** clientId para training-create e training-update (navegação para /client-view/:clientId) */
  clientId?: number;
  /** trainingId para training-update e training-standard-update */
  trainingId?: number;
  /** Timestamp para exibir "há X min" ou descartar rascunhos muito antigos */
  updatedAt: number;
};
