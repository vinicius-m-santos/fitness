import {
    colorSchemeLightWarm,
    themeQuartz,
    type ColDef,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { useApi } from "@/api/Api";
import Loader from "@/components/ui/loader";
import { useQuery } from "@tanstack/react-query";
import DateConverterComponent from "@/utils/DateConverter";
import { localeText } from "@/utils/traduction/traduction";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const themeDarkBlue = themeQuartz.withPart(colorSchemeLightWarm);

interface IRow {
    id: string;
    name: string;
    description: number;
    active: boolean;
    createdAt: string;
}

const DateConverter = (data: { value: string }) => {
    return DateConverterComponent(data.value, null);
};

const ActionButtons = (params: any) => {
    const { navigate } = params;

    const handleView = () => {
        return navigate(`/client-view/${params.data.id}`, {
            state: { client: params.data },
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(params.data));
        alert("Dados copiados!");
    };

    return (
        <div className="flex justify-center items-center gap-3">
            <button
                onClick={handleView}
                className="p-1 text-blue-500 hover:text-blue-700 transition"
                title="Visualizar"
            >
                <Eye className="w-5 h-5" />
            </button>
            {/* <button
        onClick={handleCopy}
        className="p-1 text-green-500 hover:text-green-700 transition"
        title="Copiar"
      >
        <Copy className="w-5 h-5" />
      </button> */}
        </div>
    );
};

const ClientTable = () => {
    const api = useApi();
    const navigate = useNavigate();
    async function loadClients() {
        const res = await api.get("/client/all");
        console.log(res);
        return res.data.clients;
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ["clients"],
        queryFn: loadClients,
    });
    const [columnDefs, setColumnDefs] = useState([
        { headerName: "ID", field: "id" },
        { headerName: "Nome", field: "name", filter: true, flex: 2 },
        { headerName: "Sobrenome", field: "lastName", filter: true, flex: 3 },
        { headerName: "Gênero", field: "gender", flex: 2 },
        { headerName: "Ativo", field: "active" },
        {
            headerName: "Data de Cadastro",
            cellRenderer: DateConverter,
            field: "createdAt",
            flex: 2,
        },
        {
            headerName: "Ação",
            cellRenderer: (params) => (
                <ActionButtons {...params} navigate={navigate} />
            ),
            flex: 2,
        },
    ]);

    const defaultColDef: ColDef = {
        flex: 1,
    };

    if (isLoading)
        return (
            <div className="w-full h-full min-h-[75vh] flex items-center justify-center">
                <Loader loading={isLoading} />
            </div>
        );
    if (error) return <p>Erro ao carregar tabela</p>;

    return (
        <div
            className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200"
            style={{ width: "100%", height: "15rem" }}
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

export default ClientTable;
