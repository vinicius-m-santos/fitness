import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import EvolutionTab from "@/components/Client/components/EvolutionTab";
import MeasurementsTab from "@/components/Client/components/MeasurementsTab";
import GalleryTab from "@/components/Client/components/GalleryTab";
import AnamneseTab from "@/components/Client/components/AnamneseTab";
import WorkoutsTab from "@/components/Client/components/WorkoutsTab";
import { useLocation } from "react-router-dom";
import EditClientModal from "@/components/Client/components/EditClientModal";
import { OBJECTIVES } from "@/utils/constants/Client/constants";

export default function ClientView() {
    const [tab, setTab] = useState("evolucao");
    const [client, setClient] = useState(null);
    const location = useLocation();

    const getClientNameFormatted = (name: string, lastName: string): string => {
        if (name) {
            name = name.slice(0, 1).toUpperCase() + name.slice(1);
        }

        if (lastName) {
            lastName = lastName.slice(0, 1).toUpperCase() + lastName.slice(1);
        }

        return `${name} ${lastName}`;
    };

    useEffect(() => {
        if (!location.state.client) {
            return;
        }
        console.log(location.state.client);

        setClient(location.state.client);
    }, [location.state]);

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
            <Card className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
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
                </Avatar>
                <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-semibold">
                        {getClientNameFormatted(client?.name, client?.lastName)}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Idade: {client?.age} anos • Objetivo:{" "}
                        {client ? OBJECTIVES[client.objective] : ""}
                    </p>
                </div>
                <div className="flex gap-2">
                    <EditClientModal clientData={client} />
                    <Button className="cursor-pointer" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" /> Contatar
                    </Button>
                </div>
            </Card>

            {/* --- Tabs principais --- */}
            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-6">
                    <TabsTrigger value="evolucao">Evolução</TabsTrigger>
                    <TabsTrigger value="medidas">Medidas</TabsTrigger>
                    <TabsTrigger value="treinos">Treinos</TabsTrigger>
                    <TabsTrigger value="galeria">Galeria</TabsTrigger>
                    <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
                    <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
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
                                <MeasurementsTab />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="treinos">
                        <Card>
                            <CardContent className="p-6 text-sm text-muted-foreground">
                                <WorkoutsTab />
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

                    <TabsContent value="dados">
                        <Card>
                            <CardContent className="p-6 text-sm text-muted-foreground">
                                Dados cadastrais e pessoais do aluno.
                            </CardContent>
                        </Card>
                    </TabsContent>
                </motion.div>
            </Tabs>
        </div>
    );
}
