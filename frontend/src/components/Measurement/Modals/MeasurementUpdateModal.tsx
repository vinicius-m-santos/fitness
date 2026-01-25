"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Measurement {
  id: number;
  client: {
    id: number;
  };
  date: string;
  rightArm: number;
  leftArm: number;
  waist: number;
  rightLeg: number;
  leftLeg: number;
  chest: number;
  weight?: number | null;
  fatPercentage?: number | null;
  leanMass?: number | null;
}

interface MeasurementUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  measurementId: number;
  initialData: Measurement;
}

export default function MeasurementUpdateModal({
  open,
  onOpenChange,
  measurementId,
  initialData,
}: MeasurementUpdateModalProps) {
  const request = useRequest();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : new Date(),
  );
  const [form, setForm] = useState({
    rightArm: initialData?.rightArm?.toString() || "",
    leftArm: initialData?.leftArm?.toString() || "",
    waist: initialData?.waist?.toString() || "",
    rightLeg: initialData?.rightLeg?.toString() || "",
    leftLeg: initialData?.leftLeg?.toString() || "",
    chest: initialData?.chest?.toString() || "",
    weight: initialData?.weight?.toString() || "",
    fatPercentage: initialData?.fatPercentage?.toString() || "",
    leanMass: initialData?.leanMass?.toString() || "",
  });

  useEffect(() => {
    if (open && initialData) {
      setDate(initialData.date ? new Date(initialData.date) : new Date());
      setForm({
        rightArm: initialData.rightArm?.toString() || "",
        leftArm: initialData.leftArm?.toString() || "",
        waist: initialData.waist?.toString() || "",
        rightLeg: initialData.rightLeg?.toString() || "",
        leftLeg: initialData.leftLeg?.toString() || "",
        chest: initialData.chest?.toString() || "",
        weight: initialData.weight?.toString() || "",
        fatPercentage: initialData.fatPercentage?.toString() || "",
        leanMass: initialData.leanMass?.toString() || "",
      });
    }
  }, [open, initialData]);

  const updateMeasurementMutation = useMutation({
    mutationFn: async (payload: {
      date: string;
      rightArm: number;
      leftArm: number;
      waist: number;
      rightLeg: number;
      leftLeg: number;
      chest: number;
      weight?: number | null;
      fatPercentage?: number | null;
      leanMass?: number | null;
    }) => {
      const res = await request({
        method: "PUT",
        url: `/measurement/${measurementId}`,
        data: payload as never,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      toast.success("Medição atualizada com sucesso!");
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar medição";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    if (!date) {
      toast.error("Por favor, selecione a data");
      return;
    }

    if (
      !form.rightArm ||
      !form.leftArm ||
      !form.waist ||
      !form.rightLeg ||
      !form.leftLeg ||
      !form.chest
    ) {
      toast.error("Por favor, preencha todas as medidas");
      return;
    }

    updateMeasurementMutation.mutate({
      date: date.toISOString(),
      rightArm: parseFloat(form.rightArm),
      leftArm: parseFloat(form.leftArm),
      waist: parseFloat(form.waist),
      rightLeg: parseFloat(form.rightLeg),
      leftLeg: parseFloat(form.leftLeg),
      chest: parseFloat(form.chest),
      weight: form.weight ? parseFloat(form.weight) : null,
      fatPercentage: form.fatPercentage ? parseFloat(form.fatPercentage) : null,
      leanMass: form.leanMass ? parseFloat(form.leanMass) : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar medição</DialogTitle>
          <DialogDescription>Atualize as medidas do aluno.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 overflow-y-auto">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="date" className="col-span-1">
              Data
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`col-span-3 justify-start text-left font-normal ${
                    !date && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date
                    ? format(date, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {[
            { key: "rightArm", label: "Braço Direito" },
            { key: "leftArm", label: "Braço Esquerdo" },
            { key: "waist", label: "Cintura" },
            { key: "rightLeg", label: "Perna Direita" },
            { key: "leftLeg", label: "Perna Esquerda" },
            { key: "chest", label: "Tórax" },
            { key: "weight", label: "Peso" },
            { key: "fatPercentage", label: "% Gordura" },
            { key: "leanMass", label: "Massa Magra" },
          ].map(({ key, label }) => (
            <div key={key} className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="number"
                className="col-span-3"
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: e.target.value,
                  })
                }
                placeholder={
                  key === "weight" || key === "leanMass"
                    ? "kg"
                    : key === "fatPercentage"
                      ? "%"
                      : "cm"
                }
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <SaveButton
            text="Salvar"
            onClick={handleSubmit}
            loading={updateMeasurementMutation.isPending}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
