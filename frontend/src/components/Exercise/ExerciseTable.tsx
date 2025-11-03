import {
  colorSchemeLightWarm,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { localeText } from "@/utils/traduction/traduction";
import { Pencil, Trash } from "lucide-react";
import DefaultTooltip from "@/components/ui/Tooltip/DefaultTooltip";
import { useRequest } from "@/api/request";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ExerciseUpdateModal from "./components/ExerciseUpdateModal";
import ExerciseDeleteModal from "./components/ExerciseDeleteModal";
import ExerciseDeleteDefaultModal from "./components/ExerciseDeleteDefaultModal";

const themeDarkBlue = themeQuartz.withPart(colorSchemeLightWarm);

const CategoryBadge = (params: any) => {
  const { personal, exerciseCategory } = params.data;
  const badges = [];

  // "Padrão" tag
  if (!personal) {
    badges.push(
      <span
        key="default"
        className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-sm"
      >
        Padrão
      </span>
    );
  }

  // Categoria tag
  if (exerciseCategory) {
    let bgClass =
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

    switch (exerciseCategory) {
      case "Superiores":
        bgClass =
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        break;
      case "Inferiores":
        bgClass =
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        break;
      case "Full-body":
        bgClass =
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
        break;
      case "Mobilidade":
        bgClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
        break;
      case "Funcional":
        bgClass =
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
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

const ActionButtons = (params: any) => {
  const { id, personal } = params.data;
  const queryClient = useQueryClient();
  const request = useRequest();

  const handleDelete = async () => {
    try {
      await request({
        method: "DELETE",
        url: `/exercise/${id}`,
        showSuccess: true,
        successMessage: "Exercício excluído!",
        onAccept: () =>
          queryClient.invalidateQueries({ queryKey: ["exercises"] }),
      });
    } catch (error: any) {
      toast.error("Erro ao excluir exercício!");
    }
  };

  const isDefault = personal === 0;
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

      {isDefault && (
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
  personal: number;
  createdAt: string;
  active: boolean;
}

interface ExerciseTableProps {
  exerciseTableData?: Exercise[];
  loading?: boolean;
}

const ExerciseTable = ({ exerciseTableData, loading }: ExerciseTableProps) => {
  const [columnDefs] = useState<ColDef[]>([
    {
      headerName: "Exercício",
      field: "name",
      filter: true,
      flex: 2,
      sortable: true,
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
  };

  return (
    <div
      className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200"
      style={{ width: "100%", minHeight: "15rem", height: "30rem" }}
    >
      <AgGridReact
        rowData={exerciseTableData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme={themeDarkBlue}
        localeText={localeText}
        pagination
        paginationPageSize={20}
        enableBrowserTooltips
        suppressMenuHide={false}
        loading={loading}
      />

      <style>
        {`
          .ag-cell-wrapper {
            height: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default ExerciseTable;
