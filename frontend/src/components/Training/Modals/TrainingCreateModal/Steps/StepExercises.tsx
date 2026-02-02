import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WheelPicker, WheelPickerWrapper } from "@/components/wheel-picker";
import { TrashIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { ExerciseSelectDropdown } from "./ExerciseSelectDropdown";
import { EXERCISES_LABELS } from "@/utils/constants/Client/constants";
import { TrainingCreateSchema } from "@/schemas/training";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useExerciseSearch } from "@/hooks/useExerciseSearch";
import { Label } from "@/components/ui/label";

const DEBOUNCE_MS = 350;

const SERIES_OPTIONS = Array.from({ length: 30 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const REPS_OPTIONS = Array.from({ length: 100 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const REST_OPTIONS = Array.from({ length: 61 }, (_, i) => {
  const sec = i * 10;
  return { value: String(sec), label: `${sec}s` };
});

function getPickerValue(
  raw: string | undefined,
  options: { value: string }[],
  defaultVal: string,
  step = 1
): string {
  if (!raw?.trim()) return defaultVal;
  const num = parseInt(raw, 10);
  if (isNaN(num)) return defaultVal;
  const rounded = step > 1 ? Math.round(num / step) * step : num;
  const found = options.find((o) => o.value === String(rounded));
  if (found) return found.value;
  const first = parseInt(options[0].value, 10);
  const last = parseInt(options[options.length - 1].value, 10);
  const clamped = Math.max(first, Math.min(last, rounded));
  return String(clamped);
}

type Props = {
  periods: TrainingCreateSchema["periods"];
  isMobile: boolean;
  selectedExerciseByPeriod: Record<number, { id: number; name: string } | null>;
  setSelectedExerciseByPeriod: React.Dispatch<
    React.SetStateAction<Record<number, { id: number; name: string } | null>>
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
  isMobile,
  selectedExerciseByPeriod,
  setSelectedExerciseByPeriod,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
}: Props) {
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<
    { id: number; name: string; exerciseCategory?: string; muscleGroup?: string }[]
  >([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInputChange = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch(value);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
  }, []);

  const prevDebouncedSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevDebouncedSearchRef.current !== debouncedSearch) {
      prevDebouncedSearchRef.current = debouncedSearch;
      setAccumulated([]);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const { exercises: pageExercises, totalPages, isLoading } = useExerciseSearch(
    debouncedSearch,
    page,
    true
  );

  useEffect(() => {
    if (!Array.isArray(pageExercises) || isLoading) return;
    if (page === 1) {
      setAccumulated(pageExercises);
    } else {
      setAccumulated((prev) => {
        const ids = new Set(prev.map((e) => e.id));
        const newOnes = pageExercises.filter((e) => !ids.has(e.id));
        return newOnes.length ? [...prev, ...newOnes] : prev;
      });
    }
  }, [page, pageExercises, isLoading]);

  const handleListScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (isLoading || page >= totalPages) return;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
        setPage((p) => p + 1);
      }
    },
    [isLoading, page, totalPages]
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
              <ExerciseSelectDropdown
                triggerLabel={selectedExerciseByPeriod[period.id]?.name ?? ""}
                selectedExercise={selectedExerciseByPeriod[period.id] ?? null}
                onSelect={(ex) =>
                  setSelectedExerciseByPeriod((prev) => ({
                    ...prev,
                    [period.id]: { id: ex.id, name: ex.name },
                  }))
                }
                searchValue={search}
                onSearchChange={handleSearchInputChange}
                exercises={accumulated}
                isLoading={isLoading}
                isLoadingMore={isLoading && page > 1}
                onListScroll={handleListScroll}
                isExerciseAdded={(exId) =>
                  period.exercises.some((periodEx) => periodEx.id === exId)
                }
                placeholder="Escolher exercício"
                searchPlaceholder="Buscar exercício..."
                emptyMessage="Nenhum exercício encontrado."
              />

              <Button
                type="button"
                size="sm"
                onClick={() => onAddExercise(period.id)}
                className="cursor-pointer shrink-0"
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
                      <span className="font-medium truncate">{ex.name}</span>
                      {isExpanded ? (
                        <ChevronUpIcon className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 shrink-0" />
                      )}
                    </div>

                    {isExpanded && (
                      <div className="space-y-2 pt-2 w-full">
                        <div className="flex gap-3">
                          <div className="flex flex-col gap-1 w-full">
                            <span className="text-xs text-muted-foreground block text-center">
                              {EXERCISES_LABELS.series}
                            </span>
                            <WheelPickerWrapper className="w-full">
                              <WheelPicker
                                value={getPickerValue(ex.series, SERIES_OPTIONS, "1")}
                                onValueChange={(v) =>
                                  onUpdateExercise(period.id, ex.instanceId, "series", v as string)
                                }
                                options={SERIES_OPTIONS}
                                optionItemHeight={32}
                              />
                            </WheelPickerWrapper>
                          </div>
                          <div className="flex flex-col gap-1 w-full">
                            <span className="text-xs text-muted-foreground block text-center">
                              {EXERCISES_LABELS.reps}
                            </span>
                            <WheelPickerWrapper className="w-full">
                              <WheelPicker
                                value={getPickerValue(ex.reps, REPS_OPTIONS, "1")}
                                onValueChange={(v) =>
                                  onUpdateExercise(period.id, ex.instanceId, "reps", v as string)
                                }
                                options={REPS_OPTIONS}
                                optionItemHeight={32}
                              />
                            </WheelPickerWrapper>
                          </div>
                          <div className="flex flex-col gap-1 w-full">
                            <span className="text-xs text-muted-foreground block text-center">
                              {EXERCISES_LABELS.rest}
                            </span>
                            <WheelPickerWrapper className="w-full">
                              <WheelPicker
                                value={getPickerValue(ex.rest, REST_OPTIONS, "0", 10)}
                                onValueChange={(v) =>
                                  onUpdateExercise(period.id, ex.instanceId, "rest", v as string)
                                }
                                options={REST_OPTIONS}
                                optionItemHeight={32}
                              />
                            </WheelPickerWrapper>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">
                            {EXERCISES_LABELS.obs}
                          </span>
                          <Input
                            placeholder={EXERCISES_LABELS.obs}
                            className="text-sm font-medium"
                            value={ex.obs ?? ""}
                            onChange={(e) =>
                              onUpdateExercise(
                                period.id,
                                ex.instanceId,
                                "obs",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={() =>
                            onRemoveExercise(period.id, ex.instanceId)
                          }
                          className="w-full text-red-500 font-bold cursor-pointer"
                          variant="destructive"
                        >
                          <TrashIcon className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              }

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
                    <span className="font-medium truncate sm:min-w-[120px]">{ex.name}</span>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 shrink-0" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="flex flex-wrap items-end gap-3 pt-2">
                      <div className="flex flex-col gap-1 shrink-0">
                        <Label className="text-xs whitespace-nowrap text-muted-foreground">Séries</Label>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          className="w-14 h-8 text-center text-sm tabular-nums"
                          value={ex.series ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "" || /^\d+$/.test(v)) {
                              onUpdateExercise(period.id, ex.instanceId, "series", v || "1");
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Label className="text-xs whitespace-nowrap text-muted-foreground">Reps</Label>
                        <Input
                          type="number"
                          min={1}
                          className="w-14 h-8 text-center text-sm tabular-nums"
                          value={ex.reps ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "" || /^\d+$/.test(v)) {
                              onUpdateExercise(period.id, ex.instanceId, "reps", v || "1");
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Label className="text-xs whitespace-nowrap text-muted-foreground">Descanso</Label>
                        <Input
                          type="number"
                          min={0}
                          className="w-14 h-8 text-center text-sm tabular-nums"
                          placeholder="0"
                          value={ex.rest ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "" || /^\d+$/.test(v)) {
                              onUpdateExercise(period.id, ex.instanceId, "rest", v || "0");
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <Label className="text-xs whitespace-nowrap text-muted-foreground">Obs.</Label>
                        <Input
                          placeholder={EXERCISES_LABELS.obs}
                          className="h-8 text-sm font-medium min-w-[80px] flex-1"
                          value={ex.obs ?? ""}
                          onChange={(e) =>
                            onUpdateExercise(
                              period.id,
                              ex.instanceId,
                              "obs",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => onRemoveExercise(period.id, ex.instanceId)}
                        className="text-red-500 font-bold h-8 px-2 cursor-pointer hover:opacity-75 shrink-0"
                        variant="destructive"
                      >
                        <TrashIcon className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
