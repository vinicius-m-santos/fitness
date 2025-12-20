import { TrainingCreateSchema } from "@/schemas/training";

export function NormalizeTrainingData(
  data: TrainingCreateSchema
): TrainingCreateSchema {
  return {
    ...data,
    periods: data.periods.map((period) => ({
      ...period,
      exercises: period.exercises.map((ex) => ({
        ...ex,
        instanceId:
          ex.instanceId ??
          `${period.id}-${ex.id}-${Math.random().toString(36).slice(2)}`,
      })),
    })),
  };
}
