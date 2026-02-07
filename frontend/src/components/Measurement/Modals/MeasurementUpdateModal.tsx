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
import { IMaskInput } from "react-imask";
import {
  calculatePollock3Male,
  calculatePollock3Female,
  getAgeForCalculation,
} from "@/utils/measurement/pollock3";

interface ClientForMeasurement {
  gender?: string | null;
  user?: { birthDate?: string | null } | null;
}

interface Measurement {
  id: number;
  client: { id: number };
  date: string;
  rightArm: number;
  leftArm: number;
  waist: number;
  rightLeg: number;
  leftLeg: number;
  chest: number;
  weight?: number | null;
  fatPercentage?: number | null;
  fatMass?: number | null;
  leanMass?: number | null;
  pectoral?: number | null;
  abdominal?: number | null;
  thigh?: number | null;
  triceps?: number | null;
  suprailiac?: number | null;
}

interface MeasurementUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  measurementId: number;
  initialData: Measurement;
  client?: ClientForMeasurement | null;
}

export default function MeasurementUpdateModal({
  open,
  onOpenChange,
  measurementId,
  initialData,
  client,
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
    pectoral: initialData?.pectoral?.toString() || "",
    abdominal: initialData?.abdominal?.toString() || "",
    thigh: initialData?.thigh?.toString() || "",
    triceps: initialData?.triceps?.toString() || "",
    suprailiac: initialData?.suprailiac?.toString() || "",
    fatPercentage: initialData?.fatPercentage?.toString() || "",
    fatMass: initialData?.fatMass?.toString() || "",
    leanMass: initialData?.leanMass?.toString() || "",
  });

  const gender = client?.gender?.trim() || null;
  const birthDate = client?.user?.birthDate ?? null;
  const age = getAgeForCalculation(birthDate ?? undefined);
  const hasGender = !!gender;
  const hasBirthDate = !!birthDate?.trim();
  const canShowDobras = hasGender && hasBirthDate;
  const canCalculate = hasGender && hasBirthDate && age != null && age >= 0;
  const isMale = gender?.toLowerCase() === "m";

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
        pectoral: initialData.pectoral?.toString() || "",
        abdominal: initialData.abdominal?.toString() || "",
        thigh: initialData.thigh?.toString() || "",
        triceps: initialData.triceps?.toString() || "",
        suprailiac: initialData.suprailiac?.toString() || "",
        fatPercentage: initialData.fatPercentage?.toString() || "",
        fatMass: initialData.fatMass?.toString() || "",
        leanMass: initialData.leanMass?.toString() || "",
      });
    }
  }, [open, initialData]);

  useEffect(() => {
    const clearCalculated = () =>
      setForm((prev) => ({
        ...prev,
        fatPercentage: "",
        fatMass: "",
        leanMass: "",
      }));

    if (!canCalculate || !form.weight) return;
    const weight = parseFloat(form.weight);
    if (Number.isNaN(weight) || weight <= 0) return;

    if (isMale) {
      const p = parseFloat(form.pectoral) || 0;
      const a = parseFloat(form.abdominal) || 0;
      const t = parseFloat(form.thigh) || 0;
      if (p > 0 && a > 0 && t > 0) {
        const result = calculatePollock3Male(p, a, t, age!, weight);
        setForm((prev) => ({
          ...prev,
          fatPercentage: String(result.fatPercentage),
          fatMass: String(result.fatMass),
          leanMass: String(result.leanMass),
        }));
      } else {
        clearCalculated();
      }
    } else {
      const tr = parseFloat(form.triceps) || 0;
      const s = parseFloat(form.suprailiac) || 0;
      const th = parseFloat(form.thigh) || 0;
      if (tr > 0 && s > 0 && th > 0) {
        const result = calculatePollock3Female(tr, s, th, age!, weight);
        setForm((prev) => ({
          ...prev,
          fatPercentage: String(result.fatPercentage),
          fatMass: String(result.fatMass),
          leanMass: String(result.leanMass),
        }));
      } else {
        clearCalculated();
      }
    }
  }, [
    canCalculate,
    form.weight,
    form.pectoral,
    form.abdominal,
    form.thigh,
    form.triceps,
    form.suprailiac,
    isMale,
    age,
  ]);

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
      method?: string;
      pectoral?: number | null;
      abdominal?: number | null;
      thigh?: number | null;
      triceps?: number | null;
      suprailiac?: number | null;
      fatPercentage?: number | null;
      fatMass?: number | null;
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
      method: "pollock_3",
      pectoral: form.pectoral ? parseFloat(form.pectoral) : null,
      abdominal: form.abdominal ? parseFloat(form.abdominal) : null,
      thigh: form.thigh ? parseFloat(form.thigh) : null,
      triceps: form.triceps ? parseFloat(form.triceps) : null,
      suprailiac: form.suprailiac ? parseFloat(form.suprailiac) : null,
      fatPercentage: form.fatPercentage ? parseFloat(form.fatPercentage) : null,
      fatMass: form.fatMass ? parseFloat(form.fatMass) : null,
      leanMass: form.leanMass ? parseFloat(form.leanMass) : null,
    });
  };

  const baseFields = [
    { key: "rightArm", label: "Braço Direito", placeholder: "cm" },
    { key: "leftArm", label: "Braço Esquerdo", placeholder: "cm" },
    { key: "waist", label: "Cintura", placeholder: "cm" },
    { key: "rightLeg", label: "Perna Direita", placeholder: "cm" },
    { key: "leftLeg", label: "Perna Esquerda", placeholder: "cm" },
    { key: "chest", label: "Tórax", placeholder: "cm" },
    { key: "weight", label: "Peso", placeholder: "kg" },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[85vh] max-w-[calc(100vw-1rem)] flex-col gap-4 overflow-hidden rounded-2xl sm:max-w-3xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Editar medição</DialogTitle>
          <DialogDescription>Atualize as medidas do aluno.</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto py-2">
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

          {baseFields.map(({ key, label, placeholder }) => (
            <div key={key} className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="number"
                className="col-span-3"
                value={form[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: e.target.value,
                  })
                }
                placeholder={placeholder}
              />
            </div>
          ))}

          <div className="border-t pt-4 mt-2">
            <h4 className="text-sm font-medium mb-3">Dobras</h4>
            {!canShowDobras && (
              <p className="text-sm text-muted-foreground mb-3">
                Para calcular % de gordura e massa magra são necessários
                gênero e data de nascimento do aluno. A medição pode ser
                salva; atualize os dados do aluno para habilitar o cálculo.
              </p>
            )}
            {canShowDobras && (
              <>
                {isMale && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-2 mb-2">
                      <Label htmlFor="pectoral">Peitoral</Label>
                      <div className="col-span-3">
                        <IMaskInput
                          id="pectoral"
                          mask={Number}
                          scale={0}
                          min={0}
                          max={999}
                          value={form.pectoral}
                          onAccept={(_, m) =>
                            setForm((prev) => ({
                              ...prev,
                              pectoral: m?.unmaskedValue ?? "",
                            }))
                          }
                          placeholder="mm"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2 mb-2">
                      <Label htmlFor="abdominal">Abdominal</Label>
                      <div className="col-span-3">
                        <IMaskInput
                          id="abdominal"
                          mask={Number}
                          scale={0}
                          min={0}
                          max={999}
                          value={form.abdominal}
                          onAccept={(_, m) =>
                            setForm((prev) => ({
                              ...prev,
                              abdominal: m?.unmaskedValue ?? "",
                            }))
                          }
                          placeholder="mm"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2 mb-2">
                      <Label htmlFor="thigh">Coxa</Label>
                      <div className="col-span-3">
                        <IMaskInput
                          id="thigh"
                          mask={Number}
                          scale={0}
                          min={0}
                          max={999}
                          value={form.thigh}
                          onAccept={(_, m) =>
                            setForm((prev) => ({
                              ...prev,
                              thigh: m?.unmaskedValue ?? "",
                            }))
                          }
                          placeholder="mm"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}
                {!isMale && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-2 mb-2">
                      <Label htmlFor="triceps">Tríceps</Label>
                      <div className="col-span-3">
                        <IMaskInput
                          id="triceps"
                          mask={Number}
                          scale={0}
                          min={0}
                          max={999}
                          value={form.triceps}
                          onAccept={(_, m) =>
                            setForm((prev) => ({
                              ...prev,
                              triceps: m?.unmaskedValue ?? "",
                            }))
                          }
                          placeholder="mm"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2 mb-2">
                      <Label htmlFor="suprailiac">Supra-ilíaca</Label>
                      <div className="col-span-3">
                        <IMaskInput
                          id="suprailiac"
                          mask={Number}
                          scale={0}
                          min={0}
                          max={999}
                          value={form.suprailiac}
                          onAccept={(_, m) =>
                            setForm((prev) => ({
                              ...prev,
                              suprailiac: m?.unmaskedValue ?? "",
                            }))
                          }
                          placeholder="mm"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2 mb-2">
                      <Label htmlFor="thigh">Coxa</Label>
                      <div className="col-span-3">
                        <IMaskInput
                          id="thigh"
                          mask={Number}
                          scale={0}
                          min={0}
                          max={999}
                          value={form.thigh}
                          onAccept={(_, m) =>
                            setForm((prev) => ({
                              ...prev,
                              thigh: m?.unmaskedValue ?? "",
                            }))
                          }
                          placeholder="mm"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}
                {(form.fatPercentage || form.fatMass || form.leanMass) && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-2 mb-2">
                      <Label htmlFor="fatPercentage">% Gordura</Label>
                      <Input
                        id="fatPercentage"
                        type="number"
                        className="col-span-3"
                        value={form.fatPercentage}
                        readOnly
                        placeholder="%"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2 mb-2">
                      <Label htmlFor="fatMass">Massa Gorda</Label>
                      <Input
                        id="fatMass"
                        type="number"
                        className="col-span-3"
                        value={form.fatMass}
                        readOnly
                        placeholder="kg"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="leanMass">Massa Magra</Label>
                      <Input
                        id="leanMass"
                        type="number"
                        className="col-span-3"
                        value={form.leanMass}
                        readOnly
                        placeholder="kg"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
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
