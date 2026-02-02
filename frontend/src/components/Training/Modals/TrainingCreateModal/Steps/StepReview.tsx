import { UseFormReturn } from "react-hook-form";
import { TrainingCreateSchema } from "@/schemas/training";

type Props = {
  periods: TrainingCreateSchema["periods"];
  form: UseFormReturn<TrainingCreateSchema>;
};

function getTodayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function StepReview({ periods, form }: Props) {
  const minDate = getTodayYMD();
  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-2">
        <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
          Data de vencimento (opcional)
        </label>
        <input
          id="dueDate"
          type="date"
          min={minDate}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...form.register("dueDate")}
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
