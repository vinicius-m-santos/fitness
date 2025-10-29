import {
  colorSchemeLightWarm,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { useApi } from "../../api/Api";
import Loader from "../../components/ui/loader";
import { useQuery } from "@tanstack/react-query";
import DateConverterComponent from "../../utils/DateConverter";
import { localeText } from "../../utils/traduction/traduction";
import ExerciseUpdateModal from "./Modals/ExerciseUpdateModal";
import ExerciseDeleteDefaultModal from "./Modals/ExerciseDeleteDefaultModal";
import ExerciseDeleteModal from "./Modals/ExerciseDeleteModal";
const themeDarkBlue = themeQuartz.withPart(colorSchemeLightWarm);

interface IRow {
  id: number;
  name: string;
  personal: number;
  exerciseCategory: string;
  active: boolean;
  createdAt: string;
}

const DateConverter = (data: { value: string }) => {
  return DateConverterComponent(data.value, null);
};

const ActionButtons = (params: any) => {
  const { id, personal } = params.data;
  const isDefault = !!personal;

  if (isDefault) {
    return (
      <div className="flex justify-center items-center h-full">
        <ExerciseUpdateModal openProp={false} exerciseId={id} />
        <ExerciseDeleteModal openProp={false} exerciseId={id} />
      </div>
    );
  } else {
    return (
      <div className="flex justify-center items-center h-full">
        <ExerciseDeleteDefaultModal openProp={false} exerciseId={id} />
      </div>
    );
  }
};

const CategoryBadge = (params: any) => {
  const { personal, exerciseCategory } = params.data;
  const badges = [];

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

const ExerciseTable = () => {
  const api = useApi();
  async function loadExercises() {
    const res = await api.get("/exercise/all");
    return res.data.exercises;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["exercises"],
    queryFn: loadExercises,
  });
  const [columnDefs, setColumnDefs] = useState([
    {
      headerName: "Exercício",
      field: "name",
      flex: 2,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Tipo",
      field: "exerciseCategory",
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: CategoryBadge,
    },
    { headerName: "Ações", cellRenderer: ActionButtons, field: "id", flex: 2 },
  ]);

  const defaultColDef: ColDef = {
    flex: 1,
  };

  return (
    <div
      className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200"
      style={{ width: "100%", minHeight: "15rem", height: "30rem" }}
    >
      <AgGridReact
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme={themeDarkBlue}
        localeText={localeText}
        pagination={true}
        paginationPageSize={20}
        enableBrowserTooltips={true}
        suppressMenuHide={false}
        loading={isLoading}
      />
    </div>
  );
};

export default ExerciseTable;
