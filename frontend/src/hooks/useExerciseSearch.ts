"use client";

import { useQuery } from "@tanstack/react-query";
import { useRequest } from "@/api/request";

const PAGE_SIZE = 30;

export type ExerciseSearchItem = {
  id: number;
  name: string;
  exerciseCategory?: string;
  muscleGroup?: string;
};

export function useExerciseSearch(search: string, page: number, enabled: boolean) {
  const request = useRequest();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["exercises-search", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        favoritesOnly: "false",
        ownOnly: "false",
      });
      if (search.trim()) params.set("search", search.trim());
      params.set("order", "name-asc");
      const res = await request({
        method: "GET",
        url: `/exercise/all?${params.toString()}`,
      });
      return {
        exercises: (res.exercises ?? []).map(
          (e: { id: number; name: string; exerciseCategory?: string; muscleGroup?: string }) => ({
            id: e.id,
            name: e.name,
            exerciseCategory: e.exerciseCategory,
            muscleGroup: e.muscleGroup,
          })
        ),
        total: res.total ?? 0,
        totalPages: res.totalPages ?? 1,
      };
    },
    enabled,
    staleTime: 1 * 60 * 1000,
  });

  return {
    exercises: data?.exercises ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading: isLoading || isFetching,
  };
}
