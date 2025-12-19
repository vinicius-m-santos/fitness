import { TrainingCreateSchema } from "@/schemas/training";

export default function mapWorkoutToForm(workout: any): TrainingCreateSchema {
  return {
    name: workout.name ?? "",
    periods: (workout.periods ?? []).map((p: any) => ({
      id: p.id ?? Date.now() + Math.random(),
      name: p.name,
      exercises: (p.exercises ?? []).map((e: any) => ({
        instanceId: Date.now() + Math.random(),
        id: e.id,
        name: e.name,
        series: e.series?.toString() ?? "",
        reps: e.reps?.toString() ?? "",
        rest: e.rest ?? "",
        obs: e.notes ?? "",
      })),
    })),
  };
}
