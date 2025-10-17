import {
  colorSchemeLightWarm,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { useApi } from "../../api/Api";
import  Loader from "../../components/ui/loader";
import { useQuery } from "@tanstack/react-query";
import DateConverterComponent from "../../utils/DateConverter";

const themeDarkBlue = themeQuartz.withPart(colorSchemeLightWarm);

interface IRow {
  id: string;
  name: string;
  description: number;
  active: boolean;
  createdAt: string;
}

const DateConverter = (data: { value: string }) => {
  console.log(data.value)
  return DateConverterComponent(data.value, null);
};

const ActionButtons = (data: { value: number }) => {
  return (
    <div className="flex justify-center items-center h-full">
    </div>
  );
};

const ClientTable = () => {
  const api = useApi();
  async function loadClients() {
    const res = await api.get("/client/all");
    console.log(res)
    return res.data.clients;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["clients"],
    queryFn: loadClients,
  });
  const [columnDefs, setColumnDefs] = useState([
    { headerName: "ID", field: "id" },
    { headerName: "Nome", field: "name", flex: 2 },
    { headerName: "Sobrenome", field: "lastName", flex: 3 },
    { headerName: "Gênero", field: "gender", flex: 3 },
    { headerName: "Ativo", field: "active" },
    {
      headerName: "Data de Cadastro",
      cellRenderer: DateConverter,
      field: "createdAt",
      flex: 2,
    },
  ]);

  const defaultColDef: ColDef = {
    flex: 1,
  };

  if (isLoading)
    return (
      <div className="w-full h-full min-h-[75vh] flex items-center justify-center">
        <Loader loading={isLoading}/>
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
      />
    </div>
  );
};

export default ClientTable;