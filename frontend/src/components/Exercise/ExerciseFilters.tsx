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

const DEBOUNCE_DELAY = 800; // ms

interface ExerciseFiltersProps {
  search?: string;
  order?: string;
  onFilterChange: (filters: {
    search: string;
    order: string;
    favoritesOnly?: boolean;
    ownOnly?: boolean;
  }) => void;
  favoritesOnly?: boolean;
  ownOnly?: boolean;
  loading?: boolean;
}

const ExerciseFilters = ({
  search = "",
  order = "newest",
  onFilterChange,
  favoritesOnly = false,
  ownOnly = false,
  loading = false,
}: ExerciseFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local search with prop when it changes externally
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search changes
  useEffect(() => {
    if (localSearch === search) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onFilterChange({ search: localSearch, order, favoritesOnly, ownOnly });
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localSearch, search, order, favoritesOnly, ownOnly, onFilterChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleOrderChange = (value: string) => {
    onFilterChange({ search: localSearch, order: value, favoritesOnly, ownOnly });
  };

  const clearSearch = () => {
    setLocalSearch("");
    onFilterChange({ search: "", order, favoritesOnly, ownOnly });
  };

  const toggleFavoritesOnly = () => {
    onFilterChange({ search, order, favoritesOnly: !favoritesOnly, ownOnly });
  };

  const toggleOwnOnly = () => {
    onFilterChange({ search, order, favoritesOnly, ownOnly: !ownOnly });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl p-3 sm:p-4 mb-4 bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-gray-200/60 dark:border-gray-800/60 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por nome"
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
            <SelectTrigger className="w-full sm:w-48 font-medium text-sm text-black focus-visible:ring-gray-500">
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
