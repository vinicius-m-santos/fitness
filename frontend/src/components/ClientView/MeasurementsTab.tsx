import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUp, ArrowDown, Plus } from "lucide-react";
import clsx from "clsx";
import DefaultButton from "@/components/ui/Buttons/components/DefaultButton";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";

const initialData = {
    braco: [
        { month: "Mai", value: 34 },
        { month: "Jun", value: 34.5 },
        { month: "Jul", value: 35 },
        { month: "Ago", value: 36 },
    ],
    cintura: [
        { month: "Mai", value: 82 },
        { month: "Jun", value: 81 },
        { month: "Jul", value: 80.5 },
        { month: "Ago", value: 80 },
    ],
    perna: [
        { month: "Mai", value: 54 },
        { month: "Jun", value: 55 },
        { month: "Jul", value: 56 },
        { month: "Ago", value: 56.5 },
    ],
    torax: [
        { month: "Mai", value: 98 },
        { month: "Jun", value: 99 },
        { month: "Jul", value: 100 },
        { month: "Ago", value: 101 },
    ],
};

function MeasureCard({
    title,
    data,
}: {
    title: string;
    data: { month: string; value: number }[];
}) {
    const last = data[data.length - 1].value;
    const prev = data[data.length - 2]?.value ?? last;
    const diff = (last - prev).toFixed(1);
    const up = parseFloat(diff) > 0;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-semibold">{last} cm</span>
                    <span
                        className={clsx(
                            "flex items-center text-sm",
                            up ? "text-green-600" : "text-red-500"
                        )}
                    >
                        {up ? (
                            <ArrowUp className="w-4 h-4 mr-1" />
                        ) : (
                            <ArrowDown className="w-4 h-4 mr-1" />
                        )}
                        {diff} cm
                    </span>
                </div>
                <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis dataKey="month" hide />
                            <YAxis hide />
                            <Tooltip />
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={up ? "#22c55e" : "#ef4444"}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

export default function MeasurementsTab() {
    const [data, setData] = useState(initialData);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        month: "",
        braco: "",
        cintura: "",
        perna: "",
        torax: "",
    });

    const handleAdd = () => {
        if (!form.month) return;
        const newData = { ...data };
        newData.braco.push({
            month: form.month,
            value: parseFloat(form.braco),
        });
        newData.cintura.push({
            month: form.month,
            value: parseFloat(form.cintura),
        });
        newData.perna.push({
            month: form.month,
            value: parseFloat(form.perna),
        });
        newData.torax.push({
            month: form.month,
            value: parseFloat(form.torax),
        });
        setData(newData);
        setForm({ month: "", braco: "", cintura: "", perna: "", torax: "" });
        setOpen(false);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Medidas Corporais</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <DefaultButton>
                            <Plus className="w-4 h-4 mr-2" /> Adicionar medida
                        </DefaultButton>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Adicionar nova medição</DialogTitle>
                            <DialogDescription>
                                Registre as medidas mais recentes do aluno.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-2">
                            <div className="grid grid-cols-4 items-center gap-2">
                                <Label htmlFor="month" className="col-span-1">
                                    Mês
                                </Label>
                                <Input
                                    id="month"
                                    className="col-span-3"
                                    value={form.month}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            month: e.target.value,
                                        })
                                    }
                                    placeholder="Ex: Set"
                                />
                            </div>
                            {["braco", "cintura", "perna", "torax"].map((f) => (
                                <div
                                    key={f}
                                    className="grid grid-cols-4 items-center gap-2"
                                >
                                    <Label htmlFor={f} className="capitalize">
                                        {f}
                                    </Label>
                                    <Input
                                        id={f}
                                        type="number"
                                        className="col-span-3"
                                        value={(form as any)[f]}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                [f]: e.target.value,
                                            })
                                        }
                                        placeholder="cm"
                                    />
                                </div>
                            ))}
                        </div>

                        <DialogFooter>
                            <SaveButton text="Salvar" onClick={handleAdd} />
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Cards de medidas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MeasureCard title="Braço" data={data.braco} />
                <MeasureCard title="Cintura" data={data.cintura} />
                <MeasureCard title="Perna" data={data.perna} />
                <MeasureCard title="Tórax" data={data.torax} />
            </div>

            {/* Histórico detalhado */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Medidas</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm border-t">
                        <thead>
                            <tr className="text-left text-muted-foreground">
                                <th className="py-2">Mês</th>
                                <th>Braço (cm)</th>
                                <th>Cintura (cm)</th>
                                <th>Perna (cm)</th>
                                <th>Tórax (cm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.braco.map((_, i) => (
                                <tr key={i} className="border-t">
                                    <td className="py-2">
                                        {data.braco[i].month}
                                    </td>
                                    <td>{data.braco[i].value}</td>
                                    <td>{data.cintura[i].value}</td>
                                    <td>{data.perna[i].value}</td>
                                    <td>{data.torax[i].value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
