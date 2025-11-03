import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { OBJECTIVES } from "@/utils/constants/Client/constants";
import type { Client } from "@/types/client";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import OutlineButton from "@/components/ui/Buttons/components/OutlineButton";
import GenderSelect from "@/components/ui/Select/GenderSelect";
import PhoneInput from "@/components/ui/Inputs/PhoneInput";
import toast from "react-hot-toast";
import { clientFormSchema, ClientFormSchema } from "@/schemas/clients";

type ClientUpdateModalProps = {
  clientData: Client;
  onSubmit: (data: any, setOpen: any) => void;
  isLoading: boolean;
};

export default function ClientUpdateModal({
  clientData,
  onSubmit,
  isLoading,
}: ClientUpdateModalProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [form, setForm] = useState<ClientFormSchema>({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    objective: "",
    observation: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangeWithField = (field: string, value: number | string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const validation = clientFormSchema.safeParse(form);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;

      for (const [key, value] of Object.entries(errors)) {
        const message = value.shift()?.toString().trim();

        if (!message || message.length === 0) {
          toast.error("Preencha todos os campos");
        } else {
          toast.error(message);
        }

        return;
      }

      return;
    }
    onSubmit(form, setOpen);
  };

  const formatInputParam = (val) => {
    return val ? String(val) : "";
  };

  useEffect(() => {
    if (!clientData) {
      return;
    }

    setForm((prev) => {
      return {
        ...prev,
        name: formatInputParam(clientData?.name),
        lastName: formatInputParam(clientData?.lastName),
        email: formatInputParam(clientData?.email),
        phone: formatInputParam(clientData?.phone),
        gender: formatInputParam(clientData?.gender),
        age: formatInputParam(clientData?.age),
        height: formatInputParam(clientData?.height),
        weight: formatInputParam(clientData?.weight),
        objective: formatInputParam(clientData?.objective),
        observation: formatInputParam(clientData?.observation),
      };
    });
  }, [clientData]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex cursor-pointer items-center gap-2"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-md w-[90vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar dados do aluno</DialogTitle>
          <DialogDescription>
            Atualize as informações pessoais do aluno e clique em "Salvar".
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <Label htmlFor="name" className="sm:text-right">
              Nome
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Nome"
              value={form.name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <Label htmlFor="lastName" className="sm:text-right">
              Sobrenome
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Sobrenome"
              value={form.lastName}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <Label htmlFor="email" className="sm:text-right">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              disabled={true}
              required={true}
              value={form.email}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <Label htmlFor="phone" className="sm:text-right">
              WhatsApp
            </Label>
            <PhoneInput
              value={form.phone}
              label="phone"
              onChange={handleChangeWithField}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <GenderSelect
              value={form.gender}
              handleChange={handleChangeWithField}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <Label htmlFor="age" className="sm:text-right">
              Idade
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              placeholder="Idade"
              value={form.age}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <Label htmlFor="height" className="sm:text-right">
              Altura (cm)
            </Label>
            <Input
              id="height"
              name="height"
              type="number"
              placeholder="Altura"
              value={form.height}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <Label htmlFor="weight" className="sm:text-right">
              Peso (kg)
            </Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              placeholder="Peso"
              value={form.weight}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
            <Label
              htmlFor="objetivo"
              className="sm:text-right text-sm font-medium"
            >
              Objetivo
            </Label>
            <div className="col-span-3">
              <Select
                value={form.objective}
                onValueChange={(value) =>
                  handleChangeWithField("objective", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OBJECTIVES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2">
            <Label htmlFor="observation" className="sm:text-right mt-2">
              Observações
            </Label>
            <Textarea
              id="observation"
              name="observation"
              placeholder="Observações"
              value={form.observation}
              maxLength={255}
              onChange={handleChange}
              className="sm:col-span-3"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <OutlineButton onClick={() => setOpen(false)} />
          <SaveButton loading={isLoading} onClick={handleSave} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
