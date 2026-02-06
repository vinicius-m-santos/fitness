"use client";

import * as React from "react";
import { useCallback, useMemo } from "react";
import { CheckIcon, Star, User } from "lucide-react";
import { AsyncPaginate } from "react-select-async-paginate";
import type { GroupBase } from "react-select";
import { useRequest } from "@/api/request";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 30;

export type ExerciseOption = {
  id: number;
  name: string;
  exerciseCategory?: string;
  muscleGroup?: string;
  isFavorite?: boolean;
  isOwn?: boolean;
};

export type ExerciseSelectOption = {
  value: number;
  label: string;
  id: number;
  name: string;
  exerciseCategory?: string;
  muscleGroup?: string;
  isFavorite?: boolean;
  isOwn?: boolean;
};

type Props = {
  selectedExercise: { id: number; name: string } | null;
  onSelect: (exercise: { id: number; name: string }) => void;
  isExerciseAdded: (exerciseId: number) => boolean;
  placeholder?: string;
  emptyMessage?: string;
  debounceMs?: number;
};

function buildOptionLabel(ex: {
  name: string;
  exerciseCategory?: string;
  muscleGroup?: string;
}): string {
  const hasMeta = ex.exerciseCategory || ex.muscleGroup;
  if (!hasMeta) return ex.name;
  const meta = [ex.exerciseCategory, ex.muscleGroup].filter(Boolean).join(" · ");
  return `${ex.name} — ${meta}`;
}

export function ExerciseSelectDropdown({
  selectedExercise,
  onSelect,
  isExerciseAdded,
  placeholder = "Escolher exercício",
  emptyMessage = "Nenhum exercício encontrado.",
  debounceMs = 350,
}: Props) {
  const request = useRequest();

  const loadOptions = useCallback(
    async (
      search: string,
      _loadedOptions: readonly unknown[],
      additional?: { page?: number } | null
    ) => {
      const page = additional?.page ?? 1;
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        favoritesOnly: "false",
        ownOnly: "false",
        order: "name-asc",
      });
      if (search.trim()) params.set("search", search.trim());

      try {
        const res = await request({
          method: "GET",
          url: `/exercise/all?${params.toString()}`,
        });
        const raw = (res.exercises ?? []) as Array<{
          id: number;
          name: string;
          exerciseCategory?: string;
          muscleGroup?: string;
          isFavorite?: boolean;
          isOwn?: boolean;
        }>;
        const totalPages = res.totalPages ?? 1;
        const options: ExerciseSelectOption[] = raw.map((e) => ({
          value: e.id,
          label: buildOptionLabel(e),
          id: e.id,
          name: e.name,
          exerciseCategory: e.exerciseCategory,
          muscleGroup: e.muscleGroup,
          isFavorite: Boolean(e.isFavorite),
          isOwn: Boolean(e.isOwn),
        }));
        return {
          options,
          hasMore: page < totalPages,
          additional: { page: page + 1 },
        };
      } catch {
        return { options: [], hasMore: false, additional: { page: 1 } };
      }
    },
    [request]
  );

  const value = useMemo(() => {
    if (!selectedExercise) return null;
    return {
      value: selectedExercise.id,
      label: selectedExercise.name,
      id: selectedExercise.id,
      name: selectedExercise.name,
    } as ExerciseSelectOption;
  }, [selectedExercise]);

  const handleChange = useCallback(
    (option: ExerciseSelectOption | null) => {
      if (option) onSelect({ id: option.id, name: option.name });
    },
    [onSelect]
  );

  const formatOptionLabel = useCallback(
    (option: ExerciseSelectOption) => {
      const added = isExerciseAdded(option.id);
      const isFavorite = Boolean(option.isFavorite);
      const isOwn = Boolean(option.isOwn);
      return (
        <span className="inline-flex items-center gap-1.5 min-w-0">
          {added && (
            <CheckIcon className="h-4 w-4 shrink-0 text-green-600" />
          )}
          {isFavorite && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />
          )}
          {isOwn && !isFavorite && (
            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          {isOwn && !isFavorite && (
            <span className="text-xs text-muted-foreground shrink-0">Meu</span>
          )}
          <span className="min-w-0 truncate">{option.label}</span>
        </span>
      );
    },
    [isExerciseAdded]
  );

  return (
    <AsyncPaginate<
      ExerciseSelectOption,
      GroupBase<ExerciseSelectOption>,
      { page: number }
    >
      loadOptions={loadOptions}
      value={value}
      onChange={handleChange}
      additional={{ page: 1 }}
      defaultOptions
      loadOptionsOnMenuOpen
      debounceTimeout={debounceMs}
      filterOption={() => true}
      formatOptionLabel={formatOptionLabel}
      getOptionValue={(opt) => String(opt.value)}
      placeholder={placeholder}
      noOptionsMessage={() => emptyMessage}
      loadingMessage={() => "Carregando exercícios..."}
      classNamePrefix="exercise-select"
      classNames={{
        control: () =>
          cn(
            "flex h-9 w-full min-w-0 items-center justify-between rounded-md border border-input",
            "bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background",
            "focus-within:ring-1 focus-within:ring-ring"
          ),
        placeholder: () => "text-muted-foreground",
        input: () => "text-foreground",
        valueContainer: () => "gap-1 flex-1 min-w-0",
        singleValue: () => "truncate",
        indicatorsContainer: () => "shrink-0",
        indicatorSeparator: () => "hidden",
        dropdownIndicator: () => "text-muted-foreground px-1",
        menu: () =>
          "z-50 rounded-md border bg-popover text-popover-foreground shadow-md mt-1",
        menuList: () => "max-h-[280px] py-1 overflow-auto",
        option: (state) =>
          cn(
            "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none",
            state.isFocused && "bg-accent text-accent-foreground",
            state.isSelected && "bg-accent/50"
          ),
        loadingIndicator: () => "text-muted-foreground",
      }}
      unstyled
    />
  );
}
