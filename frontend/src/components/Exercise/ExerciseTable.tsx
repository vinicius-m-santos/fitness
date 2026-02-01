import {
  colorSchemeLightWarm,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { localeText } from "@/utils/traduction/traduction";
import { Star } from "lucide-react";
import DefaultTooltip from "@/components/ui/Tooltip/DefaultTooltip";
import { useRequest } from "@/api/request";
import { useQueryClient } from "@tanstack/react-query";
import ExerciseUpdateModal from "./components/ExerciseUpdateModal";
import ExerciseDeleteModal from "./components/ExerciseDeleteModal";
import ExerciseDeleteDefaultModal from "./components/ExerciseDeleteDefaultModal";
import { Button } from "@/components/ui/button";
import type { ExerciseListPagination } from "./ExerciseList";

const themeDarkBlue = themeQuartz.withPart(colorSchemeLightWarm);

const FavoriteStar = (params: any) => {
  const { id, isFavorite, isStandard, onToggleFavorite } = params.data;
  const [loading, setLoading] = useState(false);

  // if (isStandard) {
  //   return null;
  // }

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleFavorite || loading) return;
    setLoading(true);
    try {
      await onToggleFavorite(id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="p-1 rounded hover:bg-gray-200/50 disabled:opacity-50"
      aria-label={isFavorite ? "Remover dos favoritos" : "Marcar como favorito"}
    >
      <Star
        className={`w-5 h-5 transition-colors ${isFavorite
          ? "fill-yellow-400 text-yellow-500"
          : "text-gray-400 hover:text-yellow-500/70"
          }`}
      />
    </button>
  );
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
        className={`bg-${color}-100 mb-2 text-${color}-800 dark:bg-${color}-700 dark:text-${color}-300 px-2 py-0.5 rounded-sm`}
      >
        {exerciseCategory}
      </span>
    );
  }

  return <div className="inline-block mt-2.5 items-center gap-2">{badges}</div>;
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

    return <span className={`bg-${color}-100 text-${color}-800 dark:bg-${color}-700 dark:text-${color}-300 px-2 py-0.5 rounded-sm`}>{muscleGroup}</span>;
  }
};

const ExerciseNameCell = (params: { value?: string }) => (
  <div className="w-full min-w-0 py-1 break-words whitespace-normal overflow-visible">
    {params.value ?? ""}
  </div>
);

const ActionButtons = (params: any) => {
  const { id, personal, isStandard } = params.data;
  const queryClient = useQueryClient();
  const request = useRequest();

  const handleDelete = async () => {
    await request({
      method: "DELETE",
      url: `/exercise/${id}`,
      showSuccess: true,
      successMessage: "Exercício excluído!",
      onAccept: () =>
        queryClient.invalidateQueries({ queryKey: ["exercises"] }),
    });
  };

  const isDefault = isStandard || personal === null || personal === 0;
  const showDeleteDefault = isDefault && !isStandard;

  return (
    <div className="flex items-center gap-2 justify-center">
      {!isDefault && (
        <>
          <DefaultTooltip tooltipText="Editar exercício" delay={0}>
            <ExerciseUpdateModal openProp={false} exerciseId={id} />
          </DefaultTooltip>

          <DefaultTooltip tooltipText="Excluir exercício" delay={0}>
            <ExerciseDeleteModal onConfirm={handleDelete} />
          </DefaultTooltip>
        </>
      )}

      {showDeleteDefault && (
        <DefaultTooltip tooltipText="Excluir exercício padrão" delay={0}>
          <ExerciseDeleteDefaultModal openProp={false} exerciseId={id} />
        </DefaultTooltip>
      )}
    </div>
  );
};

interface Exercise {
  id: number;
  name: string;
  exerciseCategory: string;
  muscleGroup: string;
  personal: number | null;
  createdAt: string;
  isStandard?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => Promise<void>;
}

interface ExerciseTableProps {
  exerciseTableData?: Exercise[];
  loading?: boolean;
  onToggleFavorite?: (exerciseId: number) => Promise<void>;
  pagination?: ExerciseListPagination;
  onPageChange?: (page: number) => void;
}

const ExerciseTable = ({
  exerciseTableData,
  loading,
  onToggleFavorite,
  pagination,
  onPageChange,
}: ExerciseTableProps) => {
  // Data is now filtered and sorted by the backend
  const data = exerciseTableData || [];

  const dataWithToggle = data.map((row) => ({
    ...row,
    onToggleFavorite,
  }));

  const [columnDefs] = useState<ColDef[]>([
    {
      headerName: "",
      field: "isFavorite",
      width: 52,
      sortable: false,
      filter: false,
      cellRenderer: FavoriteStar,
    },
    {
      headerName: "Exercício",
      field: "name",
      filter: true,
      flex: 2,
      minWidth: 200,
      sortable: true,
      wrapText: true,
      autoHeight: true,
      cellClass: "ag-cell-exercise-name",
      cellRenderer: ExerciseNameCell,
    },
    {
      headerName: "Categoria",
      field: "exerciseCategory",
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: CategoryBadge,
    },
    {
      headerName: "Grupo Muscular",
      field: "muscleGroup",
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: MuscleGroupBadge,
    },
    {
      headerName: "Ação",
      flex: 2,
      cellRenderer: ActionButtons,
    },
  ]);

  const defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    wrapText: true,
    autoHeight: true,
    cellClass: "ag-cell-vertical-center",
  };

  const pageSize = pagination?.limit ?? 20;

  return (
    <div className="space-y-3">
      <div
        className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200"
        style={{ width: "100%", minHeight: "15rem", height: "30rem" }}
      >
        <AgGridReact
          rowData={dataWithToggle}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme={themeDarkBlue}
          localeText={localeText}
          pagination
          paginationPageSize={pageSize}
          paginationPageSizeSelector={[10, 20, 50]}
          enableBrowserTooltips
          suppressMenuHide={false}
          loading={loading}
        />

        <style>
          {`
            .ag-cell-wrapper {
              height: 100%;
            }
            .ag-cell.ag-cell-vertical-center {
              display: flex;
              align-items: center;
            }
            .ag-cell.ag-cell-vertical-center .ag-cell-wrapper {
              width: 100%;
              display: flex;
              align-items: center;
            }
            .ag-cell.ag-cell-exercise-name {
              overflow: visible !important;
              white-space: normal !important;
              word-break: break-word !important;
              line-height: 1.4;
            }
            .ag-cell.ag-cell-exercise-name .ag-cell-wrapper {
              overflow: visible !important;
              white-space: normal !important;
              word-break: break-word !important;
            }
          `}
        </style>
      </div>

      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex flex-wrap items-center justify-between gap-2 py-2">
          <p className="text-sm text-gray-600">
            {pagination.total} exercício(s) • Página {pagination.page} de{" "}
            {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
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
    </div>
  );
};

export default ExerciseTable;
