import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface ExerciseFiltersProps {
  onFilterChange: (filters: { search: string; order: string }) => void;
}

const ExerciseFilters = ({ onFilterChange }: ExerciseFiltersProps) => {
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("newest");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  const handleOrderChange = (value: string) => {
    setOrder(value);
  };

  const clearSearch = () => {
    setSearch("");
  };

  useEffect(() => {
    onFilterChange({ search, order });
  }, [search, order, onFilterChange]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border shadow-md rounded-xl p-4 mb-4">
      <div className="relative w-full sm:w-1/2">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar por nome"
          value={search}
          onChange={handleSearchChange}
          className="px-9 font-medium text-sm text-gray-100 placeholder:text-gray-500 text-black focus-visible:ring-gray-500"
        />
        <X
          onClick={clearSearch}
          className="absolute right-3 top-2.5 text-gray-400 w-4 h-4"
        />
      </div>

      <Select value={order} onValueChange={handleOrderChange}>
        <SelectTrigger className="w-full font-medium text-sm sm:w-64 text-black focus-visible:ring-gray-500">
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
  );
};

export default ExerciseFilters;
