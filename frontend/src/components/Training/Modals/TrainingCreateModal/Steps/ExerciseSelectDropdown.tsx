"use client";

import * as React from "react";
import { Search, CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContentWithSearch,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ExerciseOption = {
  id: number;
  name: string;
  exerciseCategory?: string;
  muscleGroup?: string;
};

type Props = {
  triggerLabel: string;
  selectedExercise: { id: number; name: string } | null;
  onSelect: (exercise: { id: number; name: string }) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  exercises: ExerciseOption[];
  isLoading: boolean;
  isLoadingMore: boolean;
  onListScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  isExerciseAdded: (exerciseId: number) => boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

export function ExerciseSelectDropdown({
  triggerLabel,
  selectedExercise,
  onSelect,
  searchValue,
  onSearchChange,
  exercises,
  isLoading,
  isLoadingMore,
  onListScroll,
  isExerciseAdded,
  placeholder = "Escolher exercício",
  searchPlaceholder = "Buscar exercício...",
  emptyMessage = "Nenhum exercício encontrado.",
}: Props) {
  const value = selectedExercise?.id != null ? String(selectedExercise.id) : "";

  const handleValueChange = (val: string) => {
    const ex = exercises.find((e) => e.id === Number(val));
    if (ex) onSelect({ id: ex.id, name: ex.name });
  };

  // Garantir que o item selecionado esteja na lista para o trigger mostrar o nome (ex.: após busca)
  const listItems =
    selectedExercise &&
      !exercises.some((e) => e.id === selectedExercise.id)
      ? [
        { id: selectedExercise.id, name: selectedExercise.name },
        ...exercises,
      ]
      : exercises;

  const searchSlot = (
    <div className="flex items-center border-b px-2 py-2">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <Input
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );

  return (
    <Select value={value || undefined} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full min-w-0 overflow-hidden">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContentWithSearch
        searchSlot={searchSlot}
        onViewportScroll={onListScroll}
        viewportClassName="max-h-[50vh] sm:max-h-[240px]"
        className="max-w-[calc(100vw-1rem)] max-h-[70vh]"
      >
        {isLoading && exercises.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Carregando exercícios...
          </div>
        ) : exercises.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          listItems.map((ex) => {
            const added = isExerciseAdded(ex.id);
            const label =
              "exerciseCategory" in ex || "muscleGroup" in ex
                ? [
                  ex.name,
                  (ex.exerciseCategory ?? ex.muscleGroup) &&
                  ` — ${[ex.exerciseCategory, ex.muscleGroup].filter(Boolean).join(" · ")}`,
                ]
                  .filter(Boolean)
                  .join("")
                : ex.name;
            return (
              <SelectItem key={ex.id} value={String(ex.id)} hideIndicator>
                <span className="flex flex-wrap items-center gap-2">
                  {added && (
                    <CheckIcon className="h-4 w-4 shrink-0 text-green-600" />
                  )}
                  <span className="truncate">{label}</span>
                </span>
              </SelectItem>
            );
          })
        )}
        {isLoadingMore && (
          <div className="py-2 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        )}
      </SelectContentWithSearch>
    </Select>
  );
}
