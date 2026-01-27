import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { TrashIcon, ChevronUpIcon, ChevronDownIcon, CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { EXERCISES_LABELS } from "@/utils/constants/Client/constants";
import { TrainingCreateSchema } from "@/schemas/training";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ExerciseField = "series" | "reps" | "rest" | "obs";

type Props = {
  periods: TrainingCreateSchema["periods"];
  exercises: Array<{ id: number; name: string }>;
  isMobile: boolean;
  selectedExercises: Record<number, string>;
  setSelectedExercises: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  onAddExercise: (periodId: number) => void;
  onUpdateExercise: (
    periodId: number,
    instanceId: string | undefined,
    field: string,
    value: string
  ) => void;
  onRemoveExercise: (periodId: number, instanceId: string | undefined) => void;
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
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    null
  );

  const getExerciseId = (periodId: number, instanceId: string) =>
    `${periodId}-${instanceId}`;

  return (
    <Accordion type="single" collapsible>
      {periods.map((period) => (
        <AccordionItem key={period.id} value={String(period.id)}>
          <AccordionTrigger>{period.name}</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex gap-2">
              <Combobox
                data={exercises.map((ex) => ({
                  label: ex.name,
                  value: String(ex.id),
                }))}
                type="exercício"
                value={
                  selectedExercises[period.id]
                    ? exercises.find(
                        (ex) => String(ex.id) === selectedExercises[period.id]
                      )?.name || ""
                    : ""
                }
                onValueChange={(val) => {
                  const exercise = exercises.find((ex) => ex.name === val);
                  if (exercise) {
                    setSelectedExercises((prev) => ({
                      ...prev,
                      [period.id]: String(exercise.id),
                    }));
                  }
                }}
              >
                <ComboboxTrigger className="w-52">
                  <span className="flex w-full items-center justify-between gap-2">
                    {selectedExercises[period.id]
                      ? exercises.find(
                          (ex) => String(ex.id) === selectedExercises[period.id]
                        )?.name
                      : "Escolher exercício"}
                    <ChevronsUpDownIcon className="shrink-0 text-muted-foreground" size={16} />
                  </span>
                </ComboboxTrigger>
                <ComboboxContent>
                  <ComboboxInput placeholder="Buscar exercício..." />
                  <ComboboxList>
                    <ComboboxEmpty>Nenhum exercício encontrado.</ComboboxEmpty>
                    <ComboboxGroup>
                      {exercises.map((ex) => {
                        const isExerciseAdded = period.exercises.some(
                          (periodEx) => periodEx.id === ex.id
                        );
                        return (
                          <ComboboxItem key={ex.id} value={ex.name}>
                            {isExerciseAdded && (
                              <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
                            )}
                            {ex.name}
                          </ComboboxItem>
                        );
                      })}
                    </ComboboxGroup>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <Button
                type="button"
                size="sm"
                onClick={() => onAddExercise(period.id)}
                className="cursor-pointer"
              >
                Adicionar
              </Button>
            </div>

            {period.exercises.map((ex) => {
              const exerciseId = getExerciseId(
                period.id,
                ex.instanceId || ""
              );
              const isExpanded = expandedExerciseId === exerciseId;

              if (isMobile) {
                return (
                  <div
                    key={ex.instanceId}
                    className="border rounded-md p-2 space-y-2"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between cursor-pointer"
                      )}
                      onClick={() =>
                        setExpandedExerciseId(isExpanded ? null : exerciseId)
                      }
                    >
                      <span className="font-medium">{ex.name}</span>
                      {isExpanded ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                    </div>

                    {isExpanded && (
                      <div className="space-y-2 pt-2">
                        {(["series", "reps", "rest", "obs"] as ExerciseField[]).map(
                          (field, index) => (
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
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const inputs = e.currentTarget
                                    .closest("div")
                                    ?.querySelectorAll("input");
                                  if (inputs && index < inputs.length - 1) {
                                    (
                                      inputs[index + 1] as HTMLInputElement
                                    )?.focus();
                                  }
                                }
                              }}
                            />
                          )
                        )}

                        <Button
                          type="button"
                          onClick={() =>
                            onRemoveExercise(period.id, ex.instanceId)
                          }
                          className="w-full text-red-500 font-bold cursor-pointer"
                          variant="destructive"
                        >
                          <TrashIcon className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={ex.instanceId}
                  className="flex items-center gap-2 border rounded-md p-2"
                >
                  <span className="w-40 font-medium">{ex.name}</span>

                  {(["series", "reps", "rest", "obs"] as ExerciseField[]).map(
                    (field, index) => (
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const inputs = e.currentTarget
                              .closest("div")
                              ?.querySelectorAll("input");
                            if (inputs && index < inputs.length - 1) {
                              (inputs[index + 1] as HTMLInputElement)?.focus();
                            }
                          }
                        }}
                      />
                    )
                  )}

                  <Button
                    type="button"
                    onClick={() => onRemoveExercise(period.id, ex.instanceId)}
                    className="text-red-500 font-bold px-2 cursor-pointer hover:opacity-75"
                    variant="destructive"
                  >
                    <TrashIcon className="w-4 h-4 text-white" />
                  </Button>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
