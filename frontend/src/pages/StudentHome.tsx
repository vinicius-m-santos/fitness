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
import TrainingHistorySection from "@/components/Student/TrainingHistorySection";
import { useActiveWorkoutCheck } from "@/hooks/useActiveWorkoutCheck";
import { useWorkoutSessionStore } from "@/stores/workoutSessionStore";

type ExerciseWithSeriesAndRest = { series?: string; rest?: string };

function parseSeries(series: string | undefined): number {
  if (series == null || series === "") return 1;
  const n = parseInt(series, 10);
  return Number.isNaN(n) || n < 1 ? 1 : Math.min(n, 99);
}

function parseRestSeconds(rest: string | undefined): number {
  if (rest == null || rest === "") return 0;
  const n = parseInt(rest, 10);
  return Number.isNaN(n) || n < 0 ? 0 : Math.min(n, 600);
}

function formatEstimatedDuration(exercises: unknown[]): string {
  const list = (exercises ?? []) as ExerciseWithSeriesAndRest[];
  const totalSeconds = list.reduce((acc, ex) => {
    const series = parseSeries(ex.series);
    const restSec = parseRestSeconds(ex.rest);
    const exerciseSeconds = series * 60 + series * restSec;
    return acc + exerciseSeconds;
  }, 0);
  const minutes = Math.round(totalSeconds / 60);
  const displayMinutes = Math.max(1, Math.min(999, minutes));
  return `${displayMinutes} minuto${displayMinutes !== 1 ? "s" : ""}`;
}

export default function StudentHome() {
  const request = useRequest();
  const navigate = useNavigate();
  const activeCheck = useActiveWorkoutCheck({});
  const session = useWorkoutSessionStore((s) => s.session);
  const setShowWorkoutPrompt = useWorkoutSessionStore((s) => s.setShowWorkoutPrompt);

  const handleStartWorkout = (trainingId: number, periodId: number) => {
    if (session && (session.trainingId !== trainingId || session.periodId !== periodId)) {
      setShowWorkoutPrompt(true);
      return;
    }
    navigate(`/student/training/${trainingId}/period/${periodId}/execute`, {
      state: session ? { fromContinue: true } : undefined,
    });
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

                <Button
                  className="w-full md:w-auto gap-2"
                  onClick={() => handleStartWorkout(lastTraining.id, nextPeriod.id)}
                >
                  <Play className="w-4 h-4" />
                  Iniciar treino
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
