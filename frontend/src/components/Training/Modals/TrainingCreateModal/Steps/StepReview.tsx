import { TrainingCreateSchema } from "@/schemas/training";

type Props = {
  periods: TrainingCreateSchema["periods"];
};

export default function StepReview({ periods }: Props) {
  return (
    <div className="space-y-4 text-sm">
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
