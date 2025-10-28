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

  const removeExercise = (periodId: number, exerciseId: number) => {
    setPeriods((prev) =>
      prev.map((p) =>
        p.id === periodId
          ? {
              ...p,
              exercises: p.exercises.filter((ex) => ex.id !== exerciseId),
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
    if (step === 1) {
      if (!trainingName.trim()) {
        toast.error("Digite o nome do treino.");
        return;
      }
    }

    if (step === 2) {
      if (periods.length === 0) {
        toast.error("Adicione pelo menos um período.");
        return;
      }
    }

    if (step === 3) {
      const hasEmptyPeriod = periods.some((p) => p.exercises.length === 0);
      if (hasEmptyPeriod) {
        toast.error("É necessário ter pelo menos um exercício.");
        return;
      }
    }

    setStep(step + 1);
  };

  const saveTraining = async () => {
    try {
      await api.put(`/training/${workout.id}`, {
        name: trainingName,
        periods,
      });
      toast.success("Treino atualizado com sucesso!");
      onOpenChange(false);
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error("Erro ao atualizar treino", err);
      toast.error("Erro ao atualizar treino");
    }
  };

  return (
    <Dialog open={openProp} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar treino</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <Input
              placeholder="Nome do treino"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do período (ex: Treino A)"
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
              />
              <Button onClick={addPeriod}>Adicionar</Button>
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
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 3 && (
          <Accordion type="multiple" className="space-y-2">
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

                  {/* Exercícios já adicionados */}
                  <div className="space-y-2">
                    {period.exercises.map((ex) => (
                      <div
                        key={ex.id}
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
                          onClick={() => removeExercise(period.id, ex.id)}
                          className="text-red-500 font-bold px-2"
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
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          )}
          {step < 3 && <Button onClick={handleNextStep}>Próximo</Button>}
          {step === 3 && (
            <Button onClick={saveTraining}>Salvar alterações</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingUpdateModal;
