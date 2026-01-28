import {
  colorSchemeLightWarm,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import DateConverterComponent from "@/utils/DateConverter";
import { localeText } from "@/utils/traduction/traduction";
import { Mail, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { GENDERS } from "@/utils/constants/Client/constants";
import { useAuth } from "@/providers/AuthProvider";
import toast from "react-hot-toast";
import DefaultTooltip from "../ui/Tooltip/DefaultTooltip";
import ClientDeleteModal from "./components/ClientDeleteModal";
import { useRequest } from "@/api/request";
import { useQueryClient } from "@tanstack/react-query";

const themeDarkBlue = themeQuartz.withPart(colorSchemeLightWarm);

const DateConverter = (data: { value: string }) =>
  DateConverterComponent(data.value, null);

const ActionButtons = (params: any) => {
  const { navigate, queryClient, request, user } = params;

  const handleView = () => navigate(`/client-view/${params.data.id}`);

  const handleSendRegistrationLink = async () => {
    if (!params.data?.id) {
      toast.error("Erro ao enviar link!");
      return;
    }

    try {
      await request({
        method: "POST",
        url: `/client/send-registration-link/${params.data.id}`,
        showSuccess: true,
        successMessage: "Link de cadastro enviado com sucesso!",
        onAccept: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
      });
    } catch {
      toast.error("Erro ao enviar link de cadastro");
    }
  };

  const handleClientDelete = async () => {
    const res = await request({
      method: "DELETE",
      url: `/client/${params.data.id}`,
      showSuccess: true,
      successMessage: "Aluno excluído!",
      onAccept: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
    });
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      <DefaultTooltip tooltipText="Visualizar aluno" delay={0}>
        <button
          onClick={handleView}
          className="cursor-pointer p-1 text-blue-500 hover:text-blue-700 transition"
        >
          <Eye className="w-5 h-5" />
        </button>
      </DefaultTooltip>
      {!params.data?.hasRegistered && (
        <DefaultTooltip tooltipText="Enviar link de cadastro" delay={0}>
          <button
            onClick={handleSendRegistrationLink}
            className="cursor-pointer p-1 text-green-500 hover:text-green-700 transition"
          >
            <Mail className="w-5 h-5" />
          </button>
        </DefaultTooltip>
      )}
      <ClientDeleteModal onConfirm={handleClientDelete} />
    </div>
  );
};

const showAvatar = (params: any) => {
  const client = params.data;

  return (
    <div className="flex items-center justify-center h-full">
      <Avatar className="h-8 w-8 cursor-pointer">
        {client?.user?.avatarUrl ? (
          <AvatarImage
            src={client.user.avatarUrl}
            alt="Foto do cliente"
            className="object-cover object-center"
          />
        ) : (
          <AvatarFallback className="bg-gray-200 text-gray-800">
            {client?.name[0].toUpperCase()}
            {client?.lastName?.[0].toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
    </div>
  );
};

const genderRenderer = (params: any) => {
  const hasValue = Object.keys(GENDERS).includes(params.value);
  return hasValue ? GENDERS[params.value] : "-";
};

const nameRenderer = (params: any) => {
  const value = params.value?.toString() ?? "";
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "-";
};

const ClientTable = ({ clientTableData, loading }) => {
  const navigate = useNavigate();
  const request = useRequest();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [columnDefs] = useState([
    { headerName: "", cellRenderer: showAvatar },
    {
      headerName: "Nome",
      field: "name",
      filter: true,
      flex: 2,
      cellRenderer: nameRenderer,
    },
    {
      headerName: "Sobrenome",
      field: "lastName",
      filter: true,
      flex: 3,
      cellRenderer: nameRenderer,
    },
    {
      headerName: "Gênero",
      field: "gender",
      flex: 2,
      cellRenderer: genderRenderer,
    },
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
        <ActionButtons
          {...params}
          navigate={navigate}
          queryClient={queryClient}
          request={request}
          user={user}
        />
      ),
      flex: 2,
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
        rowData={clientTableData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme={themeDarkBlue}
        localeText={localeText}
        pagination={true}
        paginationPageSize={20}
        enableBrowserTooltips={true}
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

export default ClientTable;
