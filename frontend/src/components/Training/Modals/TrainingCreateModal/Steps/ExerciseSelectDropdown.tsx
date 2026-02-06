"use client";

import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import { Search, CheckIcon, Star, User } from "lucide-react";
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
  isFavorite?: boolean;
  isOwn?: boolean;
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasInitialFocusedRef = useRef(false);
  const value = selectedExercise?.id != null ? String(selectedExercise.id) : "";

  useLayoutEffect(() => {
    const input = searchInputRef.current;
    if (!input || hasInitialFocusedRef.current) return;
    if (document.activeElement === input) {
      hasInitialFocusedRef.current = true;
      return;
    }
    if (!isLoading && exercises.length > 0) {
      hasInitialFocusedRef.current = true;
      const id = setTimeout(() => {
        if (document.contains(input) && document.activeElement !== input) {
          input.focus({ preventScroll: true });
        }
      }, 0);
      return () => clearTimeout(id);
    }
  }, [exercises, isLoading]);

  const handleValueChange = (val: string) => {
    const ex = exercises.find((e) => e.id === Number(val));
    if (ex) onSelect({ id: ex.id, name: ex.name });
  };

  const sortPriority = (ex: ExerciseOption): number => {
    if (Boolean(ex.isFavorite)) return 0;
    if (Boolean(ex.isOwn)) return 1;
    return 2;
  };
  const sortedExercises = [...exercises].sort((a, b) => {
    const pa = sortPriority(a);
    const pb = sortPriority(b);
    if (pa !== pb) return pa - pb;
    return (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" });
  });

  const listItems =
    selectedExercise &&
      !sortedExercises.some((e) => e.id === selectedExercise.id)
      ? [
        { id: selectedExercise.id, name: selectedExercise.name, isFavorite: false, isOwn: false },
        ...sortedExercises,
      ]
      : sortedExercises;

  const stopSelectInteraction = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const stopPropagationOnly = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  const onSearchAreaPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if ((e.target as Node).nodeName !== "INPUT") {
      e.preventDefault();
    }
  };

  const searchSlot = (
    <div
      className="flex items-center border-b px-2 py-2"
      onPointerDownCapture={onSearchAreaPointerDown}
      onTouchStartCapture={stopPropagationOnly}
      onTouchEndCapture={stopSelectInteraction}
      onClickCapture={stopSelectInteraction}
    >
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <Input
        ref={searchInputRef}
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onPointerDownCapture={stopPropagationOnly}
        onTouchStartCapture={stopPropagationOnly}
        onTouchEndCapture={stopSelectInteraction}
        onClickCapture={stopSelectInteraction}
        onKeyDown={(e) => e.stopPropagation()}
        className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );

  return (
    <Select value={value || undefined} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full min-w-0 overflow-hidden [&>span]:truncate [&>span]:block [&>span]:text-left">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContentWithSearch
        searchSlot={searchSlot}
        onViewportScroll={onListScroll}
        viewportClassName="max-h-[280px]"
        className="max-w-[calc(100vw-1rem)] max-h-[min(70vh,360px)]"
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
            const isFavorite = "isFavorite" in ex && ex.isFavorite;
            const isOwn = "isOwn" in ex && ex.isOwn;
            return (
              <SelectItem key={ex.id} value={String(ex.id)} hideIndicator>
                <span className="inline-block gap-1.5 min-w-0">
                  {added && (
                    <CheckIcon className="h-4 w-4 shrink-0 text-green-600 inline" />
                  )}
                  {isFavorite && (
                    <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500 inline mx-1" />
                  )}
                  {isOwn && !isFavorite && (
                    <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground inline mx-1" />
                  )}
                  {isOwn && !isFavorite && (
                    <span className="align-middle w-auto inline-block text-xs text-muted-foreground shrink-0 mx-1">Meu</span>
                  )}
                  <span className="h-full align-middle min-w-0 whitespace-normal break-words mx-1">{label}</span>
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
