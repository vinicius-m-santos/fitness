import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WheelPicker, WheelPickerWrapper } from "@/components/wheel-picker";
import { TrashIcon, ChevronUpIcon, ChevronDownIcon, GripVertical } from "lucide-react";
import { ExerciseSelectDropdown } from "./ExerciseSelectDropdown";
import { EXERCISES_LABELS } from "@/utils/constants/Client/constants";
import { TrainingCreateSchema } from "@/schemas/training";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useExerciseSearch, type ExerciseSearchItem } from "@/hooks/useExerciseSearch";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DEBOUNCE_MS_DESKTOP = 350;
const DEBOUNCE_MS_MOBILE = 700;

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
  onReorderExercises: (periodId: number, oldIndex: number, newIndex: number) => void;
};

export default function StepExercises({
  periods,
  isMobile,
  selectedExerciseByPeriod,
  setSelectedExerciseByPeriod,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
  onReorderExercises,
}: Props) {
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [addCount, setAddCount] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<ExerciseSearchItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounceMs = isMobile ? DEBOUNCE_MS_MOBILE : DEBOUNCE_MS_DESKTOP;

  const handleSearchInputChange = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSearch(value);
      debounceRef.current = setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
        debounceRef.current = null;
      }, debounceMs);
    },
    [debounceMs]
  );

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <Accordion type="single" collapsible>
      {periods.map((period) => (
        <AccordionItem key={period.id} value={String(period.id)} className="max-w-[99%]">
          <AccordionTrigger>{period.name}</AccordionTrigger>
          <AccordionContent className="flex flex-col justify-center space-y-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-stretch">
              <div className="min-w-0 flex-1">
                <ExerciseSelectDropdown
                  key={`exercise-select-${period.id}-${addCount}`}
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
              </div>

              <Button
                type="button"
                size="sm"
                className="cursor-pointer shrink-0 w-full sm:w-auto"
                onClick={() => {
                  onAddExercise(period.id);
                  setSelectedExerciseByPeriod((prev) => ({
                    ...prev,
                    [period.id]: null,
                  }));
                  if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                    debounceRef.current = null;
                  }
                  setSearch("");
                  setAddCount((c) => c + 1);
                }}
              >
                Adicionar
              </Button>
            </div>

            <PeriodExerciseList
              period={period}
              getExerciseId={getExerciseId}
              expandedExerciseId={expandedExerciseId}
              setExpandedExerciseId={setExpandedExerciseId}
              isMobile={isMobile}
              onUpdateExercise={onUpdateExercise}
              onRemoveExercise={onRemoveExercise}
              onReorderExercises={onReorderExercises}
              sensors={sensors}
              getPickerValue={getPickerValue}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

type PeriodExerciseListProps = {
  period: TrainingCreateSchema["periods"][number];
  getExerciseId: (periodId: number, instanceId: string) => string;
  expandedExerciseId: string | null;
  setExpandedExerciseId: (id: string | null) => void;
  isMobile: boolean;
  onUpdateExercise: (
    periodId: number,
    instanceId: string | undefined,
    field: string,
    value: string
  ) => void;
  onRemoveExercise: (periodId: number, instanceId: string | undefined) => void;
  onReorderExercises: (periodId: number, oldIndex: number, newIndex: number) => void;
  sensors: ReturnType<typeof useSensors>;
  getPickerValue: (
    raw: string | undefined,
    options: { value: string }[],
    defaultVal: string,
    step?: number
  ) => string;
};

function PeriodExerciseList({
  period,
  getExerciseId,
  expandedExerciseId,
  setExpandedExerciseId,
  isMobile,
  onUpdateExercise,
  onRemoveExercise,
  onReorderExercises,
  sensors,
  getPickerValue,
}: PeriodExerciseListProps) {
  const exerciseSortIds = useMemo(
    () => period.exercises.map((ex) => `${period.id}-${ex.instanceId ?? ex.id}`),
    [period.id, period.exercises]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over == null || active.id === over.id) return;
      const activeStr = String(active.id);
      const overStr = String(over.id);
      if (!activeStr.startsWith(`${period.id}-`) || !overStr.startsWith(`${period.id}-`)) return;
      const oldIndex = period.exercises.findIndex(
        (ex) => `${period.id}-${ex.instanceId ?? ex.id}` === activeStr
      );
      const newIndex = period.exercises.findIndex(
        (ex) => `${period.id}-${ex.instanceId ?? ex.id}` === overStr
      );
      if (oldIndex === -1 || newIndex === -1) return;
      onReorderExercises(period.id, oldIndex, newIndex);
    },
    [period.id, period.exercises, onReorderExercises]
  );

  if (period.exercises.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={exerciseSortIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {period.exercises.map((ex) => (
            <SortableExerciseRow
              key={ex.instanceId}
              periodId={period.id}
              ex={ex}
              getExerciseId={getExerciseId}
              exerciseId={getExerciseId(period.id, ex.instanceId ?? "")}
              isExpanded={expandedExerciseId === getExerciseId(period.id, ex.instanceId ?? "")}
              setExpandedExerciseId={setExpandedExerciseId}
              isMobile={isMobile}
              onUpdateExercise={onUpdateExercise}
              onRemoveExercise={onRemoveExercise}
              getPickerValue={getPickerValue}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

type SortableExerciseRowProps = {
  periodId: number;
  ex: TrainingCreateSchema["periods"][number]["exercises"][number];
  getExerciseId: (periodId: number, instanceId: string) => string;
  exerciseId: string;
  isExpanded: boolean;
  setExpandedExerciseId: (id: string | null) => void;
  isMobile: boolean;
  onUpdateExercise: (
    periodId: number,
    instanceId: string | undefined,
    field: string,
    value: string
  ) => void;
  onRemoveExercise: (periodId: number, instanceId: string | undefined) => void;
  getPickerValue: (
    raw: string | undefined,
    options: { value: string }[],
    defaultVal: string,
    step?: number
  ) => string;
};

function SortableExerciseRow({
  periodId,
  ex,
  getExerciseId,
  exerciseId,
  isExpanded,
  setExpandedExerciseId,
  isMobile,
  onUpdateExercise,
  onRemoveExercise,
  getPickerValue,
}: SortableExerciseRowProps) {
  const sortId = `${periodId}-${ex.instanceId ?? ex.id}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const header = (
    <div
      className={cn(
        "flex items-center gap-2 border rounded-md p-2 space-y-2",
        isDragging && "opacity-50 z-10"
      )}
      ref={setNodeRef}
      style={style}
    >
      <div
        className="touch-none cursor-grab active:cursor-grabbing shrink-0 text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div
        className={cn(
          "flex flex-1 items-center justify-between cursor-pointer min-w-0"
        )}
        onClick={() => setExpandedExerciseId(isExpanded ? null : exerciseId)}
      >
        <span className={cn("truncate", !isMobile && "sm:min-w-[120px]")}>{ex.name}</span>
        {isExpanded ? (
          <ChevronUpIcon className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 shrink-0" />
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-2">
        {header}
        {isExpanded && (
          <div className="space-y-2 pt-2 w-full pl-6">
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 w-full">
                <span className="text-xs text-muted-foreground block text-center">
                  {EXERCISES_LABELS.series}
                </span>
                <WheelPickerWrapper className="w-full">
                  <WheelPicker
                    value={getPickerValue(ex.series, SERIES_OPTIONS, "1")}
                    onValueChange={(v) =>
                      onUpdateExercise(periodId, ex.instanceId, "series", v as string)
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
                      onUpdateExercise(periodId, ex.instanceId, "reps", v as string)
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
                      onUpdateExercise(periodId, ex.instanceId, "rest", v as string)
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
                  onUpdateExercise(periodId, ex.instanceId, "obs", e.target.value)
                }
              />
            </div>
            <Button
              type="button"
              onClick={() => onRemoveExercise(periodId, ex.instanceId)}
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
    <div className="space-y-2">
      {header}
      {isExpanded && (
        <div className="flex flex-wrap items-end gap-3 pt-2 pl-6">
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
                  onUpdateExercise(periodId, ex.instanceId, "series", v || "1");
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
                  onUpdateExercise(periodId, ex.instanceId, "reps", v || "1");
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
                  onUpdateExercise(periodId, ex.instanceId, "rest", v || "0");
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <Label className="text-xs whitespace-nowrap text-muted-foreground">Obs.</Label>
            <Input
              placeholder={EXERCISES_LABELS.obs}
              className="h-8 text-sm min-w-[80px] flex-1 h-[revert-layer]"
              value={ex.obs ?? ""}
              onChange={(e) =>
                onUpdateExercise(periodId, ex.instanceId, "obs", e.target.value)
              }
            />
          </div>
          <Button
            type="button"
            onClick={() => onRemoveExercise(periodId, ex.instanceId)}
            className="text-red-500 font-bold h-8 px-2 cursor-pointer hover:opacity-75 shrink-0"
            variant="destructive"
          >
            <TrashIcon className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
}
