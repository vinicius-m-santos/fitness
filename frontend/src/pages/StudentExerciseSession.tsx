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
import { useActiveWorkoutCheck } from "@/hooks/useActiveWorkoutCheck";
import { useWorkoutSessionStore, type SetExecutionLocal } from "@/stores/workoutSessionStore";

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
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  /** ID do exercício cujo timer está rodando (um único por vez). Continua rodando ao clicar Próximo. */
  const [currentTimedPeriodExerciseId, setCurrentTimedPeriodExerciseId] = useState<number | null>(null);
  const [restModalOpen, setRestModalOpen] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  /** Tick para forçar re-render do timer (duração calculada a partir de exerciseStartedAt) */
  const [timerTick, setTimerTick] = useState(0);
  const [lastLoadsByPeriodExercise, setLastLoadsByPeriodExercise] = useState<
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
  const [exerciseStartedAt, setExerciseStartedAt] = useState<number | null>(null);
  const restRemainingRef = useRef(0);
  restRemainingRef.current = restRemainingSeconds;
  const restDurationRef = useRef(60);
  restDurationRef.current = restDuration;
  const restContextRef = useRef<{ periodExerciseId: number; setNumber: number } | null>(null);
  const restJustCompletedRef = useRef(false);
  restJustCompletedRef.current = restJustCompleted;
  const startRequestedRef = useRef(false);
  const hasRestoredSessionRef = useRef(false);
  const handleRestCompleteRef = useRef<
    (payload: {
      seconds: number;
      ctx?: { periodExerciseId: number; setNumber: number } | null;
    }) => void
  >(() => { });
  const prevExerciseIndexRef = useRef<number | null>(null);

  const { data: training, isLoading: trainingLoading } = useQuery({
    queryKey: ["training-detail", trainingId, periodId],
    queryFn: async () => {
      const url = periodId
        ? `/training/detail/${trainingId}?periodId=${periodId}`
        : `/training/detail/${trainingId}`;
      const res = await request({ method: "GET", url });
      return res;
    },
    enabled: !!trainingId,
  });

  const activeCheck = useActiveWorkoutCheck({ trainingId, periodId });

  const initSession = useWorkoutSessionStore((s) => s.initSession);
  const addExerciseExecution = useWorkoutSessionStore((s) => s.addExerciseExecution);
  const removeExerciseExecution = useWorkoutSessionStore((s) => s.removeExerciseExecution);
  const updateLoads = useWorkoutSessionStore((s) => s.updateLoads);
  const updateSetRest = useWorkoutSessionStore((s) => s.updateSetRest);
  const setDuration = useWorkoutSessionStore((s) => s.setDuration);
  const setFinalized = useWorkoutSessionStore((s) => s.setFinalized);
  const setRestDurationValue = useWorkoutSessionStore((s) => s.setRestDurationValue);
  const session = useWorkoutSessionStore((s) => s.session);
  const setCurrentExerciseIndexStore = useWorkoutSessionStore((s) => s.setCurrentExerciseIndex);
  const setCurrentSetIndexStore = useWorkoutSessionStore((s) => s.setCurrentSetIndex);
  const setRestTimer = useWorkoutSessionStore((s) => s.setRestTimer);
  const setTimedExercise = useWorkoutSessionStore((s) => s.setTimedExercise);
  const getPayloadForFinish = useWorkoutSessionStore((s) => s.getPayloadForFinish);
  const setShowWorkoutPrompt = useWorkoutSessionStore((s) => s.setShowWorkoutPrompt);

  // Se há sessão ativa para outro treino, mostrar prompt para decidir antes
  useEffect(() => {
    if (!session || !trainingId || !periodId || !activeCheck.checkDone) return;
    const fromContinue = (location.state as { fromContinue?: boolean } | null)?.fromContinue === true;
    if (fromContinue) return;
    const tid = Number(trainingId);
    const pid = Number(periodId);
    if (session.trainingId !== tid || session.periodId !== pid) {
      setShowWorkoutPrompt(true);
    }
  }, [session, trainingId, periodId, activeCheck.checkDone, location.state, setShowWorkoutPrompt]);

  useEffect(() => {
    if (!training || !periodId) return;
    const lastRest = (training as { lastRestSeconds?: number }).lastRestSeconds;
    const lastLoads = (training as { lastLoadsByPeriodExercise?: Record<number, SetLoadInput[]> }).lastLoadsByPeriodExercise;
    if (lastRest != null) {
      setRestDuration(Math.min(300, Math.round(lastRest / 10) * 10));
    }
    if (lastLoads && typeof lastLoads === "object") {
      setLastLoadsByPeriodExercise(lastLoads);
    }
  }, [training, periodId]);

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
  const currentExerciseExecution = currentExercise && session?.exerciseExecutions[currentExercise.periodExerciseId];
  const isCurrentFinalized = currentExercise ? !!(session?.exerciseFinalized[currentExercise.periodExerciseId]) : false;
  const hasCurrentStarted = currentExercise ? !!session?.exerciseExecutions[currentExercise.periodExerciseId] : false;

  useEffect(() => {
    if (
      activeCheck.checkDone &&
      !activeCheck.showPrompt &&
      training &&
      flatExercises.length > 0 &&
      !session &&
      selectedPeriod &&
      startRequestedRef.current === false
    ) {
      startRequestedRef.current = true;
      const lastRest = (training as { lastRestSeconds?: number }).lastRestSeconds ?? null;
      let restVal = 60;
      if (lastRest != null) {
        restVal = Math.min(300, Math.round(lastRest / 10) * 10);
      }
      initSession({
        trainingId: Number(trainingId),
        periodId: Number(periodId),
        periodName: selectedPeriod.name,
        lastRestSeconds: lastRest ?? null,
        restDurationValue: restVal,
      });
    }
  }, [activeCheck.checkDone, activeCheck.showPrompt, training, flatExercises.length, session, selectedPeriod, trainingId, periodId, initSession]);

  // Um único intervalo: incrementa o tempo do exercício que está “em execução” (currentTimedPeriodExerciseId)
  // Recalcula rest ao voltar da aba
  const recalcFromTimestamps = useCallback(() => {
    const now = Date.now();
    const s = session;
    const restEndsAt = s ? (s as { restEndsAt?: number | null }).restEndsAt ?? null : null;
    const restHasEndedFromSession = restEndsAt != null && now > restEndsAt;
    if (restHasEndedFromSession) {
      const ctx =
        s
          ? (s as { restContext?: { periodExerciseId: number; setNumber: number } | null }).restContext ??
            (flatExercises[s.currentExerciseIndex]
              ? {
                  periodExerciseId: flatExercises[s.currentExerciseIndex].periodExerciseId,
                  setNumber: s.currentSetIndex + 1,
                }
              : null)
          : null;
      handleRestCompleteRef.current({
        seconds: s?.restDuration ?? restDurationRef.current,
        ctx: ctx ?? restContextRef.current ?? undefined,
      });
      restContextRef.current = null;
      setRestTimer({ restStartedAt: null, restDuration: null });
      setRestTimerRunning(false);
      setRestStartedAt(null);
      setRestModalOpen(true);
      setRestJustCompleted(true);
    } else if (restTimerRunning && restStartedAt != null && restDurationRef.current > 0) {
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
        setRestTimer({ restStartedAt: null, restDuration: null });
        setRestModalOpen(true);
        setRestJustCompleted(true);
      }
    }
  }, [restTimerRunning, restStartedAt, setRestTimer, session, flatExercises]);

  // Tick para re-render do timer (duração calculada em tempo real a partir de exerciseStartedAt)
  useEffect(() => {
    if (currentTimedPeriodExerciseId == null || exerciseStartedAt == null) return;
    const t = setInterval(() => setTimerTick((x) => x + 1), 1000);
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
        setRestTimer({ restStartedAt: null, restDuration: null });
        setRestModalOpen(true);
        setRestJustCompleted(true);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [restTimerRunning, restStartedAt, setRestTimer]);

  const restModalCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ao voltar para a aba: recalcula rest e, se descanso concluído sem usuário ver, mostra modal e agenda fechamento
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      recalcFromTimestamps();
      if (restJustCompletedRef.current) {
        if (restModalCloseTimeoutRef.current) clearTimeout(restModalCloseTimeoutRef.current);
        restModalCloseTimeoutRef.current = setTimeout(() => {
          setRestModalOpen(false);
          setRestJustCompleted(false);
          restModalCloseTimeoutRef.current = null;
        }, 1500);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onVisibility);
      if (restModalCloseTimeoutRef.current) clearTimeout(restModalCloseTimeoutRef.current);
    };
  }, [recalcFromTimestamps]);

  // Após conclusão do descanso: agenda fechamento do modal apenas quando visível (senão fecha em background)
  useEffect(() => {
    if (!restJustCompleted) return;
    if (document.visibilityState !== "visible") return;
    const t = setTimeout(() => {
      setRestModalOpen(false);
      setRestJustCompleted(false);
    }, 1500);
    return () => clearTimeout(t);
  }, [restJustCompleted]);

  const addExerciseExecutionOnPlay = useCallback(() => {
    if (!currentExercise || !session) return;
    const existing = session.exerciseExecutions[currentExercise.periodExerciseId];
    if (existing) return;
    const lastLoads = lastLoadsByPeriodExercise[currentExercise.periodExerciseId] ?? [];
    addExerciseExecution(currentExercise.periodExerciseId, seriesCount, lastLoads);
  }, [currentExercise, session, addExerciseExecution, seriesCount, lastLoadsByPeriodExercise]);

  const finalizeTimedExercise = useCallback(
    (periodExerciseId: number) => {
      const startedAt = periodExerciseId === currentTimedPeriodExerciseId ? exerciseStartedAt : null;
      const duration =
        startedAt != null ? Math.floor((Date.now() - startedAt) / 1000) : 0;
      setDuration(periodExerciseId, duration);
      setFinalized(periodExerciseId, true);
    },
    [currentTimedPeriodExerciseId, exerciseStartedAt, setDuration, setFinalized]
  );

  const handlePlayPauseClick = useCallback(() => {
    if (!currentExercise || !session) return;
    const peId = currentExercise.periodExerciseId;
    if (currentTimedPeriodExerciseId === peId) {
      // Pausar: salvar duração atual e parar o timer
      const duration = exerciseStartedAt != null
        ? Math.floor((Date.now() - exerciseStartedAt) / 1000)
        : 0;
      setDuration(peId, duration);
      setCurrentTimedPeriodExerciseId(null);
      setExerciseStartedAt(null);
      setTimedExercise({ periodExerciseId: null, exerciseStartedAt: null });
      return;
    }
    if (currentTimedPeriodExerciseId != null) {
      finalizeTimedExercise(currentTimedPeriodExerciseId);
    }
    // Play: retomar de onde parou (durationSeconds salvo) ou iniciar do zero
    const existingDuration = session.exerciseExecutions[peId]?.durationSeconds ?? 0;
    const startAt = Date.now() - existingDuration * 1000;
    setExerciseStartedAt(startAt);
    setCurrentTimedPeriodExerciseId(peId);
    setTimedExercise({ periodExerciseId: peId, exerciseStartedAt: startAt });
    flatExercises.forEach((ex) => {
      const id = ex.periodExerciseId;
      if (id !== peId && session.exerciseExecutions[id] != null && !session.exerciseFinalized[id]) {
        setFinalized(id, true);
      }
    });
    addExerciseExecutionOnPlay();
  }, [
    currentExercise,
    session,
    flatExercises,
    currentTimedPeriodExerciseId,
    exerciseStartedAt,
    finalizeTimedExercise,
    addExerciseExecutionOnPlay,
    setDuration,
    setTimedExercise,
    setFinalized,
  ]);

  useEffect(() => {
    prevExerciseIndexRef.current = currentExerciseIndex;
  }, [currentExerciseIndex]);

  const savedSetsForModal = currentExercise && currentExerciseExecution?.sets
    ? currentExerciseExecution.sets.map((s) => ({ setNumber: s.setNumber, loadKg: s.loadKg }))
    : null;
  const lastLoadsPerSet =
    currentExercise && lastLoadsByPeriodExercise[currentExercise.periodExerciseId]?.length
      ? lastLoadsByPeriodExercise[currentExercise.periodExerciseId]
      : null;

  const handleRestSave = useCallback(
    (seconds: number) => {
      if (!currentExercise) return;
      updateSetRest(currentExercise.periodExerciseId, currentSetNumber, seconds);
      setRestDurationValue(seconds);
    },
    [currentExercise, currentSetNumber, updateSetRest, setRestDurationValue]
  );

  const handleRestComplete = useCallback(
    (payload: {
      seconds: number;
      ctx?: { periodExerciseId: number; setNumber: number } | null;
    }) => {
      const { seconds, ctx } = payload;
      const useCtx =
        ctx ?? (currentExercise != null ? { periodExerciseId: currentExercise.periodExerciseId, setNumber: currentSetNumber } : null);
      if (!useCtx) return;
      updateSetRest(useCtx.periodExerciseId, useCtx.setNumber, seconds);
      setRestDurationValue(seconds);
    },
    [currentExercise, currentSetNumber, updateSetRest, setRestDurationValue]
  );
  handleRestCompleteRef.current = handleRestComplete;

  const handleLoadSave = useCallback(
    (sets: SetLoadInput[]) => {
      if (!currentExercise) return;
      const setsWithRest: SetExecutionLocal[] = sets.map((s) => ({
        setNumber: s.setNumber,
        loadKg: s.loadKg,
        restSeconds: currentExerciseExecution?.sets.find((e) => e.setNumber === s.setNumber)?.restSeconds ?? null,
      }));
      updateLoads(currentExercise.periodExerciseId, setsWithRest);
      setLoadModalOpen(false);
    },
    [currentExercise, currentExerciseExecution, updateLoads]
  );

  const finishMutation = useMutation({
    mutationFn: async (payload: { rating?: WorkoutRating }) => {
      const payloadData = getPayloadForFinish();
      if (!payloadData) return;
      await request({
        method: "POST",
        url: "/training-execution/finish-with-session",
        data: { ...payloadData, rating: payload.rating },
      });
    },
    onSuccess: () => {
    setShowRatingModal(false);
    activeCheck.clearSession();
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      queryClient.invalidateQueries({ queryKey: ["training-execution-history"] });
      navigate("/student");
    },
  });

  const goPrev = () => {
    if (currentExerciseIndex > 0) {
      const next = currentExerciseIndex - 1;
      setCurrentExerciseIndex(next);
      setCurrentSetIndex(0);
      setCurrentExerciseIndexStore(next);
      setCurrentSetIndexStore(0);
    }
  };

  const goNext = () => {
    if (currentExerciseIndex < flatExercises.length - 1) {
      const next = currentExerciseIndex + 1;
      setCurrentExerciseIndex(next);
      setCurrentSetIndex(0);
      setCurrentExerciseIndexStore(next);
      setCurrentSetIndexStore(0);
    }
  };

  const handleFinishWorkout = useCallback(() => {
    if (currentTimedPeriodExerciseId != null) {
      finalizeTimedExercise(currentTimedPeriodExerciseId);
      setCurrentTimedPeriodExerciseId(null);
    }
    setShowFinishConfirm(false);
    setShowRatingModal(true);
  }, [
    currentTimedPeriodExerciseId,
    finalizeTimedExercise,
  ]);

  const handleRatingSelect = useCallback(
    (rating: WorkoutRating) => {
      finishMutation.mutate({ rating });
    },
    [finishMutation]
  );

  const restoreLocalStateFromSession = useCallback((s: typeof session) => {
    if (!s) return;
    setCurrentExerciseIndex(s.currentExerciseIndex);
    setCurrentSetIndex(s.currentSetIndex);
    setRestDuration(s.restDurationValue);
    restDurationRef.current = s.restDurationValue;
    const restEndsAt =
      (s as { restEndsAt?: number | null }).restEndsAt ??
      (s.restStartedAt != null && s.restDuration != null
        ? s.restStartedAt + s.restDuration * 1000
        : null);
    const restHasEnded = restEndsAt != null && Date.now() > restEndsAt;
    if (s.restStartedAt != null && s.restDuration != null) {
      if (restHasEnded) {
        const ctx =
          (s as { restContext?: { periodExerciseId: number; setNumber: number } | null }).restContext ??
          (flatExercises[s.currentExerciseIndex]
            ? {
                periodExerciseId: flatExercises[s.currentExerciseIndex].periodExerciseId,
                setNumber: s.currentSetIndex + 1,
              }
            : null);
        handleRestCompleteRef.current({
          seconds: s.restDuration,
          ctx: ctx ?? undefined,
        });
        setRestTimer({ restStartedAt: null, restDuration: null });
        setRestModalOpen(true);
        setRestJustCompleted(true);
      } else {
        const remaining = Math.max(
          0,
          s.restDuration - Math.floor((Date.now() - s.restStartedAt) / 1000)
        );
        setRestRemainingSeconds(remaining);
        restRemainingRef.current = remaining;
        setRestStartedAt(s.restStartedAt);
        setRestTimerRunning(true);
        setRestModalOpen(true);
        const currentEx = flatExercises[s.currentExerciseIndex];
        if (currentEx) {
          restContextRef.current = {
            periodExerciseId: currentEx.periodExerciseId,
            setNumber: s.currentSetIndex + 1,
          };
        }
      }
    }
    if (s.currentTimedPeriodExerciseId != null && s.exerciseStartedAt != null) {
      setCurrentTimedPeriodExerciseId(s.currentTimedPeriodExerciseId);
      setExerciseStartedAt(s.exerciseStartedAt);
    }
    startRequestedRef.current = true;
  }, [flatExercises, setRestTimer]);

  const handleResumeContinue = useCallback(() => {
    const s = activeCheck.session;
    if (!s) return;
    hasRestoredSessionRef.current = true;
    restoreLocalStateFromSession(s);
    activeCheck.setShowPrompt(false);
  }, [activeCheck, restoreLocalStateFromSession]);

  useEffect(() => {
    const fromContinue = (location.state as { fromContinue?: boolean } | null)?.fromContinue === true;
    if (
      !fromContinue ||
      !activeCheck.checkDone ||
      !activeCheck.session ||
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
    handleResumeContinue,
  ]);

  useEffect(() => {
    const fromContinue = (location.state as { fromContinue?: boolean } | null)?.fromContinue === true;
    if (
      fromContinue ||
      !activeCheck.checkDone ||
      !activeCheck.session ||
      hasRestoredFromContinueRef.current ||
      !trainingId ||
      !periodId
    )
      return;
    const matchUrl =
      activeCheck.session.trainingId === Number(trainingId) &&
      activeCheck.session.periodId === Number(periodId);
    if (!matchUrl) return;
    hasRestoredFromContinueRef.current = true;
    restoreLocalStateFromSession(activeCheck.session);
  }, [
    activeCheck.checkDone,
    activeCheck.session,
    trainingId,
    periodId,
    restoreLocalStateFromSession,
  ]);

  const handleRefazer = () => {
    if (!currentExercise) return;
    const peId = currentExercise.periodExerciseId;
    if (currentTimedPeriodExerciseId === peId) {
      setCurrentTimedPeriodExerciseId(null);
      setExerciseStartedAt(null);
      setTimedExercise({ periodExerciseId: null, exerciseStartedAt: null });
    }
    removeExerciseExecution(peId);
  };

  const isLastExercise = currentExerciseIndex === flatExercises.length - 1;
  const isFirstExercise = currentExerciseIndex === 0;

  if (trainingLoading || !training) {
    return <Loader loading={true} />;
  }

  const fromContinue = (location.state as { fromContinue?: boolean } | null)?.fromContinue === true;
  const shouldRestoreFromContinue =
    fromContinue && activeCheck.checkDone && activeCheck.session && !hasRestoredFromContinueRef.current;

  if (!activeCheck.checkDone || shouldRestoreFromContinue) {
    return <Loader loading={true} />;
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
    currentExercise && currentTimedPeriodExerciseId === currentExercise.periodExerciseId && exerciseStartedAt != null
      ? Math.floor((Date.now() - exerciseStartedAt) / 1000)
      : (currentExercise ? (session?.exerciseExecutions[currentExercise.periodExerciseId]?.durationSeconds ?? 0) : 0);
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
          const ctx = currentExercise
            ? { periodExerciseId: currentExercise.periodExerciseId, setNumber: currentSetNumber }
            : null;
          restContextRef.current = ctx ?? null;
          const duration = restRemainingSeconds > 0 ? restRemainingSeconds : restDuration;
          restDurationRef.current = duration;
          restRemainingRef.current = duration;
          setRestRemainingSeconds(duration);
          const now = Date.now();
          setRestStartedAt(now);
          setRestTimerRunning(true);
          setRestTimer({ restStartedAt: now, restDuration: duration, restContext: ctx ?? null });
        }}
        onRestPause={() => {
          setRestTimerRunning(false);
          setRestStartedAt(null);
          setRestTimer({ restStartedAt: null, restDuration: null });
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
