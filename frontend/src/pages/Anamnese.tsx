import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Anamnese() {
    const [form, setForm] = useState({
        name: "",
        age: "",
        gender: "",
        weight: "",
        height: "",
        objective: "",
        medicalRestriction: "",
        cronicalPain: "",
        controledMedicine: "",
        bloodPressureProblem: "",
        heartProblem: "",
        recentSurgery: "",
        timeWithoutGym: "",
        workoutDaysPerWeek: "",
        ocupation: "",
    });

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <Card className="w-full max-w-2xl shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-center">
                        Anamnese do Aluno
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input
                            placeholder="Digite o name completo"
                            value={form.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                        />
                    </div>

                    {/* Idade, Sexo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Idade</Label>
                            <Input
                                type="number"
                                placeholder="Idade"
                                value={form.age}
                                onChange={(e) =>
                                    handleChange("age", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Sexo</Label>
                            <Select
                                onValueChange={(value) =>
                                    handleChange("gender", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="masculino">
                                        Masculino
                                    </SelectItem>
                                    <SelectItem value="feminino">
                                        Feminino
                                    </SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Peso, Altura */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Peso (kg)</Label>
                            <Input
                                type="number"
                                placeholder="Ex: 75"
                                value={form.weight}
                                onChange={(e) =>
                                    handleChange("weight", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>Altura (cm)</Label>
                            <Input
                                type="number"
                                placeholder="Ex: 175"
                                value={form.height}
                                onChange={(e) =>
                                    handleChange("height", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Objetivo */}
                    <div>
                        <Label>Objetivo</Label>
                        <Textarea
                            placeholder="Ex: Ganho de massa, emagrecimento, condicionamento..."
                            value={form.objective}
                            onChange={(e) =>
                                handleChange("objective", e.target.value)
                            }
                        />
                    </div>

                    {/* Questões de saúde */}
                    <div className="space-y-3">
                        <div>
                            <Label>
                                Alguma restrição médica (se sim, qual):
                            </Label>
                            <Textarea
                                value={form.medicalRestriction}
                                onChange={(e) =>
                                    handleChange(
                                        "medicalRestriction",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>Alguma dor crônica (se sim, qual):</Label>
                            <Textarea
                                value={form.cronicalPain}
                                onChange={(e) =>
                                    handleChange("cronicalPain", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>
                                Faz uso de remédio controlado (se sim, qual):
                            </Label>
                            <Textarea
                                value={form.controledMedicine}
                                onChange={(e) =>
                                    handleChange(
                                        "controledMedicine",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>
                                Algum problema de pressão (hipo ou hiper):
                            </Label>
                            <Textarea
                                value={form.bloodPressureProblem}
                                onChange={(e) =>
                                    handleChange(
                                        "bloodPressureProblem",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>Histórico de cardiopatia na família:</Label>
                            <Textarea
                                value={form.heartProblem}
                                onChange={(e) =>
                                    handleChange("heartProblem", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>
                                Passou por alguma cirurgia recentemente (se sim,
                                qual):
                            </Label>
                            <Textarea
                                value={form.recentSurgery}
                                onChange={(e) =>
                                    handleChange(
                                        "recentSurgery",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>
                                Há quanto tempo está sem praticar ativages
                                físicas:
                            </Label>
                            <Input
                                value={form.timeWithoutGym}
                                onChange={(e) =>
                                    handleChange(
                                        "timeWithoutGym",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>
                                Quantas vezes na semana você treina ou pretende
                                treinar?
                            </Label>
                            <Input
                                value={form.workoutDaysPerWeek}
                                onChange={(e) =>
                                    handleChange(
                                        "workoutDaysPerWeek",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>
                                Na sua ocupação, passa mais tempo sentado ou em
                                pé:
                            </Label>
                            <Input
                                value={form.ocupation}
                                onChange={(e) =>
                                    handleChange("ocupation", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button className="w-full" disabled>
                            Salvar (em breve)
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
