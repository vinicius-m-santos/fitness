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
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CalendarClock,
  Calendar,
  Minus,
  Sparkles,
  AlertTriangle,
  ChartNoAxesColumnIncreasing,
  Target,
  Timer,
  ArrowDown,
  ArrowUp,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import WeekSummaryActiveStudents from "@/components/WeekSummary/WeekSummaryActiveStudents";
import WeekSummaryAttendance from "@/components/WeekSummary/WeekSummaryAttendance";
import WeekSummaryNoTraining from "@/components/WeekSummary/WeekSummaryNoTraining";
import WeekSummaryExpiring from "@/components/WeekSummary/WeekSummaryExpiring";

export type WeekSummaryView = "summary" | "active" | "attendance" | "noTraining" | "expiring";

export interface WeekSummaryHighlights {
  attendance: { type: "up" | "down" | "same"; text: string; diff: number };
  trainings: { type: "up" | "down" | "same"; text: string; diff: number | null };
  inactivity: { count: number; text: string };
}

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
  periodDistribution?: {
    periodId: number;
    periodName: string;
    trainingName: string;
    count: number;
    relativePercent: number;
  }[];
  frequency?: {
    expectedPerWeek: number;
    realizedPerWeek: number;
    status: "within" | "below";
  };
  averageTrainingTime?: {
    minutes: number;
    diffMinutes: number;
  };
  highlights?: WeekSummaryHighlights;
}

const weekOptions = getWeekOptions(24);

