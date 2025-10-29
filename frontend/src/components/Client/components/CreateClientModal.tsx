import { useState } from "react";
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
import { Plus } from "lucide-react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { OBJECTIVES } from "@/utils/constants/Client/constants";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import OutlineButton from "@/components/ui/Buttons/components/OutlineButton";
import GenderSelect from "@/components/ui/Select/GenderSelect";
import PhoneInput from "@/components/ui/Inputs/PhoneInput";
import { useRequest } from "@/api/request";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ClientFormSchema, clientFormSchema } from "@/schemas/clients";

export default function CreateClientModal() {
    const request = useRequest();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
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

    const resetForm = () => {
        setForm({
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
    };

    const handleSave = async () => {
        setLoading(true);

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

                setLoading(false);
                return;
            }

            setLoading(false);
            return;
        }

        const res = await request({
            method: "POST",
            url: "/client/clientByPersonal",
            data: form,
            successMessage: "Aluno cadastrado",
            showSuccess: true,
            onAccept: () => {
                setLoading(false);

                queryClient.invalidateQueries({ queryKey: ["clients"] });
                setOpen(false);
                resetForm();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    className="flex cursor-pointer items-center gap-2"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Aluno
                </Button>
            </DialogTrigger>

            <DialogContent className="rounded-md w-[90vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] max-h-[85vh] overflow-y-auto sm:overflow-y-hidden">
                <DialogHeader>
                    <DialogTitle>Inserir dados do aluno</DialogTitle>
                    <DialogDescription>
                        Insira as informações pessoais do aluno e clique em
                        "Salvar".
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
                            required
                            value={form.name}
                            onChange={handleChange}
                            className="sm:col-span-3"
                        />
                    </div>

                    {/** Sobrenome */}
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
                            className="sm:col-span-3"
                        />
                    </div>

                    {/** Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                        <Label htmlFor="email" className="sm:text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="sm:col-span-3"
                        />
                    </div>

                    {/** WhatsApp */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                        <Label htmlFor="phone" className="sm:text-right">
                            WhatsApp
                        </Label>
                        <div className="sm:col-span-3">
                            <PhoneInput
                                value={form.phone}
                                label="phone"
                                onChange={handleChangeWithField}
                            />
                        </div>
                    </div>

                    {/** Gênero */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                        <GenderSelect
                            value={form.gender}
                            handleChange={handleChangeWithField}
                        />
                    </div>

                    {/** Idade */}
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
                            className="sm:col-span-3"
                        />
                    </div>

                    {/** Altura */}
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
                            className="sm:col-span-3"
                        />
                    </div>

                    {/** Peso */}
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
                            className="sm:col-span-3"
                        />
                    </div>

                    {/** Objetivo */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                        <Label
                            htmlFor="objective"
                            className="sm:text-right text-sm font-medium"
                        >
                            Objetivo
                        </Label>
                        <div className="sm:col-span-3">
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
                                    {Object.entries(OBJECTIVES).map(
                                        ([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2">
                        <Label
                            htmlFor="observation"
                            className="sm:text-right mt-2"
                        >
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

                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
                    <OutlineButton onClick={() => setOpen(false)} />
                    <SaveButton loading={loading} onClick={handleSave} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
