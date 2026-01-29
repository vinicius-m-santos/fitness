"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Calendar, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import { Link } from "react-router-dom";
import Loader from "@/components/ui/loader";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatLastDone(lastFinishedAt: string | null | undefined): string {
  if (!lastFinishedAt) return "Nunca realizado";
  try {
    const date = new Date(lastFinishedAt);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch {
    return "Nunca realizado";
  }
}

export default function StudentWorkouts() {
  const request = useRequest();

  const { data: context, isFetching } = useQuery({
    queryKey: ["student-context"],
    queryFn: async () => {
      const res = await request({ method: "GET", url: "/training/student-context" });
      return res;
    },
    refetchOnMount: true,
    staleTime: 60 * 1000,
  });

  const lastTraining = context?.lastTraining ?? null;
  const periods = lastTraining?.periods ?? [];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Loader loading={isFetching} />
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Meus treinos
          </CardTitle>
          <CardDescription>
            Períodos do seu último treino
          </CardDescription>
        </CardHeader>
      </Card>

      {!lastTraining || periods.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
          <p className="font-medium text-base">Nenhum treino cadastrado.</p>
          <p className="text-sm mt-1">Peça ao seu personal que cadastre um treino.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {periods.map((period: { id: number; name: string; exercises: unknown[] }, index: number) => (
            <motion.div
              key={period.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
            >
              <Card className="rounded-2xl shadow-sm h-full">
                <CardContent className="p-4 flex flex-col h-full justify-between gap-4">
                  <div className="space-y-2">
                    <p className="font-medium text-base">{period.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 shrink-0" />
                      Última vez: {formatLastDone(lastTraining.lastFinishedAt)}
                    </div>
                  </div>

                  <Button asChild className="w-full gap-2">
                    <Link to={`/student/training/${lastTraining.id}/period/${period.id}/execute`}>
                      <Play className="w-4 h-4" />
                      Iniciar treino
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
