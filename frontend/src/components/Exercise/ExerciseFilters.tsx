import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Star, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRequest } from "@/api/request";
import { useQuery } from "@tanstack/react-query";

const DEBOUNCE_DELAY = 800; // ms

interface ExerciseCategory {
  id: number;
  name: string;
}

interface MuscleGroup {
  id: number;
  name: string;
}

interface ExerciseFiltersProps {
  search?: string;
  order?: string;
  categoryId?: string;
  muscleGroupId?: string;
  onFilterChange: (filters: {
    search?: string;
    order?: string;
    favoritesOnly?: boolean;
    ownOnly?: boolean;
    categoryId?: string;
    muscleGroupId?: string;
  }) => void;
  favoritesOnly?: boolean;
  ownOnly?: boolean;
  loading?: boolean;
}

const ExerciseFilters = ({
  search = "",
  order = "newest",
  categoryId = "",
  muscleGroupId = "",
  onFilterChange,
  favoritesOnly = false,
  ownOnly = false,
  loading = false,
}: ExerciseFiltersProps) => {
  const request = useRequest();
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ["exerciseCategories"],
    queryFn: async () => {
      const res = await request({ method: "get", url: "/exercise-category/all" });
      return res as { exerciseCategories: ExerciseCategory[] };
    },
  });

  const { data: muscleGroupsData } = useQuery({
    queryKey: ["muscleGroups"],
    queryFn: async () => {
      const res = await request({ method: "get", url: "/muscle-group/all" });
      return res as { muscleGroups: MuscleGroup[] };
    },
  });

  const categories = categoriesData?.exerciseCategories ?? [];
  const muscleGroups = muscleGroupsData?.muscleGroups ?? [];

  // Sync local search with prop when it changes externally
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search changes and keep focus on search input after trigger
  useEffect(() => {
    if (localSearch === search) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onFilterChange({ search: localSearch, order, favoritesOnly, ownOnly, categoryId, muscleGroupId });
      searchInputRef.current?.focus();
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localSearch, search, order, favoritesOnly, ownOnly, categoryId, muscleGroupId, onFilterChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleOrderChange = (value: string) => {
    onFilterChange({ search: localSearch, order: value, favoritesOnly, ownOnly, categoryId, muscleGroupId });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({ search: localSearch, order, favoritesOnly, ownOnly, categoryId: value, muscleGroupId });
  };

  const handleMuscleGroupChange = (value: string) => {
    onFilterChange({ search: localSearch, order, favoritesOnly, ownOnly, categoryId, muscleGroupId: value });
  };

  const clearSearch = () => {
    setLocalSearch("");
    onFilterChange({ search: "", order, favoritesOnly, ownOnly, categoryId, muscleGroupId });
  };

  const toggleFavoritesOnly = () => {
    onFilterChange({ search, order, favoritesOnly: !favoritesOnly, ownOnly, categoryId, muscleGroupId });
  };

  const toggleOwnOnly = () => {
    onFilterChange({ search, order, favoritesOnly, ownOnly: !ownOnly, categoryId, muscleGroupId });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl p-3 sm:p-4 mb-4 bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-gray-200/60 dark:border-gray-800/60 shadow-md">
      <div className="flex flex-col sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar por nome, categoria ou grupo muscular"
            value={localSearch}
            onChange={handleSearchChange}
            disabled={loading}
            className="dark:bg-gray-950 pl-9 pr-9 font-medium text-sm text-gray-100 placeholder:text-gray-500 text-black focus-visible:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={clearSearch}
            disabled={loading}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap md:flex-nowrap w-full items-center gap-2 sm:gap-3">
          <Select value={categoryId || "all"} onValueChange={(v) => handleCategoryChange(v === "all" ? "" : v)} disabled={loading}>
            <SelectTrigger className="w-full font-medium text-sm text-black focus-visible:ring0">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={muscleGroupId || "all"} onValueChange={(v) => handleMuscleGroupChange(v === "all" ? "" : v)} disabled={loading}>
            <SelectTrigger className="w-full font-medium text-sm text-black focus-visible:ring-gray-500">
              <SelectValue placeholder="Grupo muscular" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os grupos</SelectItem>
              {muscleGroups.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant={ownOnly ? "default" : "outline"}
            size="sm"
            onClick={toggleOwnOnly}
            disabled={loading}
            className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto"
          >
            <UserCircle
              className={`w-4 h-4 ${ownOnly ? "text-white" : "text-black"}`}
            />
            <span className={`inline ${ownOnly ? "text-white" : "text-black"}`}>
              {ownOnly ? "Meus exercícios" : "Todos os exercícios"}
            </span>
          </Button>

          <Button
            type="button"
            variant={favoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={toggleFavoritesOnly}
            disabled={loading}
            className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto"
          >
            <Star
              className={`w-4 h-4 ${favoritesOnly ? "fill-current" : "stroke-black"}`}
            />
            <span className={`inline ${favoritesOnly ? "text-white" : "text-black"}`}>
              {favoritesOnly ? "Só favoritos" : "Todos"}
            </span>
          </Button>

          <Select value={order} onValueChange={handleOrderChange} disabled={loading}>
            <SelectTrigger className="w-full font-medium text-sm text-black focus-visible:ring-gray-500">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Nome (A–Z)</SelectItem>
              <SelectItem value="name-desc">Nome (Z–A)</SelectItem>
              <SelectItem value="newest">Mais novos</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ExerciseFilters;
