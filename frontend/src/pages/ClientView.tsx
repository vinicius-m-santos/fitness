import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import EvolutionTab from "@/components/ClientView/EvolutionTab";
import MeasurementsTab from "@/components/ClientView/MeasurementsTab";
import GalleryTab from "@/components/ClientView/GalleryTab";
import AnamneseTab from "@/components/ClientView/AnamneseTab";
import WorkoutsTab from "@/components/ClientView/WorkoutsTab";
import { useLocation, useParams } from "react-router-dom";
import EditClientModal from "@/components/ClientView/Client/EditClientModal";
import { OBJECTIVES } from "@/utils/constants/Client/constants";
import { useRequest } from "@/api/request";
import Loader from "@/components/ui/loader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EditableAvatar from "@/components/ClientView/Client/EditableAvatar";
import ContactButtonDropdown from "@/components/ClientView/Client/ContactButtonDropdown";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ClientView() {
  // const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState("treinos");
  const { id } = useParams();
  const request = useRequest();
  const queryClient = useQueryClient();

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
        {/* <Avatar className="h-24 w-24">
                    {client?.src && (
                        <AvatarImage src={client.src} alt="Foto do cliente" />
                    )}
                    {!client?.src && (
                        <AvatarFallback>
                            {`${client?.name
                                .slice(0, 1)
                                .toUpperCase()}${client?.lastName
                                .slice(0, 1)
                                .toUpperCase()}`}
                        </AvatarFallback>
                    )}
                </Avatar> */}
        {!client && (
          <div className="h-24 w-24 rounded-full bg-gray-300 animate-pulse" />
        )}
        {client && <EditableAvatar clientData={client} />}
        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-semibold">
            {getClientNameFormatted(client?.name, client?.lastName)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {client?.age ? `Idade: ${client.age} anos •` : ""}
            {client?.objective
              ? `Objetivo: ${OBJECTIVES[client.objective]}`
              : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <EditClientModal
            clientData={client}
            onSubmit={handleClientUpdate}
            isLoading={updateClientMutation.isPending}
          />
          <ContactButtonDropdown client={client} />
        </div>
      </Card>

      {/* --- Tabs principais --- */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-6">
          {/* <TabsTrigger value="evolucao">Evolução</TabsTrigger>
                    <TabsTrigger value="medidas">Medidas</TabsTrigger> */}
          <TabsTrigger value="treinos">Treinos</TabsTrigger>
          {/* <TabsTrigger value="galeria">Galeria</TabsTrigger>
                    <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
                    <TabsTrigger value="dados">Dados Pessoais</TabsTrigger> */}
        </TabsList>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* <TabsContent value="evolucao">
                        <Card>
                            <CardContent className="p-6 text-sm text-muted-foreground">
                                <EvolutionTab />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="medidas">
                        <Card>
                            <CardContent className="p-6 text-sm text-muted-foreground">
                                <MeasurementsTab />
                            </CardContent>
                        </Card>
                    </TabsContent> */}

          <TabsContent value="treinos">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                <WorkoutsTab />
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="galeria">
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

                    <TabsContent value="dados">
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
