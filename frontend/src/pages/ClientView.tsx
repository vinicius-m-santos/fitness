import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Edit, MessageCircle } from "lucide-react";
import EvolutionTab from "../components/Client/components/EvolutionTab";
import MeasurementsTab from "../components/Client/components/MeasurementsTab";
import GalleryTab from "../components/Client/components/GalleryTab";
import AnamneseTab from "../components/Client/components/AnamneseTab";
import WorkoutsTab from "../components/Client/components/WorkoutsTab";

export default function ClientView() {
    const [tab, setTab] = useState("evolucao");

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
            <Card className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage
                        src="https://i.pravatar.cc/150?img=5"
                        alt="Foto do cliente"
                    />
                    <AvatarFallback>VS</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-semibold">Vinícius Santos</h2>
                    <p className="text-sm text-muted-foreground">
                        Idade: 28 anos • Objetivo: Hipertrofia • Último treino:
                        há 2 dias
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button size="sm">
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
                                {/* <EvolutionTab /> */}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="medidas">
                        <Card>
                            <CardContent className="p-6 text-sm text-muted-foreground">
                                {/* <MeasurementsTab /> */}
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
                                {/* <GalleryTab /> */}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="anamnese">
                        <Card>
                            <CardContent className="p-6 text-sm text-muted-foreground">
                                {/* <AnamneseTab /> */}
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
