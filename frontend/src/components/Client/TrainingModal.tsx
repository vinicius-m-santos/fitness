import { useState } from "react";
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

export default function TrainingModal({ open, onOpenChange }) {
    const [step, setStep] = useState(1);
    const [periods, setPeriods] = useState([]);
    const [newPeriod, setNewPeriod] = useState("");
    const [selectedExercise, setSelectedExercise] = useState("");

    const addPeriod = () => {
        if (!newPeriod) return;
        setPeriods([
            ...periods,
            { id: Date.now(), name: newPeriod, exercises: [] },
        ]);
        setNewPeriod("");
    };

    const addExercise = (periodId) => {
        if (!selectedExercise) return;
        setPeriods(
            periods.map((p) =>
                p.id === periodId
                    ? {
                          ...p,
                          exercises: [
                              ...p.exercises,
                              {
                                  id: Date.now(),
                                  name: selectedExercise,
                                  reps: "",
                                  rest: "",
                              },
                          ],
                      }
                    : p
            )
        );
        setSelectedExercise("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 && "Criar períodos"}
                        {step === 2 && "Adicionar exercícios"}
                        {step === 3 && "Revisar treino"}
                    </DialogTitle>
                </DialogHeader>

                {/* STEP 1: Períodos */}
                {step === 1 && (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nome do período (ex: Treino A)"
                                value={newPeriod}
                                onChange={(e) => setNewPeriod(e.target.value)}
                            />
                            <Button onClick={addPeriod}>Adicionar</Button>
                        </div>

                        <ul className="text-sm">
                            {periods.map((p) => (
                                <li
                                    key={p.id}
                                    className="border p-2 rounded-md"
                                >
                                    {p.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* STEP 2: Exercícios */}
                {step === 2 && (
                    <Accordion type="multiple" className="space-y-2">
                        {periods.map((period) => (
                            <AccordionItem
                                key={period.id}
                                value={period.id.toString()}
                            >
                                <AccordionTrigger>
                                    {period.name}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex gap-2 items-center mb-2">
                                        <Select
                                            onValueChange={setSelectedExercise}
                                            value={selectedExercise}
                                        >
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Escolher exercício" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Supino reto">
                                                    Supino reto
                                                </SelectItem>
                                                <SelectItem value="Agachamento">
                                                    Agachamento
                                                </SelectItem>
                                                <SelectItem value="Remada curvada">
                                                    Remada curvada
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            onClick={() =>
                                                addExercise(period.id)
                                            }
                                        >
                                            Adicionar
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {period.exercises.map((ex) => (
                                            <div
                                                key={ex.id}
                                                className="grid grid-cols-6 gap-2 items-center text-sm border rounded-md p-2"
                                            >
                                                <span>{ex.name}</span>
                                                <Input placeholder="Séries" />
                                                <Input placeholder="Reps" />
                                                <Input placeholder="Carga" />
                                                <Input placeholder="Descanso (s)" />
                                                <Input placeholder="Obs." />
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}

                {/* STEP 3: Revisão */}
                {step === 3 && (
                    <div className="space-y-3 text-sm">
                        {periods.map((p) => (
                            <div key={p.id} className="border p-3 rounded-md">
                                <h3 className="font-semibold mb-2">{p.name}</h3>
                                <ul className="space-y-1">
                                    {p.exercises.map((e) => (
                                        <li
                                            key={e.id}
                                            className="flex justify-between"
                                        >
                                            <span>{e.name}</span>
                                            <span>
                                                {e.reps || "--"} reps /{" "}
                                                {e.rest || "--"}s descanso
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* NAV */}
                <div className="flex justify-between pt-4">
                    {step > 1 && (
                        <Button
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                        >
                            Voltar
                        </Button>
                    )}
                    {step < 3 && (
                        <Button onClick={() => setStep(step + 1)}>
                            Próximo
                        </Button>
                    )}
                    {step === 3 && (
                        <Button
                            onClick={() =>
                                console.log("Salvar treino", periods)
                            }
                        >
                            Salvar treino
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
