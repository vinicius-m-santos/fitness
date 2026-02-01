import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import DeleteExerciseModal from "@/components/Exercise/components/ExerciseDeleteModal";
import { getBadgeClassName } from "@/components/Exercise/badgeColors";
import { useRequest } from "@/api/request";
import { useQueryClient } from "@tanstack/react-query";
import ExerciseUpdateModal from "./ExerciseUpdateModal";
import { Star } from "lucide-react";

interface ExerciseCardProps {
  exercise: any;
  onToggleFavorite?: (exerciseId: number) => Promise<void>;
}

export default function ExerciseCard({
  exercise,
  onToggleFavorite,
}: ExerciseCardProps) {
  const request = useRequest();
  const queryExercise = useQueryClient();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const isStandard = exercise.isStandard || exercise.personal === null;
  const isFavorite = !!exercise.isFavorite;

  const handleStarClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onToggleFavorite || favoriteLoading || isStandard) return;
    setFavoriteLoading(true);
    try {
      await onToggleFavorite(exercise.id);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const CategoryBadge = ({ data }: { data: any }) => {
    const { personal, isStandard: standard, exerciseCategory } = data;
    const badges = [];

    // if (standard || !personal) {
    //   badges.push(
    //     <span
    //       key="default"
    //       className="bg-gray-100 mb-2 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-sm"
    //     >
    //       Padrão
    //     </span>
    //   );
    // }

    if (exerciseCategory) {
      let color = "gray";

      switch (exerciseCategory) {
        case "Musculação":
          color = "blue";
          break;
        case "Aeróbico":
          color = "green";
          break;
        case "Funcional":
          color = "purple";
          break;
        case "Alongamento":
          color = "red";
          break;
        case "Em casa":
          color = "yellow";
          break;
        case "Mobilidade":
          color = "red";
          break;
        case "Elástico":
          color = "pink";
          break;
        case "MAT Pilates":
          color = "brown";
          break;
        case "Laboral":
          color = "red";
          break;
      }

      badges.push(
        <span
          key="category"
          className={getBadgeClassName(color, "mb-2 px-2 py-0.5 rounded-sm")}
        >
          {exerciseCategory}
        </span>
      );
    }

    return <div className="flex mt-2.5 items-center gap-2">{badges}</div>;
  };

  const MuscleGroupBadge = ({ data }: { data: any }) => {
    const { muscleGroup } = data;

    if (muscleGroup) {
      let color = "gray";

      switch (muscleGroup) {
        case "Perna":
          color = "blue";
          break;
        case "Peitoral":
          color = "green";
          break;
        case "Bíceps":
          color = "purple";
          break;
        case "Ombro":
          color = "red";
          break;
        case "Abdômen":
          color = "yellow";
          break;
        case "Lombar":
          color = "pink";
          break;
        case "Trapézio":
          color = "amber";
          break;
        case "Dorsal":
          color = "indigo";
          break;
        case "Outros":
          color = "slate";
          break;
        case "Alongamento":
          color = "cyan";
          break;
        case "Antebraço":
          color = "violet";
          break;
        case "Elásticos e Faixas":
          color = "teal";
          break;
        case "Funcional":
          color = "emerald";
          break;
        case "Inferiores":
          color = "sky";
          break;
        case "Laboral":
          color = "orange";
          break;
        case "MAT Pilates":
          color = "fuchsia";
          break;
        case "Mobilidade":
          color = "red";
          break;
        case "Para Fazer em Casa":
          color = "rose";
          break;
        case "Tríceps":
          color = "zinc";
          break;
      }

      return <span className={getBadgeClassName(color, "px-2 py-0.5 rounded-sm")}>{muscleGroup}</span>;
    }
  };

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
    <Card className="flex flex-col justify-between bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-gray-200/60 dark:border-gray-800/60 rounded-2xl shadow-md">
      <CardHeader className="flex flex-row flex-grow-1 items-center gap-2">
        <div className="min-w-0 flex-1 m-0">
          <h3 className="font-semibold text-black text-lg capitalize truncate">
            {exercise.name}
          </h3>
        </div>
        {!isStandard && (
          <button
            type="button"
            onClick={handleStarClick}
            disabled={favoriteLoading}
            className="p-1 rounded hover:bg-gray-200/50 disabled:opacity-50 shrink-0 mt-0.5"
            aria-label={isFavorite ? "Remover dos favoritos" : "Marcar como favorito"}
          >
            <Star
              className={`w-5 h-5 transition-colors ${isFavorite
                ? "fill-yellow-400 text-yellow-500"
                : "text-gray-400 hover:text-yellow-500/70"
                }`}
            />
          </button>
        )}
      </CardHeader>

      <CardContent className="flex flex-col items-start p-0 pl-6 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Categoria:</span>
          <CategoryBadge data={exercise} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Grupo Muscular:</span>
          <MuscleGroupBadge data={exercise} />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col justify-end gap-3 pt-2">
        {!isStandard && (
          <>
            <ExerciseUpdateModal openProp={false} exerciseId={exercise.id} />
            <DeleteExerciseModal onConfirm={handleDeleteExercise} isMobile={true} />
          </>
        )}
      </CardFooter>
    </Card>
  );
}
