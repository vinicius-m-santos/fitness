import { useRequest } from "@/api/request";
import { ClientList } from "@/components/Client/ClientList";
import ClientCreateModal from "@/components/Client/components/ClientCreateModal";
import { useQuery } from "@tanstack/react-query";
import { Users, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { SubscriptionMe } from "@/types/subscription";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function Clients() {
  const request = useRequest();
  const { user } = useAuth();

  const handleCopyPersonalLink = async () => {
    const uuid = user?.uuid;
    if (!uuid) {
      toast.error("Link não disponível");
      return;
    }
    const url = `${window.location.origin}/cadastro-personal/${uuid}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  async function loadClients() {
    const res = await request({ method: "get", url: "/client/all" });
    return res.clients;
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["clients"],
    queryFn: loadClients,
    staleTime: 5 * 60 * 1000,
  });

  const { data: subscriptionData } = useQuery<SubscriptionMe>({
    queryKey: ["subscription", "me"],
    queryFn: async () => {
      const res = await request({
        method: "get",
        url: "/subscription/me",
        showError: false,
      });
      return res as SubscriptionMe;
    },
    staleTime: 2 * 60 * 1000,
  });

  const canAddStudent =
    !subscriptionData?.usage ||
    subscriptionData.usage.students_limit === null ||
    subscriptionData.usage.students_used < subscriptionData.usage.students_limit;

  const limitMessage =
    "Você atingiu o limite de alunos do seu plano. Em breve teremos planos pagos com mais vagas.";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-row justify-between md:flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide flex items-center gap-2">
          <Users className="h-6 w-6 md:h-8 md:w-8" />
          Alunos
        </h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-black"
            onClick={handleCopyPersonalLink}
            disabled={!canAddStudent}
            title={!canAddStudent ? limitMessage : undefined}
          >
            <Link2 className="h-4 w-4" />
            Link de personal
          </Button>
          <ClientCreateModal canAddStudent={canAddStudent} />
        </div>
      </div>
      {!canAddStudent && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Você atingiu o limite de alunos do seu plano. Em breve teremos planos pagos com mais vagas.{" "}
          <Link to="/plan" className="underline font-medium">
            Ver meu plano
          </Link>
        </div>
      )}

      <div className="">
        <ClientList clientTableData={data} loading={isLoading || isFetching} />
      </div>
    </div>
  );
}
