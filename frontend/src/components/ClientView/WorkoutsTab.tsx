import { useEffect, useRef, useState } from "react";
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
import { Dumbbell, Trash, File, PlusIcon, Send, Star } from "lucide-react";
import TrainingCreateModal from "@/components/Training/Modals/TrainingCreateModal";
import TrainingDeleteModal from "@/components/Training/Modals/TrainingDeleteModal";
import TrainingApplyModal from "@/components/Training/Modals/TrainingApplyModal";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { PdfExercise } from "../Exercise/PdfExercise";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/Api";
import { useRequest } from "@/api/request";
import ContainerLoader from "../ui/containerLoader";
import { pdf } from "@react-pdf/renderer";
import ButtonLoader from "../ui/buttonLoader";
import { TrainingEditButton } from "../Training/TrainingEditButton";
import { useAuth } from "@/providers/AuthProvider";
import type { ClientAllData } from "@/types/client";
import type { TrainingDraft } from "@/types/trainingDraft";

type WorkoutsTabProps = {
  isActive?: boolean;
};

export default function WorkoutsTab({ isActive = true }: WorkoutsTabProps) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const restoreDraft = (location.state as { restoreTrainingDraft?: TrainingDraft } | null)?.restoreTrainingDraft;
  const clientIdNum = id ? Number(id) : 0;

  const [openModal, setOpenModal] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string>("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [trainingToApply, setTrainingToApply] = useState<{ id: number; name: string } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [standardLoadingId, setStandardLoadingId] = useState<number | null>(null);
  const api = useApi();
  const request = useRequest();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const prevRestoreDraftRef = useRef(restoreDraft);

  useEffect(() => {
    if (
      isActive &&
      restoreDraft?.type === "training-create" &&
      restoreDraft.clientId === clientIdNum
    ) {
      setOpenModal(true);
    }
  }, [isActive, restoreDraft, clientIdNum]);

  useEffect(() => {
    if (prevRestoreDraftRef.current != null && restoreDraft == null) {
      setOpenModal(false);
    }
    prevRestoreDraftRef.current = restoreDraft;
  }, [restoreDraft]);

  useEffect(() => {
    if (
      isActive &&
      restoreDraft?.type === "training-update" &&
      restoreDraft.trainingId != null
    ) {
      setAccordionValue(String(restoreDraft.trainingId));
    }
  }, [isActive, restoreDraft]);

  const clearRestoreState = () => {
    navigate(`/client-view/${id}`, { replace: true, state: {} });
  };

  const handleStandardToggle = async (workout: {
    id: number;
    isStandard?: boolean;
  }) => {
    if (standardLoadingId != null) return;
    setStandardLoadingId(workout.id);
    try {
      if (workout.isStandard) {
        await request({
          method: "DELETE",
          url: `/training-standard/by-training/${workout.id}`,
          showSuccess: true,
          successMessage: "Treino padrão excluído com sucesso.",
        });
      } else {
        await request({
          method: "POST",
          url: "/training-standard/from-training",
          data: { trainingId: workout.id },
          showSuccess: true,
          successMessage: "Treino padrão criado com sucesso.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["trainings", id] });
      queryClient.invalidateQueries({ queryKey: ["training-standards"] });
    } catch {
      /* useRequest shows error toast */
    } finally {
      setStandardLoadingId(null);
    }
  };

  const { data: client } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => request({ method: "GET", url: `/client/${id}` }),
    enabled: !!id,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
  });

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleGeneratePdf = async (
    client: ClientAllData | undefined,
    workout: { name?: string; periods: unknown[] }
  ) => {
    if (!client) return;
    setPdfLoading(true);
    let personalAvatarSrc: string | undefined;
    const personalUser = client.personal?.user;
    if (personalUser?.id != null && personalUser?.avatarUrl) {
      try {
        const res = await api.get(`/user/avatar/${personalUser.id}`, {
          responseType: "blob",
        });
        personalAvatarSrc = await blobToDataUrl(res.data as Blob);
      } catch {
        personalAvatarSrc = undefined;
      }
    }
    const periods = workout.periods as Array<{ name: string; exercises: Array<{ name: string; series?: string; reps?: string; rest?: string; obs?: string }> }>;
    const doc = (
      <PdfExercise
        client={client}
        workout={{
          name: workout.name ?? "treino",
          periods: periods.map((p) => ({
            name: p.name,
            exercises: p.exercises.map((e) => ({
              name: e.name,
              series: e.series ?? "",
              reps: e.reps ?? "",
              rest: e.rest ?? "",
              obs: e.obs,
            })),
          })),
        }}
        personalAvatarSrc={personalAvatarSrc}
      />
    );
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

  const { data: workouts, isFetching, refetch: refetchWorkouts } = useQuery({
    queryKey: ["trainings", id],
    queryFn: async () => {
      const res = await request({ method: "GET", url: `/training/all/${id}` });
      return res.trainings;
    },
    enabled: !!id,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isActive && !!id) {
      refetchWorkouts();
    }
  }, [isActive, id, refetchWorkouts]);

  if (isFetching) {
    return <ContainerLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-between">
        <h3 className="text-lg md:text-xl font-semibold text-black flex items-center gap-2">
          <Dumbbell className="h-4 w-4 md:h-5 md:w-5" />
          {user?.roles.includes("ROLE_PERSONAL") ? "Treinos do Aluno" : "Meus Treinos"}
        </h3>

        {user?.roles.includes("ROLE_PERSONAL") && (
          <>
            <TrainingCreateModal
              open={openModal}
              onOpenChange={(open) => setOpenModal(open)}
              client={client?.id ?? 0}
              initialDraft={restoreDraft?.type === "training-create" ? restoreDraft : undefined}
              onRestored={clearRestoreState}
            />

            <Button
              size="sm"
              className="cursor-pointer w-full md:w-auto"
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
        <Accordion
          type="single"
          collapsible
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="space-y-3"
        >
          {workouts.map((workout: { id: number; name: string; createdAt: string; isStandard?: boolean; periods: unknown[] }) => (
            <AccordionItem key={workout.id} value={String(workout.id)}>
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
                    {user?.roles.includes("ROLE_PERSONAL") && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="w-full flex items-center gap-1 cursor-pointer"
                          onClick={() => {
                            setTrainingToApply({ id: workout.id, name: workout.name });
                            setOpenApplyModal(true);
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" /> Aplicar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full flex items-center gap-1 cursor-pointer"
                          onClick={() => handleStandardToggle(workout)}
                          disabled={standardLoadingId === workout.id}
                          title={workout.isStandard ? "Remover treino padrão" : "Criar treino padrão"}
                        >
                          {standardLoadingId === workout.id ? (
                            <ButtonLoader />
                          ) : (
                            <Star
                              className={`h-4 w-4 mr-1 ${workout.isStandard ? "fill-amber-400 text-amber-500" : ""}`}
                            />
                          )}
                          Criar treino padrão
                        </Button>
                      </>
                    )}
                    {user?.roles.includes("ROLE_PERSONAL") && (
                      <>
                        <TrainingEditButton
                          trainingId={workout.id}
                          initialData={
                            restoreDraft?.type === "training-update" && restoreDraft.trainingId === workout.id
                              ? restoreDraft.formData
                              : workout
                          }
                          clientId={clientIdNum}
                          restoreDraft={
                            restoreDraft?.type === "training-update" && restoreDraft.trainingId === workout.id
                              ? restoreDraft
                              : undefined
                          }
                          onRestored={clearRestoreState}
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
                      </>
                    )}
                  </div>
                </div>
                {(workout.periods as { name: string; exercises: unknown[] }[]).map((period, pi) => (
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
                          {(period.exercises as { name: string; series?: string; reps?: string; rest?: string; obs?: string }[]).map((ex, ei) => (
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

      <TrainingApplyModal
        open={openApplyModal}
        onOpenChange={(open) => {
          setOpenApplyModal(open);
          if (!open) setTrainingToApply(null);
        }}
        training={trainingToApply}
        excludeClientId={client?.id ?? null}
      />
    </div>
  );
}
