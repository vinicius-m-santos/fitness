import { useMemo, useState } from "react";
import Loader from "@/components/ui/loader";
import ExerciseCard from "@/components/Exercise/components/ExerciseCard";
import ExerciseFilters from "./ExerciseFilters";

export default function ClientCards({
  exerciseTableData,
  loading,
}: {
  exerciseTableData: any[];
  loading: boolean;
}) {
  const [filters, setFilters] = useState({ search: "", order: "newest" });

  const filteredData = useMemo(() => {
    let data = exerciseTableData ? [...exerciseTableData] : [];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      data = data.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchLower) ||
          exercise.exerciseCategory?.toLowerCase().includes(searchLower)
      );
    }

    switch (filters.order) {
      case "name-asc":
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        data.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        data.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
    }

    return data;
  }, [exerciseTableData, filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-400">
        <Loader loading={loading} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ExerciseFilters onFilterChange={setFilters} />

      {filteredData.length === 0 ? (
        <div className="flex justify-center items-center h-40 text-gray-400">
          Nenhum aluno encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
}
