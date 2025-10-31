import { useRequest } from "@/api/request";
import ExerciseCards from "@/components/Exercise/ExerciseCards";
import { ExerciseList } from "@/components/Exercise/ExerciseList";
import ExerciseTable from "@/components/Exercise/ExerciseTable";
import CreateExerciseModal from "@/components/Exercise/components/ExerciseCreateModal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Exercises() {
  const request = useRequest();

  const [openCreate, setOpenCreate] = useState(false);

  async function loadExercises() {
    const res = await request({ method: "get", url: "/exercise/all" });
    return res.exercises;
  }

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["exercises"],
    queryFn: loadExercises,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 pr-20 tracking-wide">
          Exercícios
        </h1>
        <CreateExerciseModal />
      </div>

      <div className="">
        <ExerciseList
          exerciseTableData={data}
          loading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}
