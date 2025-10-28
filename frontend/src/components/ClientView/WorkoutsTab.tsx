import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Trash } from "lucide-react";
import TrainingCreateModal from "@/components/Training/Modals/TrainingCreateModal";
import TrainingUpdateModal from "@/components/Training/Modals/TrainingUpdateModal";
import TrainingDeleteModal from "@/components/Training/Modals/TrainingDeleteModal";
import { useApi } from "@/api/Api";
import { useParams } from "react-router-dom";
import { Edit } from "lucide-react";

export default function WorkoutsTab() {
  const { id } = useParams();
  const client = Number(id);
  const api = useApi();
  const [openModal, setOpenModal] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<any | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<any | null>(null);

  const handleEditWorkout = (workout: any) => {
    setEditingWorkout(workout);
    setOpenUpdateModal(true);
  };

  const loadWorkouts = async () => {
    try {
      const res = await api.get(`/training/all/${client}`);
      setWorkouts(res.data.trainings || []);
    } catch (err) {
      console.error("Erro ao carregar treinos", err);
    }
  };

  useEffect(() => {
    if (client) loadWorkouts();
  }, [client]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Treinos do Aluno
        </h3>

        <TrainingCreateModal
          openProp={openModal}
          onOpenChange={(open) => {
            setOpenModal(open);
            if (!open) loadWorkouts();
          }}
          client={client}
        />

        <Button onClick={() => setOpenModal(true)}>+ Novo treino</Button>
      </div>

      {workouts.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum treino cadastrado.
        </p>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {workouts.map((workout, wi) => (
            <AccordionItem key={wi} value={workout.name}>
              <AccordionTrigger className="text-lg text-black font-medium">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full text-left">
                  <span>{workout.name}</span>
                  <Badge variant="secondary" className="mt-1 sm:mt-0">
                    Criado em {workout.createdAt}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex justify-end">
                  <TrainingUpdateModal
                    openProp={openUpdateModal}
                    onOpenChange={(open) => {
                      setOpenUpdateModal(open);
                      if (!open) {
                        setEditingWorkout(null);
                        loadWorkouts();
                      }
                    }}
                    workout={editingWorkout}
                    client={client}
                  />
                  <div className="flex gap-x-2 text-black">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => handleEditWorkout(workout)}
                    >
                      <Edit className="h-4 w-4 mr-1 text-black" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      className="text-white flex items-center gap-1"
                      variant="destructive"
                      onClick={() => {
                        setTrainingToDelete(workout);
                        setOpenDeleteModal(true);
                      }}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Excluir
                    </Button>
                    {trainingToDelete && (
                      <TrainingDeleteModal
                        openProp={openDeleteModal}
                        trainingId={trainingToDelete.id}
                        onOpenChange={(open) => {
                          setOpenDeleteModal(open);
                          if (!open) {
                            setTrainingToDelete(null);
                            loadWorkouts();
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
                {workout.periods.map((period, pi) => (
                  <Card key={pi}>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">
                        {period.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Exercício</TableHead>
                            <TableHead>Séries</TableHead>
                            <TableHead>Reps</TableHead>
                            <TableHead>Descanso</TableHead>
                            <TableHead>Observações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {period.exercises.map((ex, ei) => (
                            <TableRow key={ei}>
                              <TableCell className="font-medium">
                                {ex.name}
                              </TableCell>
                              <TableCell>{ex.series}</TableCell>
                              <TableCell>{ex.reps}</TableCell>
                              <TableCell>{ex.rest}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {ex.notes || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
