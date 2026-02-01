"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Play, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import { Link, useNavigate } from "react-router-dom";
import Loader from "@/components/ui/loader";
import ContinueWorkoutPrompt from "@/components/Student/ContinueWorkoutPrompt";
import TrainingHistorySection from "@/components/Student/TrainingHistorySection";
import { useActiveWorkoutCheck } from "@/hooks/useActiveWorkoutCheck";
import { clearActiveSession } from "@/lib/activeSessionDb";

function formatEstimatedDuration(exercises: unknown[]): string {
  const count = exercises?.length ?? 0;
  const minutes = Math.max(15, Math.min(120, count * 5 + 20));
  return `${minutes} minutos`;
}

export default function StudentHome() {
  const request = useRequest();
  const navigate = useNavigate();
  const [isFinishing, setIsFinishing] = useState(false);

  const activeCheck = useActiveWorkoutCheck({
    request,
    onFinished: () => {},
  });

  const handleFinishWorkout = async () => {
    const session = activeCheck.session;
    if (!session) return;
    setIsFinishing(true);
    try {
      await request({
        method: "PATCH",
        url: `/training-execution/${session.executionId}/finish`,
      });
      clearActiveSession();
      activeCheck.clearSession();
    } finally {
      setIsFinishing(false);
    }
  };

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
  const nextPeriod = context?.nextPeriod ?? null;

  if (!activeCheck.checkDone) {
    return <Loader loading={true} />;
  }

  if (activeCheck.showPrompt && activeCheck.session) {
    return (
      <ContinueWorkoutPrompt
        periodName={activeCheck.periodName}
        onContinue={() =>
          navigate(
            `/student/training/${activeCheck.session!.trainingId}/period/${activeCheck.session!.periodId}/execute`,
            { state: { fromContinue: true } }
          )
        }
        onFinish={handleFinishWorkout}
        isFinishing={isFinishing}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Loader loading={isFetching} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              Próximo treino
            </CardTitle>
            <CardDescription>
              Este é o próximo período planejado para você
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!lastTraining || !nextPeriod ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                <p className="font-medium text-base">
                  Ainda não há treino cadastrado para você.
                </p>
                <p className="text-sm mt-1">
                  Peça ao seu personal que cadastre um treino para começar.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium text-base">{nextPeriod.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Duração estimada: {formatEstimatedDuration(nextPeriod.exercises ?? [])}
                  </p>
                </div>

                <Button asChild className="w-full md:w-auto gap-2">
                  <Link to={`/student/training/${lastTraining.id}/period/${nextPeriod.id}/execute`}>
                    <Play className="w-4 h-4" />
                    Iniciar treino
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <Button asChild variant="outline" className="w-full flex items-center justify-between">
              <Link to="/student/workouts" className="flex items-center justify-between w-full">
                <span className="font-medium">Ver todos os treinos</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <TrainingHistorySection />
      </motion.div>
    </div>
  );
}
