import { useState } from "react";
import axios from "axios";
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
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Loader from "../components/ui/loader";
import toast from "react-hot-toast";
import ButtonLoader from "../components/ui/buttonLoader";

export default function Anamnese() {
    const [form, setForm] = useState({
        name: "",
        lastName: "",
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
    const [loading, setLoading] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const saveAnamnese = async (data) => {
        try {
            setLoading(true);

            const res = await axios.post(
                "http://127.0.0.1:8001/api/client/",
                data
            );
            if (res.data.success) {
                setSubmitted(true);
            }
        } catch (e) {
            const data = e.response.data;

            if (!data?.success) {
                toast.error(data.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        saveAnamnese(form);
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-50 to-white px-6">
                <Loader loading={loading} />
                <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                <h1 className="text-2xl font-bold mb-2 text-gray-800">
                    Anamnese enviada com sucesso! 🎉
                </h1>
                {/* <p className="text-gray-600 max-w-md">
                    Entrarei em contato em breve para confirmar o cadastro da sua
                    oficina.
                </p> */}
                {/* <Link
                    to="/"
                    className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all"
                >
                    Voltar para o início
                </Link> */}
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
        >
            <Card className="w-full max-w-2xl shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-center">
                        Anamnese do Aluno
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input
                                placeholder="Digite o nome"
                                value={form.name}
                                onChange={(e) =>
                                    handleChange("name", e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Sobrenome</Label>
                            <Input
                                placeholder="Digite o sobrenome"
                                value={form.lastName}
                                onChange={(e) =>
                                    handleChange("lastName", e.target.value)
                                }
                            />
                        </div>
                    </div>

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
                                    <SelectItem value="M">Masculino</SelectItem>
                                    <SelectItem value="F">Feminino</SelectItem>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Objetivo</Label>
                            <Select
                                onValueChange={(value) =>
                                    handleChange("objective", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">
                                        Ganho de Massa
                                    </SelectItem>
                                    <SelectItem value="2">
                                        Emagrecimento
                                    </SelectItem>
                                    <SelectItem value="3">
                                        Condicionamento
                                    </SelectItem>
                                    <SelectItem value="4">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Treinos por semana</Label>
                            <Select
                                onValueChange={(value) =>
                                    handleChange("workoutDaysPerWeek", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                                        <SelectItem
                                            key={item}
                                            value={item.toString()}
                                        >
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Label>Algum problema de pressão?</Label>
                        <Select
                            onValueChange={(value) =>
                                handleChange("bloodPressureProblem", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Nenhum</SelectItem>
                                <SelectItem value="2">Hipertensão</SelectItem>
                                <SelectItem value="3">Hipotensão</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Label>
                            Na sua ocupação, passa mais tempo sentado ou em pé?
                        </Label>
                        <Select
                            onValueChange={(value) =>
                                handleChange("ocupation", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sentado">Sentado</SelectItem>
                                <SelectItem value="em_pe">Em pé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Questões de saúde */}
                    <div className="space-y-3">
                        <div>
                            <Label>
                                Alguma restrição médica (se sim, qual)?
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
                            <Label>Alguma dor crônica (se sim, qual)?</Label>
                            <Textarea
                                value={form.cronicalPain}
                                onChange={(e) =>
                                    handleChange("cronicalPain", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label>
                                Faz uso de remédio controlado (se sim, qual)?
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
                            <Label>Histórico de cardiopatia na família?</Label>
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
                                qual)?
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
                                Há quanto tempo está sem praticar atividades
                                físicas?
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
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full cursor-pointer disabled:opacity-100"
                            disabled={loading}
                        >
                            {!loading && "Salvar"}
                            {loading && <ButtonLoader />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
