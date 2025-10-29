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
import { Client, ClientAllData } from "@/types/client";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import { ClientAnamneseSchema, clientAnamneseSchema } from "@/schemas/clients";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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

type ClientData = {
  clientData: ClientAllData;
};

export default function Anamnese({ clientData }: ClientData) {
  const query = useQuery();
  const token = query.get("token");
  const client = query.get("client");

  const [form, setForm] = useState<ClientAnamneseSchema>({
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
      const result = validate(data, clientAnamneseSchema);
      if (!result) {
        return;
      }

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

  const formatName = (val: string) => {
    return val.length
      ? val.substring(0, 1).toUpperCase() + val.substring(1)
      : val;
  };

  const validate = (form, schema) => {
    const validation = schema.safeParse(form);
    if (validation.success) {
      return true;
    }
    const errors = validation.error.flatten().fieldErrors;

    for (const [key, value] of Object.entries(errors)) {
      console.log(key);
      const message = value.shift()?.toString().trim();

      if (!message || message.length === 0) {
        toast.error("Preencha todos os campos");
      } else {
        toast.error(message);
      }

      return false;
    }

    return false;
  };

  useEffect(() => {
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
          {clientData?.personal?.user?.firstName} irá analisar os dados e
          preparar seu treino personalizado.
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
      <form className="max-w-2xl pt-4 px-2 mx-auto">
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">
              Anamnese de {formatName(clientData?.name)}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase">
                Dados pessoais
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithLabel
                  label="Idade"
                  type="number"
                  placeholder="Idade"
                  value={form.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                />

                <div className="space-y-1">
                  <Label>Sexo</Label>
                  <Select onValueChange={(v) => handleChange("gender", v)}>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectWithLabel
                  label="Algum problema de pressão?"
                  onValueChange={(v) => handleChange("bloodPressureProblem", v)}
                  items={[
                    ["1", "Nenhum"],
                    ["2", "Hipertensão"],
                    ["3", "Hipotensão"],
                  ]}
                />
                <SelectWithLabel
                  label="Na sua ocupação, passa mais tempo sentado ou em
                                pé?"
                  onValueChange={(v) => handleChange("ocupation", v)}
                  items={[
                    ["sentado", "Sentado"],
                    ["em_pe", "Em pé"],
                  ]}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase">
                Medidas & objetivo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithLabel
                  label="Peso (kg)"
                  type="number"
                  placeholder="Peso"
                  value={form.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                />
                <InputWithLabel
                  label="Altura (cm)"
                  type="number"
                  placeholder="Altura"
                  value={form.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectWithLabel
                  label="Objetivo"
                  onValueChange={(v) => handleChange("objective", v)}
                  items={[
                    ["1", "Ganho de Massa"],
                    ["2", "Emagrecimento"],
                    ["3", "Condicionamento"],
                    ["4", "Outro"],
                  ]}
                />
                <SelectWithLabel
                  label="Treinos por semana"
                  onValueChange={(v) => handleChange("workoutDaysPerWeek", v)}
                  items={[1, 2, 3, 4, 5, 6, 7].map((n) => [String(n), n])}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase">
                Saúde & histórico
              </h3>

              <TextareaWithLabel
                label="Restrições médicas"
                placeholder="Qualquer restrição médica"
                maxLength="200"
                value={form.medicalRestriction}
                onChange={(e) =>
                  handleChange("medicalRestriction", e.target.value)
                }
              />

              <TextareaWithLabel
                label="Dor crônica"
                placeholder="Dor crônica pré-existente"
                maxLength="200"
                value={form.cronicalPain}
                onChange={(e) => handleChange("cronicalPain", e.target.value)}
              />

              <TextareaWithLabel
                label="Remédios controlados"
                placeholder="Quais remédios toma"
                maxLength="200"
                value={form.controledMedicine}
                onChange={(e) =>
                  handleChange("controledMedicine", e.target.value)
                }
              />

              <TextareaWithLabel
                label="Histórico cardíaco familiar"
                placeholder="Conte um pouco sobre seu histórico, se existir"
                maxLength="200"
                value={form.heartProblem}
                onChange={(e) => handleChange("heartProblem", e.target.value)}
              />

              <TextareaWithLabel
                label="Cirurgia recente?"
                placeholder="Descreva qual a cirurgia"
                maxLength="200"
                value={form.recentSurgery}
                onChange={(e) => handleChange("recentSurgery", e.target.value)}
              />

              <InputWithLabel
                label="Tempo sem treinar"
                placeholder="Não treina a quanto tempo?"
                maxLength="200"
                value={form.timeWithoutGym}
                onChange={(e) => handleChange("timeWithoutGym", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sticky Button */}
        <div className="sticky bottom-0 bg-gray-50 py-4 mt-4">
          <SaveButton
            loading={loading}
            onClick={handleSubmit}
            styling="w-full"
          />
        </div>
      </form>
    </div>
  );
}
