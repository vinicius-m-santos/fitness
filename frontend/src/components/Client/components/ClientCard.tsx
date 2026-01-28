import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Eye } from "lucide-react";
import { GENDERS } from "@/utils/constants/Client/constants";
import DateConverterComponent from "@/utils/DateConverter";
import { useAuth } from "@/providers/AuthProvider";
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
  const { user } = useAuth();
  const request = useRequest();
  const queryClient = useQueryClient();

  const handleView = () => navigate(`/client-view/${client.id}`);

  const handleAnamneseLinkCopy = () => {
    if (!user.uuid || !client.uuid) {
      toast.error("Erro ao copiar link!");
      return;
    }
    navigator.clipboard.writeText(
      `${import.meta.env.VITE_FRONTEND_URL}/anamnese?token=${
        user.uuid
      }&client=${client.uuid}`
    );
    toast.success("Link copiado!");
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
    <Card className="bg-gray-100 text-gray-100 rounded-2xl shadow-md">
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

      <CardFooter className="flex flex-col justify-end gap-3 pt-2">
        <Button
          onClick={handleView}
          variant="default"
          size="sm"
          className="w-full bg-blue-500 text-white hover:text-white focus:text-white transition"
        >
          <Eye className="w-5 h-5" />
          <span>Visualizar</span>
        </Button>

        <Button
          onClick={handleAnamneseLinkCopy}
          variant="default"
          size="sm"
          className="w-full bg-green-600 text-white hover:text-white focus:text-white transition"
        >
          <Copy className="w-5 h-5" />
          <span>Anamnese</span>
        </Button>

        <ClientDeleteModal onConfirm={handleClientDelete} isMobile={true} />
      </CardFooter>
    </Card>
  );
}
