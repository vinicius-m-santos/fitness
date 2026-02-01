import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WheelPicker, WheelPickerWrapper } from "@/components/wheel-picker";
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
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  const [accumulated, setAccumulated] = useState<{ id: number; name: string }[]>([]);
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

  const comboboxData = useMemo(
    () => accumulated.map((ex) => ({ label: ex.name, value: ex.name })),
    [accumulated]
  );

  return (
    <Accordion type="single" collapsible>
      {periods.map((period) => (
        <AccordionItem key={period.id} value={String(period.id)}>
          <AccordionTrigger>{period.name}</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex gap-2">
              <Combobox
                data={comboboxData}
                type="exercício"
                value={selectedExerciseByPeriod[period.id]?.name ?? ""}
                onValueChange={(val) => {
                  const ex = accumulated.find((e) => e.name === val);
                  if (ex) {
                    setSelectedExerciseByPeriod((prev) => ({
                      ...prev,
                      [period.id]: { id: ex.id, name: ex.name },
                    }));
                  }
                }}
              >
                <ComboboxTrigger className="w-52 min-w-0 overflow-hidden">
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-2 truncate">
                    <span className="truncate">
                      {selectedExerciseByPeriod[period.id]?.name ?? "Escolher exercício"}
                    </span>
                    <ChevronsUpDownIcon className="shrink-0 text-muted-foreground" size={16} />
                  </span>
                </ComboboxTrigger>
                <ComboboxContent
                  shouldFilter={false}
                  popoverOptions={{ className: "p-0" }}
                >
                  <ComboboxInput
                    placeholder="Buscar exercício..."
                    onValueChange={handleSearchInputChange}
                  />
                  <ComboboxList
                    onScroll={handleListScroll}
                    className="max-h-[240px] overflow-y-auto overflow-x-hidden"
                  >
                    {isLoading && accumulated.length === 0 ? (
                      <div className="py-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Carregando exercícios...
                      </div>
                    ) : (
                      <>
                        <ComboboxEmpty>Nenhum exercício encontrado.</ComboboxEmpty>
                        <ComboboxGroup>
                          {accumulated.map((ex) => {
                            const isExerciseAdded = period.exercises.some(
                              (periodEx) => periodEx.id === ex.id
                            );
                            return (
                              <ComboboxItem key={ex.id} value={ex.name}>
                                {isExerciseAdded && (
                                  <CheckIcon className="mr-2 h-4 w-4 shrink-0 text-green-600" />
                                )}
                                <span className="truncate">{ex.name}</span>
                              </ComboboxItem>
                            );
                          })}
                        </ComboboxGroup>
                      </>
                    )}
                    {isLoading && page > 1 && (
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        Carregando...
                      </div>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

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
                  className="flex flex-wrap items-center gap-2 border rounded-md p-2"
                >
                  <span className="w-full min-w-0 font-medium truncate sm:w-auto sm:min-w-[120px]">{ex.name}</span>

                  <div className="w-full flex items-center gap-2">
                    <div className="w-full justify-center">
                      <Label className="block text-center mb-2">Séries</Label>
                      <WheelPickerWrapper className="w-auto">
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
                    <div className="w-full justify-center">
                      <Label className="block text-center mb-2">Repetições</Label>
                      <WheelPickerWrapper className="w-auto">
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
                    <div className="w-full justify-center">
                      <Label className="block text-center mb-2">Descanso</Label>
                      <WheelPickerWrapper className="w-auto">
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
                  <div className="w-full">
                    <Label>Observações</Label>
                    <Input
                      placeholder={EXERCISES_LABELS.obs}
                      className="w-full text-sm font-medium min-w-[80px] flex-1"
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
                    className="text-red-500 font-bold px-2 cursor-pointer hover:opacity-75 shrink-0 w-full"
                    variant="destructive"
                  >
                    <TrashIcon className="h-4 w-4 text-white" />
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
