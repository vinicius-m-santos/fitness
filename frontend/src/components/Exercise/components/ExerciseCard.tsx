import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import DeleteExerciseModal from "@/components/Exercise/components/ExerciseDeleteModal";
import { useRequest } from "@/api/request";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ExerciseUpdateModal from "./ExerciseUpdateModal";

interface ExerciseCardProps {
  exercise: any;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const request = useRequest();
  const queryExercise = useQueryClient();

  const CategoryBadge = ({ data }: { data: any }) => {
    const { personal, exerciseCategory } = data;
    const badges = [];

    if (!personal) {
      badges.push(
        <span
          key="default"
          className="bg-gray-100 mb-2 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-sm"
        >
          Padrão
        </span>
      );
    }

    if (exerciseCategory) {
      let bgClass =
        "bg-gray-100 mb-2 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

      switch (exerciseCategory) {
        case "Superiores":
          bgClass =
            "bg-blue-100 mb-2 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
          break;
        case "Inferiores":
          bgClass =
            "bg-green-100 mb-2 text-green-800 dark:bg-green-900 dark:text-green-300";
          break;
        case "Full-body":
          bgClass =
            "bg-purple-100 mb-2 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
          break;
        case "Mobilidade":
          bgClass =
            "bg-red-100 mb-2 text-red-800 dark:bg-red-900 dark:text-red-300";
          break;
        case "Funcional":
          bgClass =
            "bg-yellow-100 mb-2 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
          break;
      }

      badges.push(
        <span
          key="category"
          className={`${bgClass} text-xs font-medium px-2.5 py-0.5 rounded-sm`}
        >
          {exerciseCategory}
        </span>
      );
    }

    return <div className="flex mt-2.5 items-center gap-2">{badges}</div>;
  };

  const handleView = () => navigate(`/client-view/${exercise.id}`);

  const handleDeleteExercise = async () => {
    await request({
      method: "DELETE",
      url: `/exercise/${exercise.id}`,
      showSuccess: true,
      successMessage: "Exercício excluído!",
      onAccept: () =>
        queryExercise.invalidateQueries({ queryKey: ["exercises"] }),
    });
  };

  return (
    <Card className="bg-gray-100 text-gray-100 rounded-2xl shadow-md">
      <CardHeader className="flex flex-row items-center gap-3">
        <div>
          <h3 className="font-semibold text-black text-lg capitalize">
            {exercise.name}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="flex items-center p-0 pl-6 gap-2 text-sm">
        <span className="text-sm font-medium text-gray-500">Categoria:</span>
        <CategoryBadge data={exercise} />
      </CardContent>

      <CardFooter className="flex flex-col justify-end gap-3 pt-2">
        <ExerciseUpdateModal openProp={false} exerciseId={exercise.id} />
        <DeleteExerciseModal onConfirm={handleDeleteExercise} isMobile={true} />
      </CardFooter>
    </Card>
  );
}
