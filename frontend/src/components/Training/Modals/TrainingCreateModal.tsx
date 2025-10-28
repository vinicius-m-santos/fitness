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

type TrainingCreateModalProps = {
  openProp: boolean;
  onOpenChange: (open: boolean) => void;
  client: number;
};

const TrainingCreateModal = ({ openProp, onOpenChange, client }: TrainingCreateModalProps) => {
  const api = useApi();
  const [step, setStep] = useState(1);
  const [trainingName, setTrainingName] = useState("");
  const [periods, setPeriods] = useState<any[]>([]);
  const [newPeriod, setNewPeriod] = useState("");
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (!openProp) return;

    const loadExercises = async () => {
      try {
        const res = await api.get("/exercise/all");
        console.log(res)
        setExercises(res.data.exercises);
      } catch (err) {
        console.error("Erro ao carregar exercícios", err);
      }
    };

    loadExercises();
  }, [openProp]);

  const addPeriod = () => {
    if (!newPeriod.trim()) return;
    setPeriods([...periods, { id: Date.now(), name: newPeriod, exercises: [] }]);
    setNewPeriod("");
  };

  const removePeriod = (periodId: number) => {
    setPeriods(prev => prev.filter(p => p.id !== periodId));
  };

  const addExercise = (periodId: number) => {
    const exerciseId = selectedExercises[periodId];
    if (!exerciseId) return;
    
    const exercise = exercises.find(e => e.id.toString() === exerciseId);
    if (!exercise) return;

    setPeriods(periods.map(p =>
      p.id === periodId
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
                obs: ""
              }
            ]
          }
        : p
    ));

    setSelectedExercises(prev => ({ ...prev, [periodId]: "" }));
  };

  const removeExercise = (periodId: number, exerciseId: number) => {
    setPeriods(prev =>
      prev.map(p =>
        p.id === periodId
          ? { ...p, exercises: p.exercises.filter(ex => ex.id !== exerciseId) }
          : p
      )
    );
  };

  const updateExerciseField = (periodId: number, exerciseId: number, field: string, value: string) => {
    setPeriods(prev =>
      prev.map(p =>
        p.id === periodId
          ? {
              ...p,
              exercises: p.exercises.map(ex =>
                ex.id === exerciseId ? { ...ex, [field]: value } : ex
              ),
            }
          : p
      )
    );
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
      const hasEmptyPeriod = periods.some(p => p.exercises.length === 0);
      if (hasEmptyPeriod) {
        toast.error("Cada período precisa ter pelo menos um exercício.");
        return;
      }
    }

    setStep(step + 1);
  };

  const saveTraining = async () => {
    try {
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
    } catch (err) {
      console.error("Erro ao salvar treino", err);
      toast.error("Erro ao salvar treino");
    }
  };

  return (
    <Dialog open={openProp} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Nome do treino"}
            {step === 2 && "Criar períodos"}
            {step === 3 && "Adicionar exercícios"}
            {step === 4 && "Revisar treino"}
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1 - NOME DO TREINO */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              placeholder="Digite o nome do treino (ex: Treino de força)"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
            />
          </div>
        )}

        {/* STEP 2 - PERÍODOS */}
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
              {periods.map(p => (
                <li key={p.id} className="flex justify-between items-center border p-2 rounded-md">
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

        {/* STEP 3 - EXERCÍCIOS */}
        {step === 3 && (
          <Accordion type="multiple" className="space-y-2">
            {periods.map(period => (
              <AccordionItem key={period.id} value={period.id.toString()}>
                <AccordionTrigger>{period.name}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex gap-2 items-center mb-2">
                    <Select
                      value={selectedExercises[period.id] || ""}
                      onValueChange={(val) =>
                        setSelectedExercises(prev => ({ ...prev, [period.id]: val }))
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Escolher exercício" />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises.map(ex => (
                          <SelectItem key={ex.id} value={ex.id.toString()}>{ex.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => addExercise(period.id,)}>Adicionar</Button>
                  </div>

                  <div className="space-y-2">
                    {period.exercises.map(ex => (
                      <div key={ex.id} className="flex items-center gap-2 text-sm border rounded-md p-2">
                        <span className="w-40">{ex.name}</span>
                        <Input className="w-20" placeholder="Séries" value={ex.series} onChange={e => updateExerciseField(period.id, ex.id, "series", e.target.value)} />
                        <Input className="w-32" placeholder="Reps" value={ex.reps} onChange={e => updateExerciseField(period.id, ex.id, "reps", e.target.value)} />
                        <Input className="w-32" placeholder="Descanso (s)" value={ex.rest} onChange={e => updateExerciseField(period.id, ex.id, "rest", e.target.value)} />
                        <Input className="w-32" placeholder="Obs." value={ex.obs} onChange={e => updateExerciseField(period.id, ex.id, "obs", e.target.value)} />
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

        {/* STEP 4 - REVISÃO */}
        {step === 4 && (
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-lg mb-3">{trainingName}</h3>
            {periods.map(p => (
              <div key={p.id} className="border p-3 rounded-md">
                <h3 className="font-semibold mb-2">{p.name}</h3>
                <ul className="space-y-1">
                  {p.exercises.map(e => (
                    <li key={e.id} className="flex justify-between">
                      <span>{e.name}</span>
                      <span>{e.series || "--"}x{e.reps || "--"} reps / {e.rest || "--"} descanso</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* NAVEGAÇÃO */}
        <div className="flex justify-between pt-4">
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Voltar</Button>}
          {step < 4 && <Button onClick={handleNextStep}>Próximo</Button>}
          {step === 4 && <Button onClick={saveTraining}>Salvar treino</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingCreateModal;
