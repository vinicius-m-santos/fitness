import type { TrainingCreateSchema } from "@/schemas/training";

/** Garante payload sem undefined/null para a API e evita quebra no submit. */
function str(value: string | null | undefined): string {
  return value != null ? String(value) : "";
}

/**
 * Prepara os dados do formulário para envio à API de treino padrão.
 * Garante que campos opcionais sejam strings e que a estrutura esteja correta.
 */
export function prepareTrainingPayload(data: TrainingCreateSchema): Record<string, unknown> {
  const periods = Array.isArray(data.periods) ? data.periods : [];
  return {
    name: typeof data.name === "string" ? data.name : "",
    dueDate: data.dueDate ?? "",
    periods: periods.map((period) => ({
      id: period.id,
      name: typeof period.name === "string" ? period.name : "",
      exercises: (period.exercises ?? []).map((ex) => ({
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
