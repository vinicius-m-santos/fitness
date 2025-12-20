import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrashIcon } from "lucide-react";
import { EXERCISES_LABELS } from "@/utils/constants/Client/constants";
import { TrainingCreateSchema } from "@/schemas/training";

type Props = {
  periods: TrainingCreateSchema["periods"];
  exercises: any[];
  isMobile: boolean;
  selectedExercises: Record<number, string>;
  setSelectedExercises: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  onAddExercise: (periodId: number) => void;
  onUpdateExercise: (
    periodId: number,
    instanceId: number,
    field: string,
    value: string
  ) => void;
  onRemoveExercise: (periodId: number, instanceId: number) => void;
};

export default function StepExercises({
  periods,
  exercises,
  isMobile,
  selectedExercises,
  setSelectedExercises,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
}: Props) {
  return (
    <Accordion type="single" collapsible>
      {periods.map((period) => (
        <AccordionItem key={period.id} value={String(period.id)}>
          <AccordionTrigger>{period.name}</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex gap-2">
              <Select
                value={selectedExercises[period.id] || ""}
                onValueChange={(val) =>
                  setSelectedExercises((prev) => ({
                    ...prev,
                    [period.id]: val,
                  }))
                }
              >
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Escolher exercício" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((ex) => (
                    <SelectItem key={ex.id} value={String(ex.id)}>
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                size="sm"
                onClick={() => onAddExercise(period.id)}
                className="cursor-pointer"
              >
                Adicionar
              </Button>
            </div>

            {period.exercises.map((ex) => (
              <div
                key={ex.instanceId}
                className={
                  isMobile
                    ? "flex flex-wrap gap-2 border rounded-md p-2"
                    : "flex items-center gap-2 border rounded-md p-2"
                }
              >
                <span className="w-40 font-medium">{ex.name}</span>

                {["series", "reps", "rest", "obs"].map((field) => (
                  <Input
                    key={field}
                    placeholder={EXERCISES_LABELS[field]}
                    className="text-sm font-medium"
                    value={ex[field] ?? ""}
                    onChange={(e) =>
                      onUpdateExercise(
                        period.id,
                        ex.instanceId,
                        field,
                        e.target.value
                      )
                    }
                  />
                ))}

                <Button
                  onClick={() => onRemoveExercise(period.id, ex.instanceId)}
                  className={
                    isMobile
                      ? "text-red-500 font-bold px-2 cursor-pointer w-full"
                      : "text-red-500 font-bold px-2 cursor-pointer hover:opacity-75"
                  }
                  variant="destructive"
                >
                  <TrashIcon className="w-4 h-4 text-white" />
                </Button>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
