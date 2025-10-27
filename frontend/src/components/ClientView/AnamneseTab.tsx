import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnamneseTab() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Anamnese do Aluno</h3>

            {/* Informações gerais */}
            <Card>
                <CardHeader>
                    <CardTitle>Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Idade:</span>
                        <p className="font-medium">28 anos</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Altura:</span>
                        <p className="font-medium">1,78 m</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">
                            Peso atual:
                        </span>
                        <p className="font-medium">83 kg</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">
                            Objetivo principal:
                        </span>
                        <p className="font-medium">Hipertrofia muscular</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">
                            Tempo de treino:
                        </span>
                        <p className="font-medium">2 anos</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">
                            Frequência semanal:
                        </span>
                        <p className="font-medium">5x por semana</p>
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
                            Doenças pré-existentes:
                        </span>{" "}
                        Nenhuma relatada.
                    </p>
                    <p>
                        <span className="text-muted-foreground">
                            Lesões anteriores:
                        </span>{" "}
                        Lesão leve no ombro direito em 2023, atualmente
                        recuperado.
                    </p>
                    <p>
                        <span className="text-muted-foreground">
                            Uso de medicamentos:
                        </span>{" "}
                        Suplementação de creatina e whey protein.
                    </p>
                    <p>
                        <span className="text-muted-foreground">
                            Restrições médicas:
                        </span>{" "}
                        Nenhuma no momento.
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
                        <span className="text-muted-foreground">
                            Alimentação:
                        </span>{" "}
                        Segue dieta hipercalórica com acompanhamento
                        nutricional.
                    </p>
                    <p>
                        <span className="text-muted-foreground">Sono:</span>{" "}
                        Média de 7 horas por noite.
                    </p>
                    <p>
                        <span className="text-muted-foreground">
                            Atividade física:
                        </span>{" "}
                        Treino de musculação com foco em força e volume.
                    </p>
                </CardContent>
            </Card>

            {/* Objetivos e observações */}
            <Card>
                <CardHeader>
                    <CardTitle>Objetivos e Observações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p>
                        <span className="text-muted-foreground">
                            Objetivos:
                        </span>{" "}
                        Aumentar massa muscular, especialmente em peitoral e
                        pernas.
                    </p>
                    <p>
                        <span className="text-muted-foreground">
                            Observações do personal:
                        </span>{" "}
                        Boa disciplina e consistência. Pode melhorar o
                        alongamento pós-treino.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">Alta motivação</Badge>
                        <Badge variant="secondary">Comprometido</Badge>
                        <Badge variant="secondary">Boa recuperação</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
