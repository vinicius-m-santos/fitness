import ClientTable from "../components/Client/ClientTable"
export default function Dashboard() {
    return (  
    <div className="min-h-screen bg-gray-100 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-600 pr-20 tracking-wide">
            Clientes
          </h1>
        </div>

          <div className="m-30">
            <ClientTable />
          </div>
        </div>
    </div>
  );;
}
