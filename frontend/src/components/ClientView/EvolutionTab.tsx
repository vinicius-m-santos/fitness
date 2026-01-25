"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import { useParams } from "react-router-dom";
import ContainerLoader from "@/components/ui/containerLoader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChartNoAxesColumnIncreasing } from "lucide-react";

interface Measurement {
    id: number;
    date: string;
    weight?: number | null;
    fatPercentage?: number | null;
    leanMass?: number | null;
}

export default function EvolutionTab() {
    const { id } = useParams();
    const request = useRequest();

    const { data: measurements, isFetching } = useQuery<Measurement[]>({
        queryKey: ["measurements", id],
        queryFn: async () => {
            const res = await request({
                method: "GET",
                url: `/measurement/client/${id}`,
            });
            return Array.isArray(res) ? res : [];
        },
        enabled: !!id,
        refetchOnMount: true,
        staleTime: 5 * 60 * 1000,
    });

    const evolutionData = useMemo(() => {
        if (!measurements || measurements.length === 0) {
            return [];
        }

        const formatDate = (dateString: string) => {
            try {
                const date = new Date(dateString);
                return format(date, "dd/MM/yyyy", { locale: ptBR });
            } catch {
                return dateString;
            }
        };

        return measurements
            .sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateA - dateB;
            })
            .map((m) => ({
                date: formatDate(m.date),
                peso: m.weight ?? null,
                gordura: m.fatPercentage ?? null,
                massaMagra: m.leanMass ?? null,
            }));
    }, [measurements]);

    const pesoData = evolutionData.filter((d) => d.peso !== null);
    const gorduraData = evolutionData.filter((d) => d.gordura !== null);
    const massaMagraData = evolutionData.filter((d) => d.massaMagra !== null);

    const getYAxisDomain = (data: typeof evolutionData, key: string) => {
        const values = data
            .map((d) => d[key as keyof typeof d] as number)
            .filter((v) => v !== null && v !== undefined) as number[];
        if (values.length === 0) return [0, 100];
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.2 || 1;
        return [(Math.max(0, min - padding)).toFixed(2), (max + padding).toFixed(2)];
    };

    if (isFetching) {
        return <ContainerLoader />;
    }

    return (
        <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-black flex items-center gap-2">
            <ChartNoAxesColumnIncreasing className="h-5 w-5" />
            Evolução do Aluno
          </h3>
        </div>
            <Card>
                <CardHeader>
                    <CardTitle>Peso Corporal (kg)</CardTitle>
                </CardHeader>
                <CardContent>
                    {pesoData.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <span className="text-sm text-muted-foreground">
                                Sem dados de peso disponíveis
                            </span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={pesoData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={getYAxisDomain(pesoData, "peso")} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="peso"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Peso (kg)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Percentual de gordura */}
            <Card>
                <CardHeader>
                    <CardTitle>Percentual de Gordura (%)</CardTitle>
                </CardHeader>
                <CardContent>
                    {gorduraData.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <span className="text-sm text-muted-foreground">
                                Sem dados de percentual de gordura disponíveis
                            </span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={gorduraData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={getYAxisDomain(gorduraData, "gordura")} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="gordura"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="% Gordura"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Massa magra */}
            <Card>
                <CardHeader>
                    <CardTitle>Massa Magra (kg)</CardTitle>
                </CardHeader>
                <CardContent>
                    {massaMagraData.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <span className="text-sm text-muted-foreground">
                                Sem dados de massa magra disponíveis
                            </span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={massaMagraData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={getYAxisDomain(massaMagraData, "massaMagra")} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="massaMagra"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Massa Magra (kg)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
