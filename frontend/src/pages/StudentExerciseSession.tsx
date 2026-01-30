"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause, Timer, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import Loader from "@/components/ui/loader";
import RestModal from "@/components/Student/RestModal";
import LoadModal, { type SetLoadInput } from "@/components/Student/LoadModal";
import WorkoutRatingModal, { type WorkoutRating } from "@/components/Student/WorkoutRatingModal";
import ContinueWorkoutPrompt from "@/components/Student/ContinueWorkoutPrompt";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { setActiveSession, clearActiveSession, type ActiveSessionData } from "@/lib/activeSessionDb";
import { useActiveWorkoutCheck } from "@/hooks/useActiveWorkoutCheck";

type FlatExercise = {
  periodExerciseId: number;
  id: number;
  name: string;
  series: string | null;
  reps: string | null;
  rest: string | null;
  obs: string | null;
  periodName: string;
};

function parseSeries(series: string | null): number {
  if (!series) return 4;
  const n = parseInt(series, 10);
  return isNaN(n) || n < 1 ? 4 : Math.min(n, 20);
}

export default function StudentExerciseSession() {
  const { trainingId, periodId } = useParams<{ trainingId: string; periodId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRestoredFromContinueRef = useRef(false);
  const request = useRequest();
  const queryClient = useQueryClient();
  const [executionId, setExecutionId] = useState<number | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  /** ID do exercício cujo timer está rodando (um único por vez). Continua rodando ao clicar Próximo. */
  const [currentTimedPeriodExerciseId, setCurrentTimedPeriodExerciseId] = useState<number | null>(null);
  const [restModalOpen, setRestModalOpen] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [exerciseExecutionIds, setExerciseExecutionIds] = useState<Record<number, number>>({});
  const [executionOrderCounter, setExecutionOrderCounter] = useState(1);
  const [exerciseFinalized, setExerciseFinalized] = useState<Record<number, boolean>>({});
  const [exerciseElapsedSeconds, setExerciseElapsedSeconds] = useState<Record<number, number>>({});
  const [lastRestSeconds, setLastRestSeconds] = useState<number | null>(null);
  const [lastLoadsByPeriodExercise, setLastLoadsByPeriodExercise] = useState<
    Record<number, SetLoadInput[]>
  >({});
  const [savedLoadsByExerciseExecution, setSavedLoadsByExerciseExecution] = useState<
    Record<number, SetLoadInput[]>
  >({});
  // Rest timer: estado no pai; usa timestamp para continuar ao voltar do background
  const [restDuration, setRestDuration] = useState(60);
  const [restRemainingSeconds, setRestRemainingSeconds] = useState(0);
  const [restTimerRunning, setRestTimerRunning] = useState(false);
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);
  const [restJustCompleted, setRestJustCompleted] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingFinishExecutionId, setPendingFinishExecutionId] = useState<number | null>(null);
  const [exerciseStartedAt, setExerciseStartedAt] = useState<number | null>(null);
  const restRemainingRef = useRef(0);
  restRemainingRef.current = restRemainingSeconds;
  const restDurationRef = useRef(60);
  restDurationRef.current = restDuration;
  const restContextRef = useRef<{ exerciseExecutionId: number; setNumber: number } | null>(null);
  const startRequestedRef = useRef(false);
  const hasRestoredSessionRef = useRef(false);
  const handleRestCompleteRef = useRef<
    (payload: {
      seconds: number;
      ctx?: { exerciseExecutionId: number; setNumber: number } | null;
    }) => void
  >(() => { });
  const prevExerciseIndexRef = useRef<number | null>(null);

  const { data: training, isLoading: trainingLoading } = useQuery({
    queryKey: ["training-detail", trainingId],
    queryFn: async () => {
      const res = await request({ method: "GET", url: `/training/detail/${trainingId}` });
      return res;
    },
    enabled: !!trainingId,
  });

  const { data: executionContext } = useQuery({
    queryKey: ["execution-context", trainingId, periodId],
    queryFn: async () => {
      const res = await request({
        method: "GET",
        url: `/training-execution/execution-context?trainingId=${trainingId}&periodId=${periodId}`,
      });
      return res;
    },
    enabled: !!trainingId && !!periodId,
  });

  const activeCheck = useActiveWorkoutCheck({
    trainingId,
    periodId,
    request,
    onFinished: () => {
      clearActiveSession();
      navigate("/student");
    },
  });

  useEffect(() => {
    if (hasRestoredSessionRef.current || !executionContext) return;
    if (executionContext.lastRestSeconds != null) {
      setLastRestSeconds(executionContext.lastRestSeconds);
      const rounded = Math.min(300, Math.round(executionContext.lastRestSeconds / 10) * 10);
      setRestDuration(rounded);
    }
    if (executionContext.lastLoadsByPeriodExercise && typeof executionContext.lastLoadsByPeriodExercise === "object") {
      setLastLoadsByPeriodExercise(executionContext.lastLoadsByPeriodExercise);
    }
  }, [executionContext]);

  const periodIdNum = periodId ? parseInt(periodId, 10) : null;
  const selectedPeriod = training?.periods?.find((p: { id: number }) => p.id === periodIdNum);
  const flatExercises: FlatExercise[] = useMemo(() => {
    if (!selectedPeriod) return [];
    return (selectedPeriod.exercises as {
      id: number;
      periodExerciseId: number;
      name: string;
      series?: string;
      reps?: string;
      rest?: string;
      obs?: string;
    }[]).map((e) => ({
      ...e,
      series: e.series ?? null,
      reps: e.reps ?? null,
      rest: e.rest ?? null,
      obs: e.obs ?? null,
      periodName: selectedPeriod.name,
    }));
  }, [selectedPeriod]);

  const currentExercise = flatExercises[currentExerciseIndex];
  const seriesCount = currentExercise ? parseSeries(currentExercise.series ?? null) : 4;
  const currentSetNumber = currentSetIndex + 1;
  const exerciseExecutionId = currentExercise ? exerciseExecutionIds[currentExercise.periodExerciseId] : null;
  const isCurrentFinalized = currentExercise ? !!exerciseFinalized[currentExercise.periodExerciseId] : false;
  const hasCurrentStarted = currentExercise ? exerciseExecutionIds[currentExercise.periodExerciseId] != null : false;

  const startExecutionMutation = useMutation({
    mutationFn: async () => {
      const res = await request({
        method: "POST",
        url: "/training-execution/start",
        data: { trainingId: Number(trainingId) },
      });
      return res;
    },
    onSuccess: (data: { id: number }) => {
      setExecutionId(data.id);
    },
  });

  useEffect(() => {
    if (
      activeCheck.checkDone &&
      !activeCheck.showPrompt &&
      training &&
      flatExercises.length > 0 &&
      !executionId &&
      !startExecutionMutation.isPending &&
      !startRequestedRef.current
    ) {
      startRequestedRef.current = true;
      startExecutionMutation.mutate();
    }
  }, [activeCheck.checkDone, activeCheck.showPrompt, training?.id, flatExercises.length, executionId, startExecutionMutation, startExecutionMutation.isPending, training]);

  // Um único intervalo: incrementa o tempo do exercício que está “em execução” (currentTimedPeriodExerciseId)
  // Recalcula rest e exercise a partir de timestamps (funciona com app em background)
  const recalcFromTimestamps = useCallback(() => {
    const now = Date.now();
    if (restTimerRunning && restStartedAt != null && restDurationRef.current > 0) {
      const elapsed = Math.floor((now - restStartedAt) / 1000);
      const remaining = Math.max(0, restDurationRef.current - elapsed);
      setRestRemainingSeconds(remaining);
      if (remaining <= 0) {
        setRestTimerRunning(false);
        setRestRemainingSeconds(0);
        setRestStartedAt(null);
        handleRestCompleteRef.current({
          seconds: restDurationRef.current,
          ctx: restContextRef.current ?? undefined,
        });
        restContextRef.current = null;
        setRestJustCompleted(true);
      }
    }
    if (currentTimedPeriodExerciseId != null && exerciseStartedAt != null) {
      const elapsed = Math.floor((now - exerciseStartedAt) / 1000);
      setExerciseElapsedSeconds((prev) => ({
        ...prev,
        [currentTimedPeriodExerciseId]: elapsed,
      }));
    }
  }, [restTimerRunning, restStartedAt, currentTimedPeriodExerciseId, exerciseStartedAt]);

  // Exercício: tempo baseado em timestamp (continua ao voltar do background)
  useEffect(() => {
    if (currentTimedPeriodExerciseId == null || exerciseStartedAt == null) return;
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - exerciseStartedAt) / 1000);
      setExerciseElapsedSeconds((prev) => ({
        ...prev,
        [currentTimedPeriodExerciseId]: elapsed,
      }));
    }, 1000);
    return () => clearInterval(t);
  }, [currentTimedPeriodExerciseId, exerciseStartedAt]);

  // Rest: tempo baseado em timestamp (continua ao voltar do background)
  useEffect(() => {
    if (!restTimerRunning || restStartedAt == null) return;
    const t = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - restStartedAt) / 1000);
      const remaining = Math.max(0, restDurationRef.current - elapsed);
      setRestRemainingSeconds(remaining);
      if (remaining <= 0) {
        setRestTimerRunning(false);
        setRestRemainingSeconds(0);
        setRestStartedAt(null);
        const ctx = restContextRef.current;
        handleRestCompleteRef.current({ seconds: restDurationRef.current, ctx: ctx ?? undefined });
        restContextRef.current = null;
        setRestJustCompleted(true);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [restTimerRunning, restStartedAt]);

  // Ao voltar para a aba, recalcula tempos a partir dos timestamps
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") recalcFromTimestamps();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [recalcFromTimestamps]);

  // Após conclusão do descanso: mostra check 1s e fecha o modal
  useEffect(() => {
    if (!restJustCompleted) return;
    const t = setTimeout(() => {
      setRestModalOpen(false);
      setRestJustCompleted(false);
    }, 1500);
    return () => clearTimeout(t);
  }, [restJustCompleted]);

  // Persiste sessão no IndexedDB para sobreviver a reload e background
  useEffect(() => {
    if (
      executionId == null ||
      trainingId == null ||
      periodId == null ||
      typeof trainingId !== "string" ||
      typeof periodId !== "string"
    )
      return;
    const payload: ActiveSessionData = {
      executionId,
      trainingId: Number(trainingId),
      periodId: Number(periodId),
      periodName: selectedPeriod?.name ?? (training as { name?: string })?.name ?? `Período ${periodId}`,
      currentExerciseIndex,
      currentSetIndex,
      restStartedAt,
      restDuration: restDurationRef.current,
      currentTimedPeriodExerciseId,
      exerciseStartedAt,
      exerciseElapsedSeconds: { ...exerciseElapsedSeconds },
      exerciseExecutionIds: { ...exerciseExecutionIds },
      exerciseFinalized: { ...exerciseFinalized },
      executionOrderCounter,
      lastRestSeconds,
      restDurationValue: restDuration,
    };
    setActiveSession(payload).catch(() => { });
  }, [
    executionId,
    trainingId,
    periodId,
    selectedPeriod?.name,
    (training as { name?: string })?.name,
    currentExerciseIndex,
    currentSetIndex,
    restStartedAt,
    currentTimedPeriodExerciseId,
    exerciseStartedAt,
    exerciseElapsedSeconds,
    exerciseExecutionIds,
    exerciseFinalized,
    executionOrderCounter,
    lastRestSeconds,
    restDuration,
  ]);

  const addExerciseExecutionOnPlay = useCallback(async () => {
    if (!currentExercise || !executionId) return;
    const existing = exerciseExecutionIds[currentExercise.periodExerciseId];
    if (existing) return existing;
    const order = executionOrderCounter;
    const res = await request({
      method: "POST",
      url: `/training-execution/${executionId}/exercises`,
      data: {
        periodExerciseId: currentExercise.periodExerciseId,
        executionOrder: order,
      },
    });
    setExerciseExecutionIds((prev) => ({
      ...prev,
      [currentExercise.periodExerciseId]: res.id,
    }));
    setExecutionOrderCounter((c) => c + 1);
    return res.id;
  }, [currentExercise, executionId, executionOrderCounter, exerciseExecutionIds, request]);

  /** Finaliza o exercício que estava com timer rodando: salva duração no backend e marca como finalizado. */
  const finalizeTimedExercise = useCallback(
    async (periodExerciseId: number) => {
      const exId = exerciseExecutionIds[periodExerciseId];
      const duration = exerciseElapsedSeconds[periodExerciseId] ?? 0;
      if (exId != null) {
        await request({
          method: "PATCH",
          url: `/training-execution/exercise-execution/${exId}/duration`,
          data: { durationSeconds: duration },
        });
      }
      setExerciseFinalized((prev) => ({ ...prev, [periodExerciseId]: true }));
    },
    [exerciseExecutionIds, exerciseElapsedSeconds, request]
  );

  const handlePlayPauseClick = useCallback(async () => {
    if (!currentExercise || !executionId) return;
    const peId = currentExercise.periodExerciseId;
    // Se já é o exercício em execução, pausar
    if (currentTimedPeriodExerciseId === peId) {
      setCurrentTimedPeriodExerciseId(null);
      setExerciseStartedAt(null);
      return;
    }
    // Finaliza o exercício que estava com timer rodando (salva duração e marca finalizado)
    if (currentTimedPeriodExerciseId != null) {
      await finalizeTimedExercise(currentTimedPeriodExerciseId);
    }
    const existingElapsed = exerciseElapsedSeconds[peId] ?? 0;
    setExerciseStartedAt(Date.now() - existingElapsed * 1000);
    setCurrentTimedPeriodExerciseId(peId);
    setExerciseFinalized((prev) => {
      const next = { ...prev };
      flatExercises.forEach((ex) => {
        const id = ex.periodExerciseId;
        if (id !== peId && exerciseExecutionIds[id] != null && !prev[id]) {
          next[id] = true;
        }
      });
      return next;
    });
    await addExerciseExecutionOnPlay();
  }, [
    currentExercise,
    executionId,
    flatExercises,
    exerciseExecutionIds,
    exerciseElapsedSeconds,
    currentTimedPeriodExerciseId,
    finalizeTimedExercise,
    addExerciseExecutionOnPlay,
  ]);

  useEffect(() => {
    prevExerciseIndexRef.current = currentExerciseIndex;
  }, [currentExerciseIndex]);

  const savedSetsForModal = currentExercise && exerciseExecutionId
    ? (savedLoadsByExerciseExecution[exerciseExecutionId] ?? null)
    : null;
  const lastLoadsPerSet =
    currentExercise && lastLoadsByPeriodExercise[currentExercise.periodExerciseId]?.length
      ? lastLoadsByPeriodExercise[currentExercise.periodExerciseId]
      : null;

  const handleRestSave = useCallback(
    async (seconds: number) => {
      if (!exerciseExecutionId) return;
      await request({
        method: "PATCH",
        url: `/training-execution/exercise-execution/${exerciseExecutionId}/set-rest`,
        data: { setNumber: currentSetNumber, restSeconds: seconds },
      });
      setLastRestSeconds(seconds);
    },
    [exerciseExecutionId, currentSetNumber, request]
  );

  const handleRestComplete = useCallback(
    async (payload: {
      seconds: number;
      ctx?: { exerciseExecutionId: number; setNumber: number } | null;
    }) => {
      const { seconds, ctx } = payload;
      const useCtx =
        ctx ?? (exerciseExecutionId != null ? { exerciseExecutionId, setNumber: currentSetNumber } : null);
      if (!useCtx) return;
      await request({
        method: "PATCH",
        url: `/training-execution/exercise-execution/${useCtx.exerciseExecutionId}/set-rest`,
        data: { setNumber: useCtx.setNumber, restSeconds: seconds },
      });
      setLastRestSeconds(seconds);
      // Modal fecha após 1s via useEffect quando restJustCompleted é true
    },
    [exerciseExecutionId, currentSetNumber, request]
  );
  handleRestCompleteRef.current = handleRestComplete;

  const handleLoadSave = useCallback(
    async (sets: SetLoadInput[]) => {
      if (!exerciseExecutionId) return;
      await request({
        method: "PATCH",
        url: `/training-execution/exercise-execution/${exerciseExecutionId}/sets`,
        data: {
          sets: sets.map((s) => ({ setNumber: s.setNumber, loadKg: s.loadKg ?? null })),
        },
      });
      setSavedLoadsByExerciseExecution((prev) => ({ ...prev, [exerciseExecutionId]: sets }));
      setLoadModalOpen(false);
    },
    [exerciseExecutionId, request]
  );

  const finishMutation = useMutation({
    mutationFn: async (payload: { executionId: number; rating?: WorkoutRating }) => {
      const { executionId: id, rating } = payload;
      if (id == null) return;
      await request({
        method: "PATCH",
        url: `/training-execution/${id}/finish`,
        data: rating != null ? { rating } : undefined,
      });
    },
    onSuccess: () => {
      setShowRatingModal(false);
      setPendingFinishExecutionId(null);
      clearActiveSession();
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      navigate("/student");
    },
  });

  const goPrev = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((i) => i - 1);
      setCurrentSetIndex(0);
    }
  };

  const goNext = () => {
    if (currentExerciseIndex < flatExercises.length - 1) {
      setCurrentExerciseIndex((i) => i + 1);
      setCurrentSetIndex(0);
    }
  };

  const handleFinishWorkout = useCallback(async () => {
    if (currentTimedPeriodExerciseId != null) {
      await finalizeTimedExercise(currentTimedPeriodExerciseId);
      setCurrentTimedPeriodExerciseId(null);
    }
    setShowFinishConfirm(false);
    setPendingFinishExecutionId(executionId ?? null);
    setShowRatingModal(true);
  }, [currentTimedPeriodExerciseId, executionId, finalizeTimedExercise]);

  const handleRatingSelect = useCallback(
    (rating: WorkoutRating) => {
      const id = pendingFinishExecutionId ?? executionId;
      if (id != null) {
        finishMutation.mutate({ executionId: id, rating });
      }
    },
    [pendingFinishExecutionId, executionId, finishMutation]
  );

  const handleResumeContinue = useCallback(() => {
    const session = activeCheck.session;
    const api = activeCheck.execution;
    if (!session || !api) return;
    hasRestoredSessionRef.current = true;
    const execId = session.executionId;
    setExecutionId(execId);
    setCurrentExerciseIndex(session.currentExerciseIndex);
    setCurrentSetIndex(session.currentSetIndex);
    const ids: Record<number, number> = {};
    const finalized: Record<number, boolean> = {};
    const elapsed: Record<number, number> = {};
    let maxOrder = 0;
    for (const ee of api.exerciseExecutions) {
      ids[ee.periodExerciseId] = ee.id;
      if (ee.durationSeconds != null) {
        finalized[ee.periodExerciseId] = true;
        elapsed[ee.periodExerciseId] = ee.durationSeconds;
      }
      if (ee.executionOrder > maxOrder) maxOrder = ee.executionOrder;
    }
    if (session.currentTimedPeriodExerciseId != null && session.exerciseStartedAt != null) {
      const peId = session.currentTimedPeriodExerciseId;
      elapsed[peId] = Math.floor((Date.now() - session.exerciseStartedAt) / 1000);
    }
    setExerciseExecutionIds(ids);
    setExerciseFinalized(finalized);
    setExerciseElapsedSeconds({ ...session.exerciseElapsedSeconds, ...elapsed });
    setExecutionOrderCounter(maxOrder + 1);
    setLastRestSeconds(session.lastRestSeconds);
    setRestDuration(session.restDurationValue);
    restDurationRef.current = session.restDurationValue;
    if (session.restStartedAt != null && session.restDuration != null) {
      const remaining = Math.max(
        0,
        session.restDuration - Math.floor((Date.now() - session.restStartedAt) / 1000)
      );
      setRestRemainingSeconds(remaining);
      restRemainingRef.current = remaining;
      setRestStartedAt(remaining > 0 ? session.restStartedAt : null);
      setRestTimerRunning(remaining > 0);
      if (remaining > 0) {
        setRestModalOpen(true);
        const currentEx = flatExercises[session.currentExerciseIndex];
        const currentPeId = currentEx?.periodExerciseId;
        if (currentPeId != null && ids[currentPeId] != null) {
          restContextRef.current = {
            exerciseExecutionId: ids[currentPeId],
            setNumber: session.currentSetIndex + 1,
          };
        }
      } else {
        setRestModalOpen(true);
        setRestJustCompleted(true);
      }
    }
    if (session.currentTimedPeriodExerciseId != null) {
      setCurrentTimedPeriodExerciseId(session.currentTimedPeriodExerciseId);
      setExerciseStartedAt(session.exerciseStartedAt);
    }
    startRequestedRef.current = true;
    activeCheck.setShowPrompt(false);
    activeCheck.clearSession();
  }, [activeCheck, flatExercises]);

  const handleResumeFinish = useCallback(async () => {
    const session = activeCheck.session;
    if (!session) return;
    if (session.currentTimedPeriodExerciseId != null) {
      const exId = session.exerciseExecutionIds[session.currentTimedPeriodExerciseId];
      const duration = session.exerciseElapsedSeconds[session.currentTimedPeriodExerciseId] ?? 0;
      if (exId != null) {
        await request({
          method: "PATCH",
          url: `/training-execution/exercise-execution/${exId}/duration`,
          data: { durationSeconds: duration },
        });
      }
    }
    setPendingFinishExecutionId(session.executionId);
    setShowRatingModal(true);
  }, [activeCheck.session, request]);

  // Ao vir de "Continuar treino" (outra página), restaura direto sem mostrar o prompt de novo
  useEffect(() => {
    const fromContinue = (location.state as { fromContinue?: boolean } | null)?.fromContinue === true;
    if (
      !fromContinue ||
      !activeCheck.checkDone ||
      !activeCheck.session ||
      !activeCheck.execution ||
      hasRestoredFromContinueRef.current
    )
      return;
    hasRestoredFromContinueRef.current = true;
    handleResumeContinue();
    navigate(location.pathname, { replace: true, state: {} });
  }, [
    location.state,
    location.pathname,
    navigate,
    activeCheck.checkDone,
    activeCheck.session,
    activeCheck.execution,
    handleResumeContinue,
  ]);

  const handleRefazer = () => {
    if (!currentExercise) return;
    const peId = currentExercise.periodExerciseId;
    if (currentTimedPeriodExerciseId === peId) {
      setCurrentTimedPeriodExerciseId(null);
      setExerciseStartedAt(null);
    }
    setExerciseFinalized((prev) => ({ ...prev, [peId]: false }));
    setExerciseElapsedSeconds((prev) => ({ ...prev, [peId]: 0 }));
    setExerciseExecutionIds((prev) => {
      const next = { ...prev };
      delete next[peId];
      return next;
    });
  };

  const isLastExercise = currentExerciseIndex === flatExercises.length - 1;
  const isFirstExercise = currentExerciseIndex === 0;

  if (trainingLoading || !training) {
    return <Loader loading={true} />;
  }

  const fromContinue = (location.state as { fromContinue?: boolean } | null)?.fromContinue === true;
  const shouldRestoreFromContinue =
    fromContinue && activeCheck.checkDone && activeCheck.session && activeCheck.execution && !hasRestoredFromContinueRef.current;

  if (!activeCheck.checkDone || shouldRestoreFromContinue) {
    return <Loader loading={true} />;
  }

  if (
    activeCheck.showPrompt &&
    activeCheck.session &&
    activeCheck.execution &&
    !fromContinue
  ) {
    return (
      <>
        <ContinueWorkoutPrompt
          periodName={selectedPeriod?.name ?? activeCheck.periodName}
          onContinue={handleResumeContinue}
          onFinish={() => void handleResumeFinish()}
          isFinishing={finishMutation.isPending}
        />
        <WorkoutRatingModal
          open={showRatingModal}
          onOpenChange={setShowRatingModal}
          onSelect={handleRatingSelect}
          disabled={finishMutation.isPending}
        />
      </>
    );
  }

  if (!periodIdNum || !selectedPeriod) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <p className="text-muted-foreground text-center">Período não encontrado.</p>
        <Button variant="outline" className="mt-4 w-full" onClick={() => navigate("/student")}>
          Voltar
        </Button>
      </div>
    );
  }

  if (flatExercises.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <p className="text-muted-foreground text-center">Este período não possui exercícios.</p>
        <Button variant="outline" className="mt-4 w-full" onClick={() => navigate("/student")}>
          Voltar
        </Button>
      </div>
    );
  }

  const displayTimer =
    currentExercise ? (exerciseElapsedSeconds[currentExercise.periodExerciseId] ?? 0) : 0;
  const isTimerRunning =
    currentExercise != null && currentTimedPeriodExerciseId === currentExercise.periodExerciseId;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg md:text-xl text-center">
            {currentExercise?.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            {seriesCount} séries • {currentExercise?.reps ?? "—"} repetições
          </p>
        </CardHeader>
      </Card>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6 flex flex-col items-center gap-6">
            {isCurrentFinalized ? (
              <>
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-green-500/15 p-4 flex items-center justify-center">
                    <Check className="w-12 h-12 sm:w-14 sm:h-14 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Exercício finalizado</p>
                  <Button variant="outline" className="w-full sm:w-auto" onClick={handleRefazer}>
                    Refazer
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Tempo do exercício</p>
                  <p className="text-4xl md:text-5xl font-mono font-semibold tabular-nums">
                    {String(Math.floor(displayTimer / 60)).padStart(2, "0")}:
                    {String(displayTimer % 60).padStart(2, "0")}
                  </p>
                </div>

                <Button
                  size="lg"
                  className="rounded-full w-20 h-20 sm:w-24 sm:h-24 text-lg"
                  onClick={handlePlayPauseClick}
                >
                  {isTimerRunning ? (
                    <Pause className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : (
                    <Play className="w-7 h-7 sm:w-8 sm:h-8" />
                  )}
                </Button>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => setRestModalOpen(true)}
                    disabled={!hasCurrentStarted}
                  >
                    <Timer className="w-4 h-4" />
                    Descanso
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => setLoadModalOpen(true)}
                    disabled={!hasCurrentStarted}
                  >
                    <Plus className="w-4 h-4" />
                    Carga
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2 text-black"
          onClick={goPrev}
          disabled={isFirstExercise}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        {isLastExercise ? (
          <Button
            className="flex-1 gap-2"
            onClick={() => setShowFinishConfirm(true)}
            disabled={finishMutation.isPending}
          >
            Finalizar treino
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="flex-1 gap-2" onClick={goNext}>
            Próximo
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      <RestModal
        open={restModalOpen}
        onOpenChange={setRestModalOpen}
        restDuration={restDuration}
        onRestDurationChange={setRestDuration}
        restRemainingSeconds={restRemainingSeconds}
        restTimerRunning={restTimerRunning}
        restJustCompleted={restJustCompleted}
        onRestStart={() => {
          if (exerciseExecutionId != null) {
            restContextRef.current = { exerciseExecutionId, setNumber: currentSetNumber };
          }
          const duration = restRemainingSeconds > 0 ? restRemainingSeconds : restDuration;
          restDurationRef.current = duration;
          restRemainingRef.current = duration;
          setRestRemainingSeconds(duration);
          setRestStartedAt(Date.now());
          setRestTimerRunning(true);
        }}
        onRestPause={() => {
          setRestTimerRunning(false);
          setRestStartedAt(null);
        }}
        onRestSave={handleRestSave}
      />

      <LoadModal
        open={loadModalOpen}
        onOpenChange={setLoadModalOpen}
        seriesCount={seriesCount}
        savedSets={savedSetsForModal}
        lastLoadsPerSet={lastLoadsPerSet}
        onSave={handleLoadSave}
      />

      <WorkoutRatingModal
        open={showRatingModal}
        onOpenChange={setShowRatingModal}
        onSelect={handleRatingSelect}
        disabled={finishMutation.isPending}
      />

      <AlertDialog open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
        <AlertDialogContent className="rounded-2xl max-w-[min(360px,95vw)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar treino?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar o treino? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel disabled={finishMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowFinishConfirm(false);
                handleFinishWorkout();
              }}
              disabled={finishMutation.isPending}
              asChild
            >
              <Button variant="destructive" disabled={finishMutation.isPending}>
                {finishMutation.isPending ? "Finalizando…" : "Sim, finalizar"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
