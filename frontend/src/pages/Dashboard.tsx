import ClientTable from "../components/Client/ClientTable"

export default function Dashboard() {
    return (  
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 pr-20 tracking-wide">
            Clientes
          </h1>
        </div>

          <div className="">
            <ClientTable />
          </div>
        </div>
  );
}
