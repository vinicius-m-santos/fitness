import Loader from "@/components/ui/loader";
import ExerciseCard from "@/components/Exercise/components/ExerciseCard";
import { Button } from "@/components/ui/button";
import type { ExerciseListPagination, ExerciseListItem } from "./ExerciseList";

interface ExerciseCardsProps {
  exerciseTableData: ExerciseListItem[];
  loading: boolean;
  onToggleFavorite?: (exerciseId: number) => Promise<void>;
  pagination?: ExerciseListPagination;
  onPageChange?: (page: number) => void;
}

export default function ExerciseCards({
  exerciseTableData,
  loading,
  onToggleFavorite,
  pagination,
  onPageChange,
}: ExerciseCardsProps) {
  // Data is now filtered and sorted by the backend
  const data = exerciseTableData || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-400">
        <Loader loading={loading} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="flex justify-center items-center h-40 text-gray-400">
          Nenhum exercício encontrado.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {data.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && onPageChange && (
            <div className="flex flex-wrap items-center justify-between gap-2 py-2">
              <p className="text-sm text-gray-600">
                {pagination.total} exercício(s) • Página {pagination.page} de{" "}
                {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2 text-black">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => onPageChange(pagination.page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => onPageChange(pagination.page + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