function formatFrequency(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}

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
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide flex items-center gap-2 mb-6">
        <ChartNoAxesColumnIncreasing className="h-6 w-6 md:h-8 md:w-8" />
        Resumo da Semana
      </h1>

      <Card className="mb-6 rounded-xl border border-gray-200 bg-card shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecione a semana para visualizar o resumo (segunda a domingo).
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={weekStart} onValueChange={handleWeekChange}>
            <SelectTrigger className="w-full max-w-sm text-black font-medium text-sm cursor-pointer bg-background border border-input">
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
        </CardContent>
      </Card>

      {(isLoading || isFetching) ? (
        <div className="flex justify-center items-center h-48">
          <Loader loading />
        </div>
      ) : error ? (
        <p className="text-red-600">Erro ao carregar resumo. Tente novamente.</p>
      ) : (
        <>
          <div
            className={
              isMobile
                ? "grid grid-cols-2 sm:grid-cols-4 gap-4"
                : "grid grid-cols-2 md:grid-cols-4 gap-4"
            }
          >
            <Card
              className="cursor-pointer hover:shadow-md hover:border-primary/40 hover:ring-2 hover:ring-primary/20 transition-all border-gray-200 group"
              onClick={() => setView("active")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setView("active")}
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
                <p className="mt-2 text-xs text-primary/80 flex items-center gap-1 group-hover:text-primary">
                  <span>Clique para ver detalhes</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md hover:border-primary/40 hover:ring-2 hover:ring-primary/20 transition-all border-gray-200 group"
              onClick={() => setView("attendance")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setView("attendance")}
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
                <p className="mt-2 text-xs text-primary/80 flex items-center gap-1 group-hover:text-primary">
                  <span>Clique para ver detalhes</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md hover:border-primary/40 hover:ring-2 hover:ring-primary/20 transition-all border-gray-200 group"
              onClick={() => setView("noTraining")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setView("noTraining")}
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
                <p className="mt-2 text-xs text-primary/80 flex items-center gap-1 group-hover:text-primary">
                  <span>Clique para ver detalhes</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md hover:border-primary/40 hover:ring-2 hover:ring-primary/20 transition-all border-gray-200 group"
              onClick={() => setView("expiring")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setView("expiring")}
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
                <p className="mt-2 text-xs text-primary/80 flex items-center gap-1 group-hover:text-primary">
                  <span>Clique para ver detalhes</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!error && !(isLoading || isFetching) && dataToUse?.highlights && (
        <Card className="mt-4 rounded-xl border border-gray-200 bg-card shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Destaques da semana
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Comparação com a semana anterior à selecionada.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const h = dataToUse.highlights;
              const hasRelevant =
                h.attendance.type !== "same" ||
                h.trainings.type !== "same" ||
                h.inactivity.count > 0;
              if (!hasRelevant) {
                return (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Minus className="h-4 w-4 shrink-0" />
                    Nada relevante para destacar nesta semana.
                  </p>
                );
              }
              return (
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    {h.attendance.type === "up" && (
                      <TrendingUp className="h-5 w-5 shrink-0 text-green-600" />
                    )}
                    {h.attendance.type === "down" && (
                      <TrendingDown className="h-5 w-5 shrink-0 text-red-600" />
                    )}
                    {h.attendance.type === "same" && (
                      <Minus className="h-5 w-5 shrink-0 text-gray-400" />
                    )}
                    <span className="text-gray-900">{h.attendance.text}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    {h.trainings.type === "up" && (
                      <TrendingUp className="h-5 w-5 shrink-0 text-green-600" />
                    )}
                    {h.trainings.type === "down" && (
                      <TrendingDown className="h-5 w-5 shrink-0 text-red-600" />
                    )}
                    {h.trainings.type === "same" && (
                      <Minus className="h-5 w-5 shrink-0 text-gray-400" />
                    )}
                    <span className="text-gray-900">{h.trainings.text}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    {h.inactivity.count > 0 ? (
                      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                    ) : (
                      <Minus className="h-5 w-5 shrink-0 text-gray-400" />
                    )}
                    <span className="text-gray-900">{h.inactivity.text}</span>
                  </li>
                </ul>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {!error && !(isLoading || isFetching) && (dataToUse?.frequency != null || dataToUse?.averageTrainingTime != null) && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataToUse?.frequency != null && (
            <Card className="rounded-xl border border-gray-200 bg-card shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Frequência média de treino
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Esperado: {formatFrequency(dataToUse.frequency.expectedPerWeek)}x / semana
                </p>
                <p className="text-sm text-muted-foreground">
                  Realizado: {formatFrequency(dataToUse.frequency.realizedPerWeek)}x / semana
                </p>
                {dataToUse.frequency.status === "within" ? (
                  <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500" aria-hidden />{" "}
                    Dentro do esperado
                  </p>
                ) : (
                  <p className="text-sm font-medium text-amber-600 flex items-center gap-1">
                    <ArrowDown className="h-4 w-4 shrink-0" />
                    Abaixo do esperado
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          {dataToUse?.averageTrainingTime != null && (
            <Card className="rounded-xl border border-gray-200 bg-card shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Tempo médio de treino
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">{dataToUse.averageTrainingTime.minutes} min</p>
                {dataToUse.averageTrainingTime.diffMinutes !== 0 ? (
                  <p
                    className={`text-sm flex items-center gap-1 ${dataToUse.averageTrainingTime.diffMinutes > 0 ? "text-green-600" : "text-amber-600"
                      }`}
                  >
                    {dataToUse.averageTrainingTime.diffMinutes > 0 ? (
                      <ArrowUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <ArrowDown className="h-4 w-4 shrink-0" />
                    )}
                    {dataToUse.averageTrainingTime.diffMinutes > 0 ? "+" : ""}
                    {dataToUse.averageTrainingTime.diffMinutes} min em relação à semana passada
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Igual à semana passada</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!error && !(isLoading || isFetching) && dataToUse?.periodDistribution && (
        <Card className="mt-4 rounded-xl border border-gray-200 bg-card shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ChartNoAxesColumnIncreasing className="h-5 w-5" />
              Treinos mais realizados na semana
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribuição dos períodos de treino realizados (volume relativo).
            </p>
          </CardHeader>
          <CardContent>
            {dataToUse.periodDistribution.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-muted-foreground text-sm">
                Nenhum treino realizado nesta semana.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={dataToUse.periodDistribution.map((p) => ({
                    name: `${p.periodName} (${p.trainingName})`,
                    realizacoes: p.count,
                    percentual: p.relativePercent,
                  }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number, _name: string, props: { payload?: { percentual?: number } }) => [
                      `${value} realização(ões)${props.payload?.percentual != null ? ` (${props.payload.percentual}% do total)` : ""}`,
                      "Volume",
                    ]}
                    contentStyle={{ borderRadius: 8 }}
                  />
                  <Bar
                    dataKey="realizacoes"
                    fill="var(--color-chart-1)"
                    name="Realizações"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
