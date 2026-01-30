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
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExpiringItem {
  trainingId: number;
  trainingName: string;
  clientId: number;
  clientName: string;
  dueDate: string;
}

interface Props {
  data: ExpiringItem[];
  loading: boolean;
  onBack: () => void;
  isMobile: boolean;
}

function formatDueDate(value: string) {
  try {
    return format(parseISO(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return value;
  }
}

export default function WeekSummaryExpiring({
  data,
  loading,
  onBack,
  isMobile,
}: Props) {
  const navigate = useNavigate();
  const themeDarkBlue = themeQuartz.withPart(colorSchemeLightWarm);

  const columnDefs: ColDef[] = [
    { headerName: "Aluno", field: "clientName", flex: 2 },
    { headerName: "Treino", field: "trainingName", flex: 2 },
    {
      headerName: "Vencimento",
      field: "dueDate",
      flex: 1,
      valueFormatter: (params) => (params.value ? formatDueDate(params.value) : "-"),
    },
    {
      headerName: "Ação",
      cellRenderer: (params: { data?: ExpiringItem }) =>
        params.data ? (
          <button
            type="button"
            onClick={() => navigate(`/client-view/${params.data!.clientId}`)}
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
        <h2 className="text-xl font-semibold text-gray-900">Treinos a vencer (próximos 7 dias)</h2>
        {data.length === 0 ? (
          <p className="text-muted-foreground">Nenhum treino a vencer.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {data.map((item, idx) => (
              <Card
                key={`${item.clientId}-${item.trainingId}-${idx}`}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/client-view/${item.clientId}`)}
              >
                <CardHeader className="py-3">
                  <CardContent className="p-0 space-y-1">
                    <p className="font-medium text-gray-900">{item.clientName}</p>
                    <p className="text-sm text-gray-600">{item.trainingName}</p>
                    <p className="text-sm text-muted-foreground">
                      Vencimento: {formatDueDate(item.dueDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">Toque para ver o aluno</p>
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
      <h2 className="text-xl font-semibold text-gray-900">Treinos a vencer (próximos 7 dias)</h2>
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
