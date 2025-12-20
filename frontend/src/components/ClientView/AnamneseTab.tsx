import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import { useParams } from "react-router-dom";
import { BLOOD_PRESSURE, OBJECTIVES } from "@/utils/constants/Client/constants";
import { ClientAllData } from "@/types/client";
import { Button } from "../ui/button";
import { Edit, Stethoscope } from "lucide-react";
import AnamneseUpdateModal from "../Anamnese/Modals/AnamneseUpdateModal";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AnamneseTab() {
  const { id } = useParams();
  const request = useRequest();
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: client } = useQuery<ClientAllData>({
    queryKey: ["client", id],
    queryFn: async () => request({ method: "GET", url: `/client/${id}` }),
    enabled: !!id,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
  });

  const updateClientMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await request({
        method: "PATCH",
        url: `/client/${id}`,
        data: payload,
      });

      return res;
    },
    onSuccess: (updatedClient) => {
      queryClient.setQueryData(["client", id], updatedClient);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const handleClientUpdate = async (
    data: any,
    setOpen: (value: boolean) => void
  ) => {
    await updateClientMutation.mutateAsync(data);
    updateClientMutation.mutate(data);
    toast.success("Dados atualizados!");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Anamnese do Aluno
        </h3>

        <AnamneseUpdateModal
          open={openModal}
          onOpenChange={(open) => setOpenModal(open)}
          client={client}
          onAccept={handleClientUpdate}
        />
      </div>

      {/* Informações gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Idade:</span>
            <p className="font-medium">
              {client?.age ? `${client.age} anos` : "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Altura:</span>
            <p className="font-medium">
              {client?.height ? `${client.height} cm` : "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Peso atual:</span>
            <p className="font-medium">
              {client?.weight
                ? `${client?.weight.toString().replace(".", ",")} kg`
                : "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Objetivo principal:</span>
            <p className="font-medium">
              {client?.objective ? OBJECTIVES[client?.objective] : "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Tempo sem treino:</span>
            <p className="font-medium">
              {client?.anamnese?.timeWithoutGym
                ? client?.anamnese.timeWithoutGym
                : "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Frequência semanal:</span>
            <p className="font-medium">
              {client?.workoutDaysPerWeek
                ? `${client?.workoutDaysPerWeek}x por semana`
                : "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de saúde */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Saúde</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="text-muted-foreground">
              Doença cardíaca pré-existente:
            </span>{" "}
            {client?.anamnese?.heartProblem
              ? client?.anamnese.heartProblem
              : "-"}
          </p>
          <p>
            <span className="text-muted-foreground">
              Doenças pré-existentes:
            </span>{" "}
            Nenhuma relatada.
          </p>
          <p>
            <span className="text-muted-foreground">Lesões anteriores:</span>{" "}
            Lesão leve no ombro direito em 2023, atualmente recuperado.
          </p>
          <p>
            <span className="text-muted-foreground">Uso de medicamentos:</span>{" "}
            {client?.anamnese?.controledMedicine
              ? client?.anamnese.controledMedicine
              : "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Dores crônicas:</span>{" "}
            {client?.anamnese?.cronicalPain
              ? client?.anamnese.cronicalPain
              : "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Cirurgias recentes:</span>{" "}
            {client?.anamnese?.recentSurgery
              ? client?.anamnese.recentSurgery
              : "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Restrições médicas:</span>{" "}
            {client?.anamnese?.medicalRestriction
              ? client?.anamnese.medicalRestriction
              : "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Pressão:</span>{" "}
            {client?.bloodPressure
              ? BLOOD_PRESSURE[client?.bloodPressure]
              : "-"}
          </p>
        </CardContent>
      </Card>

      {/* Hábitos e rotina */}
      <Card>
        <CardHeader>
          <CardTitle>Hábitos e Rotina</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="text-muted-foreground">Alimentação:</span>{" "}
            {client?.anamnese?.diet ? client?.anamnese?.diet : "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Sono:</span>{" "}
            {client?.anamnese?.sleep ? client?.anamnese?.sleep : "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Atividade física:</span>{" "}
            {client?.anamnese?.physicalActivity
              ? client?.anamnese?.physicalActivity
              : "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Ocupação:</span>{" "}
            {client?.anamnese?.ocupation
              ? client?.anamnese.ocupation
                  .toString()
                  .slice(0, 1)
                  .toUpperCase() +
                client?.anamnese.ocupation.toString().slice(1)
              : "-"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="text-muted-foreground">
              Observações do personal:
            </span>{" "}
            {client?.observation?.trim().length
              ? client?.observation?.trim()
              : "-"}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {client?.tags?.map((tag) => {
              return (
                <Badge key={tag.id} variant="secondary">
                  {tag.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
