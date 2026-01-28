import { useState, useRef } from "react";
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
import { Dumbbell, Trash, File, PlusIcon } from "lucide-react";
import TrainingCreateModal from "@/components/Training/Modals/TrainingCreateModal";
import TrainingUpdateModal from "@/components/Training/Modals/TrainingUpdateModal";
import TrainingDeleteModal from "@/components/Training/Modals/TrainingDeleteModal";
import { useParams } from "react-router-dom";
import { PdfExercise } from "../Exercise/PdfExercise";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import ContainerLoader from "../ui/containerLoader";
import { pdf } from "@react-pdf/renderer";
import ButtonLoader from "../ui/buttonLoader";
import { TrainingEditButton } from "../Training/TrainingEditButton";
import { useAuth } from "@/providers/AuthProvider";

export default function WorkoutsTab() {
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<any | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const request = useRequest();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: client } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => request({ method: "GET", url: `/client/${id}` }),
    enabled: !!id,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
  });

  const handleGeneratePdf = async (client, workout) => {
    setPdfLoading(true);

    const doc = <PdfExercise client={client} workout={workout} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workout.name || "treino"}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
    setPdfLoading(false);
  };

  const { data: workouts, isFetching } = useQuery({
    queryKey: ["trainings", id],
    queryFn: async () => {
      const res = await request({ method: "GET", url: `/training/all/${id}` });
      return res.trainings;
    },
    enabled: !!id,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
  });

  if (isFetching) {
    return <ContainerLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Treinos do Aluno
        </h3>

        {user?.roles.includes("ROLE_PERSONAL") && (
          <>
            <TrainingCreateModal
              open={openModal}
              onOpenChange={(open) => setOpenModal(open)}
              client={client?.id}
            />

            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => setOpenModal(true)}
            >
              <PlusIcon /> Novo treino
            </Button>
          </>
        )}
      </div>

      {workouts.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {user?.roles.includes("ROLE_PERSONAL") ? "Nenhum treino cadastrado para este aluno." : "Nenhum treino cadastrado para você. Peça ao personal que cadastre um novo treino."}
        </p>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {workouts.map((workout, wi) => (
            <AccordionItem key={wi} value={workout.id}>
              <AccordionTrigger className="cursor-pointer text-lg text-black font-medium">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full text-left">
                  <span>{workout.name}</span>
                  <Badge variant="secondary" className="mt-1 sm:mt-0">
                    Criado em {workout.createdAt}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex justify-end">
                  <div className="flex flex-wrap w-full md:w-auto md:flex-nowrap gap-2 text-black">
                    <Button
                      size="sm"
                      disabled={pdfLoading}
                      className="w-full flex bg-blue-500 hover:bg-blue-400 items-center gap-1 cursor-pointer"
                      onClick={() => handleGeneratePdf(client, workout)}
                    >
                      {!pdfLoading && (
                        <>
                          <File className="h-4 w-4 mr-1 text-white" /> Gerar PDF
                        </>
                      )}
                      {pdfLoading && <ButtonLoader />}
                    </Button>
                    <TrainingEditButton
                      trainingId={workout.id}
                      initialData={workout}
                    />
                    <Button
                      size="sm"
                      className="w-full text-white flex items-center gap-1 cursor-pointer"
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
                            queryClient.invalidateQueries({
                              queryKey: ["trainings"],
                            });
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
                              <TableCell>{ex.series || "-"}</TableCell>
                              <TableCell>{ex.reps || "-"}</TableCell>
                              <TableCell>{ex.rest || "-"}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {ex.obs || "-"}
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
