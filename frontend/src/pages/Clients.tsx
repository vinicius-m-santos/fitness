import { useRequest } from "@/api/request";
import { ClientList } from "@/components/Client/ClientList";
import ClientCreateModal from "@/components/Client/components/ClientCreateModal";
import { useQuery } from "@tanstack/react-query";

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 pr-20 tracking-wide">
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
