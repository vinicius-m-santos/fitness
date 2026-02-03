import { Controller, UseFormReturn } from "react-hook-form";
import { TrainingCreateSchema } from "@/schemas/training";
import DueDateInput from "@/components/Inputs/DueDateInput";

type Props = {
  periods: TrainingCreateSchema["periods"];
  form: UseFormReturn<TrainingCreateSchema>;
};

export default function StepReview({ periods, form }: Props) {
  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-2">
        <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
          Data de vencimento (opcional)
        </label>
        <Controller
          name="dueDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <DueDateInput
                id="dueDate"
                value={field.value ?? ""}
                onChange={(v) => field.onChange(v ?? "")}
                onBlur={field.onBlur}
              />
              {fieldState.error?.message && (
                <p className="text-xs text-destructive mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Define quando o treino deve ser renovado para o aluno.
        </p>
      </div>
      {periods.map((p) => (
        <div key={p.id} className="border rounded-md p-3">
          <h3 className="font-semibold mb-2">{p.name}</h3>
          <ul className="space-y-1">
            {p.exercises.map((e) => (
              <li key={e.instanceId}>
                {e.name} — {e.series || "--"}x{e.reps || "--"} /{" "}
                {e.rest || "--"} {e.obs && `(${e.obs})`}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
