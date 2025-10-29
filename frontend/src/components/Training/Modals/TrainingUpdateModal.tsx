import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { useApi } from "../../../api/Api";
import { TrashIcon } from "lucide-react";
import { z, ZodError } from "zod";

type TrainingUpdateModalProps = {
  openProp: boolean;
  onOpenChange: (open: boolean) => void;
  workout: any;
  onUpdated?: () => void;
};

const TrainingUpdateModal = ({
  openProp,
  onOpenChange,
  workout,
  onUpdated,
}: TrainingUpdateModalProps) => {
  const api = useApi();
  const [step, setStep] = useState(1);
  const [trainingName, setTrainingName] = useState("");
  const [periods, setPeriods] = useState<any[]>([]);
  const [newPeriod, setNewPeriod] = useState("");
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<{
    [key: number]: string;
  }>({});

  const step1Schema = z.object({
    trainingName: z.string().min(1, "Digite o nome do treino."),
  });

  const step2Schema = z.object({
    periods: z
      .array(
        z.object({
          name: z
            .string()
            .min(3, "O nome do período deve ter ao menos 3 caracteres."),
          exercises: z.array(z.any()),
        })
      )
      .min(1, "Adicione pelo menos um período."),
  });

  const step3Schema = z.object({
    periods: z.array(
      z.object({
        name: z.string(),
        exercises: z
          .array(
            z.object({
              id: z.number(),
              name: z.string(),
              series: z
                .string()
                .max(10, "O campo série pode ter no máximo 10 caracteres.")
                .optional(),
              reps: z
                .string()
                .max(10, "O campo repetições pode ter no máximo 20 caracteres.")
                .optional(),
              rest: z
                .string()
                .max(10, "O campo descanso pode ter no máximo 20 caracteres.")
                .optional(),
              obs: z
                .string()
                .max(
                  255,
                  "Ultrapassado o limite de caracteres do campo observações"
                )
                .optional(),
            })
          )
          .min(1, "Cada período precisa ter pelo menos um exercício."),
      })
    ),
  });

  useEffect(() => {
    if (!openProp) return;
    const loadExercises = async () => {
      try {
        const res = await api.get("/exercise/all");
        setExercises(res.data.exercises);
      } catch (err) {
        console.error("Erro ao carregar exercícios", err);
      }
    };
    loadExercises();
  }, [openProp]);

  useEffect(() => {
    if (openProp && workout) {
      setTrainingName(workout.name || "");
      const cloned = (workout.periods || []).map((p: any) => ({
        id: p.id || Date.now() + Math.random(),
        name: p.name,
        exercises: (p.exercises || []).map((e: any) => ({
          instanceId: Date.now() + Math.random(),
          id: e.id,
          name: e.name,
          series: e.series?.toString() || "",
          reps: e.reps?.toString() || "",
          rest: e.rest || "",
          obs: e.notes || "",
        })),
      }));
      setPeriods(cloned);
      setStep(1);
    }
  }, [openProp, workout]);

  useEffect(() => {
    if (!openProp) {
      setStep(1);
      setTrainingName("");
      setPeriods([]);
      setNewPeriod("");
      setSelectedExercises({});
    }
  }, [openProp]);

  const updateExerciseField = (
    periodId: number,
    exerciseId: number,
    field: string,
    value: string
  ) => {
    setPeriods((prev) =>
      prev.map((p) =>
        p.id === periodId
          ? {
              ...p,
              exercises: p.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, [field]: value } : ex
              ),
            }
          : p
      )
    );
  };

  const removeExercise = (periodId: number, instanceId: number) => {
    setPeriods((prev) =>
      prev.map((p) =>
        p.id === periodId
          ? {
              ...p,
              exercises: p.exercises.filter(
                (ex) => ex.instanceId !== instanceId
              ),
            }
          : p
      )
    );
  };

  const addPeriod = () => {
    if (!newPeriod.trim()) return;
    setPeriods([
      ...periods,
      { id: Date.now(), name: newPeriod, exercises: [] },
    ]);
    setNewPeriod("");
  };

  const removePeriod = (periodId: number) => {
    setPeriods((prev) => prev.filter((p) => p.id !== periodId));
  };

  const handleNextStep = () => {
    try {
      if (step === 1) step1Schema.parse({ trainingName });
      if (step === 2) step2Schema.parse({ periods });
      if (step === 3) step3Schema.parse({ periods });
      setStep(step + 1);
    } catch (err) {
      if (err instanceof ZodError) toast.error(err.issues[0]?.message);
    }
  };

  const saveTraining = async () => {
    try {
      step1Schema.parse({ trainingName });
      step2Schema.parse({ periods });
      step3Schema.parse({ periods });

      await api.put(`/training/${workout.id}`, { name: trainingName, periods });
      toast.success("Treino atualizado com sucesso!");
      onOpenChange(false);
      if (onUpdated) onUpdated();
    } catch (err) {
      if (err instanceof ZodError)
        toast.error(err.issues[0]?.message || "Erro de validação");
      else {
        console.error("Erro ao atualizar treino", err);
        toast.error("Erro ao atualizar treino");
      }
    }
  };

  return (
    <Dialog open={openProp} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar treino</DialogTitle>
        </DialogHeader>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              placeholder="Nome do treino"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
            />
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do período (ex: Treino A)"
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
              />
              <Button className="cursor-pointer" onClick={addPeriod}>
                Adicionar
              </Button>
            </div>
            <ul className="text-sm space-y-1">
              {periods.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between items-center border p-2 rounded-md"
                >
                  <span>{p.name}</span>
                  <button
                    onClick={() => removePeriod(p.id)}
                    className="text-red-500 font-bold px-2"
                  >
                    <TrashIcon className="w-4 h-4 cursor-pointer" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Accordion type="single" className="space-y-2">
            {periods.map((period) => (
              <AccordionItem key={period.id} value={period.id.toString()}>
                <AccordionTrigger>{period.name}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex gap-2 items-center mb-2">
                    <Select
                      value={selectedExercises[period.id] || ""}
                      onValueChange={(val) =>
                        setSelectedExercises((prev) => ({
                          ...prev,
                          [period.id]: val,
                        }))
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Escolher exercício" />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises.map((ex) => (
                          <SelectItem key={ex.id} value={ex.id.toString()}>
                            {ex.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      className="cursor-pointer"
                      onClick={() => {
                        const exerciseId = selectedExercises[period.id];
                        if (!exerciseId) return;
                        const exercise = exercises.find(
                          (e) => e.id.toString() === exerciseId
                        );
                        if (!exercise) return;

                        setPeriods((prev) =>
                          prev.map((p) =>
                            p.id === period.id
                              ? {
                                  ...p,
                                  exercises: [
                                    ...p.exercises,
                                    {
                                      instanceId: Date.now() + Math.random(),
                                      id: exercise.id,
                                      name: exercise.name,
                                      series: "",
                                      reps: "",
                                      rest: "",
                                      obs: "",
                                    },
                                  ],
                                }
                              : p
                          )
                        );
                        setSelectedExercises((prev) => ({
                          ...prev,
                          [period.id]: "",
                        }));
                      }}
                    >
                      Adicionar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {period.exercises.map((ex) => (
                      <div
                        key={ex.instanceId}
                        className="flex items-center gap-2 text-sm border rounded-md p-2"
                      >
                        <span className="w-40">{ex.name}</span>
                        <Input
                          className="w-20"
                          placeholder="Séries"
                          value={ex.series}
                          onChange={(e) =>
                            updateExerciseField(
                              period.id,
                              ex.id,
                              "series",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          className="w-20"
                          placeholder="Reps"
                          value={ex.reps}
                          onChange={(e) =>
                            updateExerciseField(
                              period.id,
                              ex.id,
                              "reps",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          className="w-24"
                          placeholder="Descanso (s)"
                          value={ex.rest}
                          onChange={(e) =>
                            updateExerciseField(
                              period.id,
                              ex.id,
                              "rest",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          className="w-32"
                          placeholder="Obs."
                          value={ex.obs}
                          onChange={(e) =>
                            updateExerciseField(
                              period.id,
                              ex.id,
                              "obs",
                              e.target.value
                            )
                          }
                        />
                        <button
                          onClick={() =>
                            removeExercise(period.id, ex.instanceId)
                          }
                          className="text-red-500 font-bold px-2 cursor-pointer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setStep(step - 1)}
            >
              Voltar
            </Button>
          )}
          {step < 3 && (
            <Button className="cursor-pointer" onClick={handleNextStep}>
              Próximo
            </Button>
          )}
          {step === 3 && (
            <Button className="cursor-pointer" onClick={saveTraining}>
              Salvar alterações
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingUpdateModal;
