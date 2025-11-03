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
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import { useRequest } from "@/api/request";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMediaQuery } from "react-responsive";

type TrainingCreateModalProps = {
  openProp: boolean;
  onOpenChange: (open: boolean) => void;
  client: number;
};

const TrainingCreateModal = ({
  openProp,
  onOpenChange,
  client,
}: TrainingCreateModalProps) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const api = useApi();
  const [step, setStep] = useState(1);
  const [trainingName, setTrainingName] = useState("");
  const [periods, setPeriods] = useState<any[]>([]);
  const [newPeriod, setNewPeriod] = useState("");
  // const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<{
    [key: number]: string;
  }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const request = useRequest();
  const queryClient = useQueryClient();

  const trainingStep1Schema = z.object({
    trainingName: z
      .string()
      .min(1, "O nome do treino precisa ter pelo menos 3 caracteres")
      .max(50, "O nome do treino pode ter no máximo 50 caracteres"),
  });

  const trainingStep2Schema = z.object({
    periods: z
      .array(
        z.object({
          name: z
            .string()
            .min(3, "O nome do período precisa ter pelo menos 3 caracteres")
            .max(50, "O nome do período pode ter no máximo 50 caracteres"),
          exercises: z.array(z.any()),
        })
      )
      .min(1, "Adicione pelo menos um período"),
  });

  const trainingStep3Schema = z.object({
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
                .max(10, "O campo descanso pode ter no máximo 30 caracteres.")
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
          .min(1, "Cada período precisa ter pelo menos um exercício"),
      })
    ),
  });

  const { data: exercises, isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const res = await request({ method: "GET", url: "/exercise/all" });
      return res.exercises;
    },
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!openProp) {
      setStep(1);
      setTrainingName("");
      setPeriods([]);
      setNewPeriod("");
      setSelectedExercises({});
    }
  }, [openProp]);

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

  const addExercise = (periodId: number) => {
    const exerciseId = selectedExercises[periodId];
    if (!exerciseId) return;

    const exercise = exercises.find((e) => e.id.toString() === exerciseId);
    if (!exercise) return;

    setPeriods(
      periods.map((p) =>
        p.id === periodId
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

    setSelectedExercises((prev) => ({ ...prev, [periodId]: "" }));
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

  const updateExerciseField = (
    periodId: number,
    instanceId: number,
    field: string,
    value: string
  ) => {
    setPeriods((prev) =>
      prev.map((p) =>
        p.id === periodId
          ? {
              ...p,
              exercises: p.exercises.map((ex) =>
                ex.instanceId === instanceId ? { ...ex, [field]: value } : ex
              ),
            }
          : p
      )
    );
  };

  const handleNextStep = () => {
    try {
      if (step === 1) trainingStep1Schema.parse({ trainingName });
      if (step === 2) trainingStep2Schema.parse({ periods });
      if (step === 3) trainingStep3Schema.parse({ periods });

      setStep(step + 1);
    } catch (err) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0]?.message);
      }
    }
  };

  const saveTraining = async () => {
    try {
      setLoading(true);
      trainingStep1Schema.parse({ trainingName });
      trainingStep2Schema.parse({ periods });
      trainingStep3Schema.parse({ periods });

      await api.post("/training/create", {
        name: trainingName,
        client,
        periods,
      });

      toast.success("Treino criado com sucesso!");
      onOpenChange(false);
      setStep(1);
      setTrainingName("");
      setPeriods([]);
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
    } catch (err) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0]?.message || "Erro de validação");
      } else {
        console.error("Erro ao salvar treino", err);
        toast.error("Erro ao salvar treino");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openProp} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md w-[90vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Nome do treino"}
            {step === 2 && "Criar períodos"}
            {step === 3 && "Adicionar exercícios"}
            {step === 4 && "Revisar treino"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Aqui você pode criar um novo treino
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1 - NOME DO TREINO */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              className="text-sm font-medium"
              placeholder="Nome do treino"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
              maxLength={100}
            />
          </div>
        )}

        {/* STEP 2 - PERÍODOS */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                className="text-sm font-medium"
                placeholder="Nome do período (ex: Treino A)"
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                maxLength={100}
              />
              <Button size="sm" className="cursor-pointer" onClick={addPeriod}>
                Adicionar
              </Button>
            </div>
            <ul className="text-sm space-y-1">
              {periods.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between items-center border p-2 rounded-md"
                >
                  <span className="text-sm font-medium">{p.name}</span>
                  <button
                    onClick={() => removePeriod(p.id)}
                    className="text-red-500 font-bold px-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* STEP 3 - EXERCÍCIOS */}
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
                      <SelectTrigger className="w-[200px] text-sm font-medium">
                        <SelectValue placeholder="Escolher exercício" />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises.map((ex) => (
                          <SelectItem
                            key={ex.id}
                            value={ex.id.toString()}
                            className="text-sm font-medium"
                          >
                            {ex.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={() => addExercise(period.id)}>
                      Adicionar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {period.exercises.map((ex) => (
                      <div
                        key={ex.instanceId}
                        className="flex flex-wrap items-center gap-2 text-sm border rounded-md p-2"
                      >
                        <span className="w-40 text-sm font-medium">
                          {ex.name}
                        </span>
                        {isMobile && (
                          <div className="w-full flex justify-between">
                            <Input
                              className="w-full md:w-20 text-sm font-medium"
                              placeholder="Séries"
                              value={ex.series}
                              maxLength={10}
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
                              className="w-full md:w-20 text-sm font-medium"
                              placeholder="Reps"
                              value={ex.reps}
                              maxLength={20}
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
                              className="w-full md:w-24 text-sm font-medium"
                              placeholder="Descanso (s)"
                              value={ex.rest}
                              maxLength={30}
                              onChange={(e) =>
                                updateExerciseField(
                                  period.id,
                                  ex.id,
                                  "rest",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        )}
                        {!isMobile && (
                          <>
                            <Input
                              className="w-full md:w-20 text-sm font-medium"
                              placeholder="Séries"
                              value={ex.series}
                              maxLength={10}
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
                              className="w-full md:w-20 text-sm font-medium"
                              placeholder="Reps"
                              value={ex.reps}
                              maxLength={20}
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
                              className="w-full md:w-24 text-sm font-medium"
                              placeholder="Descanso (s)"
                              value={ex.rest}
                              maxLength={30}
                              onChange={(e) =>
                                updateExerciseField(
                                  period.id,
                                  ex.id,
                                  "rest",
                                  e.target.value
                                )
                              }
                            />
                          </>
                        )}
                        <Input
                          className="w-full md:w-32 text-sm font-medium"
                          placeholder="Obs."
                          value={ex.obs}
                          maxLength={255}
                          onChange={(e) =>
                            updateExerciseField(
                              period.id,
                              ex.id,
                              "obs",
                              e.target.value
                            )
                          }
                        />
                        {isMobile && (
                          <Button
                            className="w-full"
                            onClick={() =>
                              removeExercise(period.id, ex.instanceId)
                            }
                            variant="destructive"
                          >
                            <TrashIcon className="w-4 h-4 text-white" />
                          </Button>
                        )}
                        {!isMobile && (
                          <button
                            onClick={() =>
                              removeExercise(period.id, ex.instanceId)
                            }
                            className="text-red-500 font-bold px-2 cursor-pointer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* STEP 4 - REVISÃO */}
        {step === 4 && (
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-lg mb-3">{trainingName}</h3>
            {periods.map((p) => (
              <div key={p.id} className="border p-3 rounded-md">
                <h3 className="font-semibold mb-2">{p.name}</h3>
                <ul className="space-y-1">
                  {p.exercises.map((e) => (
                    <li key={e.id} className="flex justify-between">
                      <span>{e.name}</span>
                      <span>
                        {e.series || "--"}x{e.reps || "--"} reps /{" "}
                        {e.rest || "--"} descanso / {e.obs || ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setStep(step - 1)}
            >
              Voltar
            </Button>
          )}
          {step < 4 && (
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={handleNextStep}
            >
              Próximo
            </Button>
          )}
          {step === 4 && (
            <SaveButton size="sm" loading={loading} onClick={saveTraining} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingCreateModal;
