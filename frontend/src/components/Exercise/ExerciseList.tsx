import ExerciseCards from "./ExerciseCards";
import ExerciseFilters from "./ExerciseFilters";

export interface ExerciseListItem {
  id: number;
  name: string;
  exerciseCategory: string;
  muscleGroup: string;
  personal: number | null;
  createdAt: string;
  isStandard?: boolean;
  isFavorite?: boolean;
}

export interface ExerciseListPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ExerciseListProps {
  exerciseTableData?: ExerciseListItem[];
  loading?: boolean;
  pagination?: ExerciseListPagination;
  onPageChange?: (page: number) => void;
  favoritesOnly?: boolean;
  ownOnly?: boolean;
  search?: string;
  order?: string;
  categoryId?: string;
  muscleGroupId?: string;
  onFilterChange?: (filters: {
    search?: string;
    order?: string;
    favoritesOnly?: boolean;
    ownOnly?: boolean;
    categoryId?: string;
    muscleGroupId?: string;
  }) => void;
  onToggleFavorite?: (exerciseId: number) => Promise<void>;
}

export const ExerciseList = ({
  exerciseTableData,
  loading,
  pagination,
  onPageChange,
  favoritesOnly = false,
  ownOnly = false,
  search = "",
  order = "newest",
  categoryId = "",
  muscleGroupId = "",
  onFilterChange,
  onToggleFavorite,
}: ExerciseListProps) => {
  return (
    <div className="space-y-4">
      <ExerciseFilters
        search={search}
        order={order}
        categoryId={categoryId}
        muscleGroupId={muscleGroupId}
        onFilterChange={onFilterChange ?? (() => { })}
        favoritesOnly={favoritesOnly}
        ownOnly={ownOnly}
        loading={loading}
      />
      <ExerciseCards
        exerciseTableData={exerciseTableData ?? []}
        loading={loading ?? false}
        onToggleFavorite={onToggleFavorite}
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </div>
  );
};
