import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Eye } from "lucide-react";
import { GENDERS } from "@/utils/constants/Client/constants";
import DateConverterComponent from "@/utils/DateConverter";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ClientDeleteModal from "@/components/Client/components/ClientDeleteModal";
import { useRequest } from "@/api/request";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface ClientCardProps {
  client: any;
}

export default function ClientCard({ client }: ClientCardProps) {
  const navigate = useNavigate();
  const request = useRequest();
  const queryClient = useQueryClient();

  const handleView = () => navigate(`/client-view/${client.id}`);

  const handleSendRegistrationLink = async () => {
    if (!client?.id) {
      toast.error("Erro ao enviar link!");
      return;
    }
    try {
      await request({
        method: "POST",
        url: `/client/send-registration-link/${client.id}`,
        showSuccess: true,
        successMessage: "Link de cadastro enviado com sucesso!",
        onAccept: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
      });
    } catch {
      toast.error("Erro ao enviar link de cadastro");
    }
  };

  const handleClientDelete = async () => {
    await request({
      method: "DELETE",
      url: `/client/${client.id}`,
      showSuccess: true,
      successMessage: "Aluno excluído!",
      onAccept: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
    });
  };

  const gender = Object.keys(GENDERS).includes(client.gender)
    ? GENDERS[client.gender]
    : "-";

  return (
    <Card className="bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-gray-200/60 dark:border-gray-800/60 rounded-2xl shadow-md">
      <CardHeader className="flex flex-row items-center gap-3">
        <Avatar className="h-10 w-10">
          {client?.user?.avatarUrl ? (
            <AvatarImage src={client.user.avatarUrl} alt="Foto do cliente" />
          ) : (
            <AvatarFallback className="bg-gray-200 text-gray-800">
              {client?.name?.[0]?.toUpperCase()}
              {client?.lastName?.[0]?.toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="font-semibold text-black text-lg capitalize">
            {client.name} {client.lastName}
          </h3>
          <p className="text-sm font-medium text-gray-500">{gender}</p>
        </div>
      </CardHeader>

      <CardContent className="text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-500">Ativo:</span>
          <span className="text-sm font-medium text-gray-500">
            {client.active ? "Sim" : "Não"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-500">
            Data de Cadastro:
          </span>
          <span className="text-sm font-medium text-gray-500">
            {DateConverterComponent(client.createdAt, null)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col justify-end gap-2 pt-2">
        <Button
          onClick={handleView}
          variant="ghost"
          size="sm"
          className="w-full justify-center rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/40"
        >
          <Eye className="w-4 h-4" />
          <span>Visualizar</span>
        </Button>

        {!client?.hasRegistered && (
          <Button
            onClick={handleSendRegistrationLink}
            variant="ghost"
            size="sm"
            className="w-full justify-center rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
          >
            <Mail className="w-4 h-4" />
            <span>Enviar link de cadastro</span>
          </Button>
        )}

        <ClientDeleteModal onConfirm={handleClientDelete} isMobile={true} />
      </CardFooter>
    </Card>
  );
}
