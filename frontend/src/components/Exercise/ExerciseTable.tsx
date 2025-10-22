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
import ExerciseDeleteModal from "./Modals/ExerciseDeleteModal";
const themeDarkBlue = themeQuartz.withPart(colorSchemeLightWarm);

interface IRow {
  id: number;
  name: string;
  exerciseCategory: string;
  active: boolean;
  createdAt: string;
}

const DateConverter = (data: { value: string }) => {
  return DateConverterComponent(data.value, null);
};

const ActionButtons = (data: { value: number }) => {
  return (
    <div className="flex justify-center items-center h-full">
      <ExerciseUpdateModal openProp={false} exerciseId={data.value} />
      <ExerciseDeleteModal openProp={false} exerciseId={data.value} />
    </div>
  );
};

const CategoryBadge = (params: any) => {
  const category = params.value ?? "-";

  let bgClass = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

  switch (category) {
    case "Superior":
      bgClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      break;
    case "Inferior":
      bgClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      break;
    case "Full-body":
      bgClass = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      break;
    case "Mobilidade":
      bgClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      break;
    case "Funcional":
      bgClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      break;
  }

  return (
    <span
      className={`${bgClass} text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm`}
    >
      {category}
    </span>
  );
};

const ExerciseTable = () => {
  const api = useApi();
  async function loadExercises() {
    const res = await api.get("/exercise/all");
    console.log(res);
    return res.data.exercises;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["exercises"],
    queryFn: loadExercises,
  });
  const [columnDefs, setColumnDefs] = useState([
    { headerName: "ID", field: "id" },
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

  if (isLoading)
    return (
      <div className="w-full h-full min-h-[75vh] flex items-center justify-center">
        {/* <Spinner /> */}
      </div>
    );
  if (error) return <p>Erro ao carregar tabela</p>;

  return (
    <div
        className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200"
        style={{ width: "100%", height: "30rem" }}
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
      />
    </div>
  );
};

export default ExerciseTable;