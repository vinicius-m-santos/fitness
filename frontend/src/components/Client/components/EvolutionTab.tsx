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

const evolutionData = [
    { month: "Jan", peso: 78, gordura: 18, massaMagra: 64 },
    { month: "Fev", peso: 79, gordura: 17.5, massaMagra: 65 },
    { month: "Mar", peso: 80, gordura: 17, massaMagra: 66 },
    { month: "Abr", peso: 82, gordura: 16.8, massaMagra: 68 },
    { month: "Mai", peso: 83, gordura: 16.5, massaMagra: 69 },
    { month: "Jun", peso: 84, gordura: 16, massaMagra: 70 },
];

export default function EvolutionTab() {
    return (
        <div className="space-y-6">
            {/* Peso corporal */}
            <Card>
                <CardHeader>
                    <CardTitle>Peso Corporal (kg)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={evolutionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[70, 90]} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="peso"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Percentual de gordura */}
            <Card>
                <CardHeader>
                    <CardTitle>Percentual de Gordura (%)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={evolutionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[14, 20]} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="gordura"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Massa magra */}
            <Card>
                <CardHeader>
                    <CardTitle>Massa Magra (kg)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={evolutionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[60, 75]} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="massaMagra"
                                stroke="#22c55e"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
