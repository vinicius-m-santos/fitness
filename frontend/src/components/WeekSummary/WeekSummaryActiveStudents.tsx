import { useNavigate } from "react-router-dom";
import Loader from "@/components/ui/loader";
import {
  colorSchemeLightWarm,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { localeText } from "@/utils/traduction/traduction";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Student {
  id: number;
  name: string;
  lastName?: string;
}

interface Props {
  data: Student[];
  loading: boolean;
  onBack: () => void;
  isMobile: boolean;
}

const nameRenderer = (params: { value?: string; data?: Student }) => {
  const d = params.data;
  if (!d) return "-";
  return [d.name, d.lastName].filter(Boolean).join(" ");
};

export default function WeekSummaryActiveStudents({
  data,
  loading,
  onBack,
  isMobile,
}: Props) {
  const navigate = useNavigate();
  const themeDarkBlue = themeQuartz.withPart(colorSchemeLightWarm);

  const columnDefs: ColDef[] = [
    { headerName: "Nome", field: "name", flex: 2, cellRenderer: nameRenderer },
    {
      headerName: "Ação",
      cellRenderer: (params: { data?: Student }) =>
        params.data ? (
          <button
            type="button"
            onClick={() => navigate(`/client-view/${params.data!.id}`)}
            className="text-blue-600 hover:underline text-sm cursor-pointer"
          >
            Ver aluno
          </button>
        ) : null,
      flex: 1,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          ← Voltar
        </button>
        <div className="flex justify-center items-center h-40">
          <Loader loading />
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          ← Voltar
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Alunos que treinaram nesta semana</h2>
        {data.length === 0 ? (
          <p className="text-muted-foreground">Nenhum aluno treinou nesta semana.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {data.map((s) => (
              <Card
                key={s.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/client-view/${s.id}`)}
              >
                <CardHeader className="py-3">
                  <CardContent className="p-0">
                    <p className="font-medium text-gray-900">
                      {[s.name, s.lastName].filter(Boolean).join(" ")}
                    </p>
                    <p className="text-sm text-muted-foreground">Toque para ver o aluno</p>
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        ← Voltar
      </button>
      <h2 className="text-xl font-semibold text-gray-900">Alunos que treinaram nesta semana</h2>
      <div
        className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200"
        style={{ width: "100%", minHeight: "15rem", height: "30rem" }}
      >
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={{ flex: 1, resizable: true }}
          theme={themeDarkBlue}
          localeText={localeText}
          pagination
          paginationPageSize={20}
          loading={loading}
        />
      </div>
    </div>
  );
}
