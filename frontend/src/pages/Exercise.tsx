import { useRequest } from "@/api/request";
import { ExerciseList } from "@/components/Exercise/ExerciseList";
import ExerciseCreateModal from "@/components/Exercise/components/ExerciseCreateModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dumbbell } from "lucide-react";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export default function Exercises() {
  const request = useRequest();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [ownOnly, setOwnOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("newest");

  const handleToggleFavorite = useCallback(
    async (exerciseId: number) => {
      try {
        await request({
          method: "patch",
          url: `/exercise/${exerciseId}/favorite`,
          showSuccess: false,
        });
        queryClient.invalidateQueries({ queryKey: ["exercises"] });
      } catch {
        toast.error("Erro ao atualizar favorito.");
      }
    },
    [request, queryClient]
  );

  const loadExercises = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(DEFAULT_LIMIT),
      favoritesOnly: String(favoritesOnly),
      ownOnly: String(ownOnly),
    });

    if (search) {
      params.append('search', search);
    }

    if (order) {
      params.append('order', order);
    }

    const res = await request({
      method: "get",
      url: `/exercise/all?${params.toString()}`,
    });
    return res;
  }, [request, page, favoritesOnly, ownOnly, search, order]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["exercises", page, favoritesOnly, ownOnly, search, order],
    queryFn: loadExercises,
    staleTime: 2 * 60 * 1000,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = useCallback(
    (filters: {
      search?: string;
      order?: string;
      favoritesOnly?: boolean;
      ownOnly?: boolean;
    }) => {
      if (filters.search !== undefined) {
        setSearch(filters.search);
        setPage(1);
      }
      if (filters.order !== undefined) {
        setOrder(filters.order);
        setPage(1);
      }
      if (filters.favoritesOnly !== undefined) {
        setFavoritesOnly(filters.favoritesOnly);
        setPage(1);
      }
      if (filters.ownOnly !== undefined) {
        setOwnOnly(filters.ownOnly);
        setPage(1);
      }
    },
    []
  );

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <div className="flex flex-row justify-between md:flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide flex items-center gap-2">
          <Dumbbell className="h-6 w-6 md:h-8 md:w-8" />
          Exercícios
        </h1>
        <ExerciseCreateModal openProp={false} onOpenChange={() => { }} />
      </div>

      <div className="min-w-0">
        <ExerciseList
          exerciseTableData={data?.exercises}
          loading={isLoading || isFetching}
          pagination={
            data
              ? {
                total: data.total,
                page: data.page,
                limit: data.limit,
                totalPages: data.totalPages,
              }
              : undefined
          }
          onPageChange={handlePageChange}
          favoritesOnly={favoritesOnly}
          ownOnly={ownOnly}
          search={search}
          order={order}
          onFilterChange={handleFilterChange}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    </div>
  );
}
