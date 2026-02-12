import { HelpCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import HelpPersonal from "./HelpPersonal";
import HelpStudent from "./HelpStudent";

export default function Help() {
  const { user } = useAuth();
  const isPersonal = user?.roles?.includes("ROLE_PERSONAL");

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-wide flex items-center gap-2 mb-8">
        <HelpCircle className="h-7 w-7 sm:h-8 sm:w-8 text-gray-700" />
        Central de Ajuda
      </h1>
      {isPersonal ? <HelpPersonal /> : <HelpStudent />}
    </div>
  );
}
