import { useMemo, useState } from "react";
import ClientFilters from "@/components/Client/ClientFilters";
import Loader from "@/components/ui/loader";
import ClientCard from "@/components/Client/components/ClientCard";

export default function ClientCards({
    clientTableData,
    loading,
}: {
    clientTableData: any[];
    loading: boolean;
}) {
    const [filters, setFilters] = useState({ search: "", order: "newest" });

    const filteredData = useMemo(() => {
        let data = clientTableData ? [...clientTableData] : [];

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            data = data.filter(
                (client) =>
                    client.name.toLowerCase().includes(searchLower) ||
                    client.lastName?.toLowerCase().includes(searchLower)
            );
        }

        switch (filters.order) {
            case "name-asc":
                data.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name-desc":
                data.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "newest":
                data.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
                break;
            case "oldest":
                data.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                );
                break;
        }

        return data;
    }, [clientTableData, filters]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40 text-gray-400">
                <Loader loading={loading} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ClientFilters onFilterChange={setFilters} />

            {filteredData.length === 0 ? (
                <div className="flex justify-center items-center h-40 text-gray-400">
                    Nenhum aluno encontrado.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.map((client) => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </div>
            )}
        </div>
    );
}
