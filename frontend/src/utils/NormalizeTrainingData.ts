import { TrainingCreateSchema } from "@/schemas/training";
import { getEffectiveDueDateISO } from "@/utils/dateUtils";

/** Converte null/undefined em string vazia para campos opcionais (schema zod). */
function str(value: string | null | undefined): string {
  return value != null ? String(value) : "";
}

export function NormalizeTrainingData(
  data: TrainingCreateSchema | Record<string, unknown>
): TrainingCreateSchema {
  const periods = Array.isArray((data as TrainingCreateSchema).periods)
    ? (data as TrainingCreateSchema).periods
    : [];
  return {
    name: typeof (data as TrainingCreateSchema).name === "string" ? (data as TrainingCreateSchema).name : "",
    dueDate: getEffectiveDueDateISO((data as TrainingCreateSchema).dueDate) ?? "",
    periods: periods.map((period) => ({
      id: period.id,
      name: period.name,
      exercises: (period.exercises ?? []).map((ex) => ({
        instanceId:
          ex.instanceId ??
          `${period.id}-${ex.id}-${Math.random().toString(36).slice(2)}`,
        id: ex.id,
        name: typeof ex.name === "string" ? ex.name : "",
        series: str(ex.series),
        reps: str(ex.reps),
        rest: str(ex.rest),
        obs: str(ex.obs),
      })),
    })),
  };
}
