import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/api/Api";
import { useMediaQuery } from "react-responsive";
import { getCurrentWeekStart, getWeekOptions } from "@/utils/weekUtils";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/ui/loader";
import { Users, TrendingUp, AlertCircle, CalendarClock } from "lucide-react";
import WeekSummaryActiveStudents from "@/components/WeekSummary/WeekSummaryActiveStudents";
import WeekSummaryAttendance from "@/components/WeekSummary/WeekSummaryAttendance";
import WeekSummaryNoTraining from "@/components/WeekSummary/WeekSummaryNoTraining";
import WeekSummaryExpiring from "@/components/WeekSummary/WeekSummaryExpiring";

export type WeekSummaryView = "summary" | "active" | "attendance" | "noTraining" | "expiring";

export interface WeekSummaryData {
  activeStudentsCount: number;
  totalStudents: number;
  activeStudents: { id: number; name: string; lastName?: string }[];
  attendancePercent: number;
  attendanceHistory: { weekStart: string; weekLabel: string; percentage: number }[];
  noTrainingCount: number;
  noTrainingStudents: { id: number; name: string; lastName?: string }[];
  expiringCount: number;
  expiringTrainings: {
    trainingId: number;
    trainingName: string;
    clientId: number;
    clientName: string;
    dueDate: string;
  }[];
}

const weekOptions = getWeekOptions(24);

export default function WeekSummary() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart);
  const [view, setView] = useState<WeekSummaryView>("summary");

  const api = useApi();
  const { data: dataToUse, isLoading, isFetching, error } = useQuery<WeekSummaryData>({
    queryKey: ["week-summary", weekStart],
    queryFn: async () => {
      const res = await api.get("/week-summary", { params: { weekStart } });
      return res.data as WeekSummaryData;
    },
    staleTime: 2 * 60 * 1000,
  });

  const handleWeekChange = (value: string) => {
    setWeekStart(value);
    setView("summary");
  };

  if (view !== "summary") {
    return (
      <div className="container mx-auto px-4 py-6">
        {view === "active" && (
          <WeekSummaryActiveStudents
            data={dataToUse?.activeStudents ?? []}
            loading={isLoading || isFetching}
            onBack={() => setView("summary")}
            isMobile={isMobile}
          />
        )}
        {view === "attendance" && (
          <WeekSummaryAttendance
            history={dataToUse?.attendanceHistory ?? []}
            onBack={() => setView("summary")}
          />
        )}
        {view === "noTraining" && (
          <WeekSummaryNoTraining
            data={dataToUse?.noTrainingStudents ?? []}
            loading={isLoading || isFetching}
            onBack={() => setView("summary")}
            isMobile={isMobile}
          />
        )}
        {view === "expiring" && (
          <WeekSummaryExpiring
            data={dataToUse?.expiringTrainings ?? []}
            loading={isLoading || isFetching}
            onBack={() => setView("summary")}
            isMobile={isMobile}
          />
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 tracking-wide">
        Resumo da Semana
      </h1>

      <div className="mb-6 max-w-sm">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Semana</label>
        <Select value={weekStart} onValueChange={handleWeekChange}>
          <SelectTrigger className="w-full text-black font-medium text-sm cursor-pointer">
            <SelectValue placeholder="Selecione a semana" />
          </SelectTrigger>
          <SelectContent>
            {weekOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(isLoading || isFetching) ? (
        <div className="flex justify-center items-center h-48">
          <Loader loading />
        </div>
      ) : error ? (
        <p className="text-red-600">Erro ao carregar resumo. Tente novamente.</p>
      ) : (
        <div
          className={
            isMobile
              ? "grid grid-cols-2 sm:grid-cols-4 gap-4"
              : "grid grid-cols-2 md:grid-cols-4 gap-4"
          }
        >
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
            onClick={() => setView("active")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5" />
                Alunos ativos
              </CardTitle>
              <p className="text-sm text-muted-foreground">Treinaram nesta semana</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {dataToUse?.activeStudentsCount ?? 0} / {dataToUse?.totalStudents ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
            onClick={() => setView("attendance")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Assiduidade
              </CardTitle>
              <p className="text-sm text-muted-foreground">Média da semana</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {dataToUse?.attendancePercent ?? 0}%
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
            onClick={() => setView("noTraining")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Sem treino
              </CardTitle>
              <p className="text-sm text-muted-foreground">+7 dias sem treino</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {dataToUse?.noTrainingCount ?? 0} alunos
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
            onClick={() => setView("expiring")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Treinos a vencer
              </CardTitle>
              <p className="text-sm text-muted-foreground">Próximos 7 dias</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {dataToUse?.expiringCount ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
