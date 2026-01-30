import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HistoryItem {
  weekStart: string;
  weekLabel: string;
  percentage: number;
}

interface Props {
  history: HistoryItem[];
  onBack: () => void;
}

export default function WeekSummaryAttendance({ history, onBack }: Props) {
  const chartData = history.map((h) => ({
    name: h.weekLabel,
    assiduidade: h.percentage,
  }));

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        ← Voltar
      </button>
      <h2 className="text-xl font-semibold text-gray-900">Histórico de assiduidade (últimos 6 meses)</h2>
      <Card>
        <CardHeader>
          <CardTitle>Assiduidade por semana (%)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-muted-foreground">
              Sem dados de assiduidade
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`${value}%`, "Assiduidade"]} />
                <Bar dataKey="assiduidade" fill="var(--color-chart-1)" name="Assiduidade (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
