import { useEffect, useState } from "react";
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
import Loader from "@/components/ui/loader";
import toast from "react-hot-toast";
import ButtonLoader from "@/components/ui/buttonLoader";
import { Link, useLocation } from "react-router-dom";
import { Client } from "@/types/client";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

type ClientData = {
    clientData?: Client;
};

function InputWithLabel({ label, ...props }) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input {...props} />
        </div>
    );
}

function TextareaWithLabel({ label, ...props }) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Textarea {...props} />
        </div>
    );
}

function SelectWithLabel({ label, onValueChange, items }) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Select onValueChange={onValueChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                    {items.map(([value, text]) => (
                        <SelectItem key={value} value={value}>
                            {text}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export default function Anamnese({ clientData }: ClientData) {
    const query = useQuery();
    const token = query.get("token");
    const client = query.get("client");

    console.log(clientData);

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
        console.log(value);
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const saveAnamnese = async (data) => {
        try {
            setLoading(true);

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/client/${token}/${client}`,
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

    useEffect(() => {
        console.log(clientData);
        if (clientData?.anamnese) {
            setSubmitted(true);
        }
    }, [clientData, clientData?.anamnese]);

    return submitted ? (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <Loader loading={loading} />

            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center animate-fade-in">
                <div className="flex justify-center mb-4">
                    <div className="bg-green-100 rounded-full p-3">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                    Anamnese enviada!
                </h1>
                <p className="text-gray-500 mb-6 leading-relaxed">
                    Seu treinador irá analisar os dados e preparar seu treino
                    personalizado.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                    Voltar para o início
                </Link>
            </div>
        </div>
    ) : (
        <div className="min-h-screen w-full bg-gray-50 pb-6">
            <form
                onSubmit={handleSubmit}
                className="max-w-2xl pt-4 px-2 mx-auto"
            >
                <Card className="shadow-sm border-none">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl font-semibold">
                            Anamnese do Aluno
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* --- DADOS PESSOAIS --- */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-700 uppercase">
                                Dados pessoais
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputWithLabel
                                    label="Nome"
                                    value={form.name}
                                    onChange={(e) =>
                                        handleChange("name", e.target.value)
                                    }
                                />
                                <InputWithLabel
                                    label="Sobrenome"
                                    value={form.lastName}
                                    onChange={(e) =>
                                        handleChange("lastName", e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputWithLabel
                                    label="Idade"
                                    type="number"
                                    value={form.age}
                                    onChange={(e) =>
                                        handleChange("age", e.target.value)
                                    }
                                />

                                <div className="space-y-1">
                                    <Label>Sexo</Label>
                                    <Select
                                        onValueChange={(v) =>
                                            handleChange("gender", v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">
                                                Masculino
                                            </SelectItem>
                                            <SelectItem value="F">
                                                Feminino
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                                <SelectWithLabel
                                    label="Na sua ocupação, passa mais tempo sentado ou em
                                pé?"
                                    onValueChange={(v) =>
                                        handleChange("ocupation", v)
                                    }
                                    items={[
                                        ["sentado", "Sentado"],
                                        ["em_pe", "Em pé"],
                                    ]}
                                />
                            </div>
                        </div>

                        {/* --- MEDIDAS E OBJETIVO --- */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-700 uppercase">
                                Medidas & objetivo
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputWithLabel
                                    label="Peso (kg)"
                                    type="number"
                                    value={form.weight}
                                    onChange={(e) =>
                                        handleChange("weight", e.target.value)
                                    }
                                />
                                <InputWithLabel
                                    label="Altura (cm)"
                                    type="number"
                                    value={form.height}
                                    onChange={(e) =>
                                        handleChange("height", e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectWithLabel
                                    label="Objetivo"
                                    onValueChange={(v) =>
                                        handleChange("objective", v)
                                    }
                                    items={[
                                        ["1", "Ganho de Massa"],
                                        ["2", "Emagrecimento"],
                                        ["3", "Condicionamento"],
                                        ["4", "Outro"],
                                    ]}
                                />
                                <SelectWithLabel
                                    label="Treinos por semana"
                                    onValueChange={(v) =>
                                        handleChange("workoutDaysPerWeek", v)
                                    }
                                    items={[1, 2, 3, 4, 5, 6, 7].map((n) => [
                                        String(n),
                                        n,
                                    ])}
                                />
                            </div>
                        </div>

                        {/* --- QUESTÕES DE SAÚDE --- */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-700 uppercase">
                                Saúde & histórico
                            </h3>

                            <TextareaWithLabel
                                label="Restrições médicas"
                                value={form.medicalRestriction}
                                onChange={(e) =>
                                    handleChange(
                                        "medicalRestriction",
                                        e.target.value
                                    )
                                }
                            />

                            <TextareaWithLabel
                                label="Dor crônica"
                                value={form.cronicalPain}
                                onChange={(e) =>
                                    handleChange("cronicalPain", e.target.value)
                                }
                            />

                            <TextareaWithLabel
                                label="Remédios controlados"
                                value={form.controledMedicine}
                                onChange={(e) =>
                                    handleChange(
                                        "controledMedicine",
                                        e.target.value
                                    )
                                }
                            />

                            <TextareaWithLabel
                                label="Histórico cardíaco familiar"
                                value={form.heartProblem}
                                onChange={(e) =>
                                    handleChange("heartProblem", e.target.value)
                                }
                            />

                            <TextareaWithLabel
                                label="Cirurgia recente?"
                                value={form.recentSurgery}
                                onChange={(e) =>
                                    handleChange(
                                        "recentSurgery",
                                        e.target.value
                                    )
                                }
                            />

                            <InputWithLabel
                                label="Tempo sem treinar"
                                value={form.timeWithoutGym}
                                onChange={(e) =>
                                    handleChange(
                                        "timeWithoutGym",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Sticky Button */}
                <div className="sticky bottom-0 bg-gray-50 py-4 mt-4">
                    <Button
                        className="w-full cursor-pointer"
                        disabled={loading}
                    >
                        {!loading && "Salvar"}
                        {loading && <ButtonLoader />}
                    </Button>
                </div>
            </form>
        </div>
    );
}
