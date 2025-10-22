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

type EditClientModalProps = {
    clientData: Client;
};

type EditClientForm = {
    name: string;
    age: number | null;
    height: number | null;
    weight: number | null;
    objective: number | null;
    observations: string;
};

export default function EditClientModal({ clientData }: EditClientModalProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<EditClientForm>({
        name: "",
        age: null,
        height: null,
        weight: null,
        objective: null,
        observations: "",
    });

    useEffect(() => {
        console.log(clientData);
        if (!clientData) {
            return;
        }

        console.log(clientData?.objective);

        setForm((prev) => {
            return {
                ...prev,
                name: clientData?.name,
                age: clientData?.age,
                height: clientData?.height,
                weight: clientData?.weight,
                objective: clientData?.objective,
            };
        });
    }, [clientData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (field: string, value: number | string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = () => {
        console.log("Dados atualizados:", form);
        setOpen(false);
    };

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

            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar dados do aluno</DialogTitle>
                    <DialogDescription>
                        Atualize as informações pessoais do aluno e clique em
                        “Salvar alterações”.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="name" className="text-right">
                            Nome
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="age" className="text-right">
                            Idade
                        </Label>
                        <Input
                            id="age"
                            name="age"
                            type="number"
                            value={form.age}
                            onChange={handleChange}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="height" className="text-right">
                            Altura (cm)
                        </Label>
                        <Input
                            id="height"
                            name="height"
                            value={form.height}
                            onChange={handleChange}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="weight" className="text-right">
                            Peso (kg)
                        </Label>
                        <Input
                            id="weight"
                            name="weight"
                            value={form.weight}
                            onChange={handleChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                        <Label
                            htmlFor="objetivo"
                            className="text-right text-sm font-medium"
                        >
                            Objetivo
                        </Label>
                        <div className="col-span-3">
                            <Select
                                value={String(form.objective)}
                                onValueChange={(value) =>
                                    handleSelectChange("objective", value)
                                }
                            >
                                <SelectTrigger id="objetivo">
                                    <SelectValue placeholder="Selecione um objetivo" />
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

                    <div className="grid grid-cols-4 items-start gap-2">
                        <Label
                            htmlFor="observations"
                            className="text-right mt-2"
                        >
                            Observações
                        </Label>
                        <Textarea
                            id="observations"
                            name="observations"
                            value={form.observations}
                            onChange={handleChange}
                            className="col-span-3"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={() => setOpen(false)}
                        variant="outline"
                        className="flex cursor-pointer items-center gap-2"
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="cursor-pointer text-white font-semibold rounded-lg py-2  transition-colors disabled:opacity-100"
                        onClick={handleSave}
                    >
                        Salvar alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
