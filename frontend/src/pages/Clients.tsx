import { useRequest } from "@/api/request";
import { ClientList } from "@/components/Client/ClientList";
import ClientCreateModal from "@/components/Client/components/ClientCreateModal";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

export default function Clients() {
  const request = useRequest();

  async function loadClients() {
    const res = await request({ method: "get", url: "/client/all" });
    return res.clients;
  }

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["clients"],
    queryFn: loadClients,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-row justify-between md:flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide flex items-center gap-2">
          <Users className="h-6 w-6 md:h-8 md:w-8" />
          Alunos
        </h1>
        <ClientCreateModal />
      </div>

      <div className="">
        <ClientList clientTableData={data} loading={isLoading || isFetching} />
      </div>
    </div>
  );
}
