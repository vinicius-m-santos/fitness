import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import EvolutionTab from "@/components/ClientView/EvolutionTab";
import MeasurementsTab from "@/components/ClientView/MeasurementsTab";
import GalleryTab from "@/components/ClientView/GalleryTab";
import AnamneseTab from "@/components/ClientView/AnamneseTab";
import WorkoutsTab from "@/components/ClientView/WorkoutsTab";
import { useParams, useLocation } from "react-router-dom";
import type { TrainingDraft } from "@/types/trainingDraft";
import ClientUpdateModal from "@/components/ClientView/Client/ClientUpdateModal";
import { OBJECTIVES } from "@/utils/constants/Client/constants";
import { useRequest } from "@/api/request";
import Loader from "@/components/ui/loader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EditableAvatar from "@/components/ui/EditableAvatar";
import ContactButtonDropdown from "@/components/ClientView/Client/ContactButtonDropdown";
import { calculateAgeFromBirthDate } from "@/utils/dateUtils";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import { useMediaQuery } from "react-responsive";

export default function ClientView() {
  // const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState("evolucao");
  const { id } = useParams();
  const location = useLocation();
  const locationState = location.state as { restoreTrainingDraft?: TrainingDraft } | null;
  const restoreDraft = locationState?.restoreTrainingDraft;
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    if (
      restoreDraft &&
      (restoreDraft.type === "training-create" || restoreDraft.type === "training-update") &&
      restoreDraft.clientId === Number(id)
    ) {
      setTab("treinos");
    }
  }, [restoreDraft, id]);

  const request = useRequest();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const getClientNameFormatted = (name: string, lastName: string): string => {
    if (name) {
      name = name.slice(0, 1).toUpperCase() + name.slice(1);
    }

    if (lastName) {
      lastName = lastName.slice(0, 1).toUpperCase() + lastName.slice(1);
    }

    return `${name} ${lastName}`;
  };

  const {
    data: client,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const res = await request({ method: "GET", url: `/client/${id}` });
      return res;
    },
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

  const handleClientUpdate = (data: any, setOpen: (value: boolean) => void) => {
    updateClientMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Dados atualizados!");
        setOpen(false);
      },
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <Loader loading={isLoading} />
      <Card className="p-6 flex flex-col sm:flex-row items-center gap-6">
        {!client && (
          <div className="h-24 w-24 rounded-full bg-gray-300 animate-pulse" />
        )}
        {client && <EditableAvatar variant="client" data={client} />}
        <div className="flex-1 space-y-2">
          <h2 className={`text-2xl font-semibold ${isMobile ? "text-center" : ""}`}>
            {getClientNameFormatted(client?.name, client?.lastName)}
          </h2>
          <p className={`text-sm text-muted-foreground ${isMobile ? "text-center" : ""}`}>
            {(client?.user?.age ?? calculateAgeFromBirthDate(client?.user?.birthDate))
              ? `Idade: ${client?.user?.age ?? calculateAgeFromBirthDate(client?.user?.birthDate)} anos`
              : ""}
            {(client?.user?.age ?? calculateAgeFromBirthDate(client?.user?.birthDate)) &&
              client?.objective &&
              " • "}
            {client?.objective
              ? `Objetivo: ${OBJECTIVES[client.objective]}`
              : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <ClientUpdateModal
            clientData={client}
            onSubmit={handleClientUpdate}
            isLoading={updateClientMutation.isPending}
          />
          {user?.roles.includes("ROLE_PERSONAL") && (
            <ContactButtonDropdown client={client} />
          )}
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="w-full" data-tour-id="client-view-tabs">
        <TabsList className="h-auto grid grid-cols-2 sm:grid-cols-6 mb-3 gap-2">
          <TabsTrigger
            className="cursor-pointer hover:bg-gray-200 w-full text-md md:text-sm"
            value="evolucao"
          >
            Evolução
          </TabsTrigger>
          <TabsTrigger
            className="cursor-pointer mx-1 hover:bg-gray-200 w-full text-md md:text-sm"
            value="medidas"
          >
            Medidas
          </TabsTrigger>
          <TabsTrigger
            className="cursor-pointer mx-1 hover:bg-gray-200 w-full text-md md:text-sm"
            value="treinos"
            data-tour-id="workouts-tab-trigger"
          >
            Treinos
          </TabsTrigger>
          <TabsTrigger
            className="cursor-pointer mx-1 hover:bg-gray-200 w-full text-md md:text-sm"
            value="galeria"
          >
            Galeria
          </TabsTrigger>
          <TabsTrigger
            className="cursor-pointer mx-1 hover:bg-gray-200 w-full text-md md:text-sm"
            value="anamnese"
          >
            Anamnese
          </TabsTrigger>
          {/* <TabsTrigger value="dados">Dados Pessoais</TabsTrigger> */}
        </TabsList>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <TabsContent value="evolucao">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                <EvolutionTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medidas">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                <MeasurementsTab client={client} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treinos">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                <WorkoutsTab isActive={tab === "treinos"} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="galeria">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                <GalleryTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anamnese">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                <AnamneseTab />
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="dados">
                        <Card>
                            <CardContent className="p-6 text-sm text-muted-foreground">
                                Dados cadastrais e pessoais do aluno.
                            </CardContent>
                        </Card>
                    </TabsContent> */}
        </motion.div>
      </Tabs>
    </div>
  );
}
