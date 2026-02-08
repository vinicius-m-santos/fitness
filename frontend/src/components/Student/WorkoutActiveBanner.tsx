"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useWorkoutSessionStore } from "@/stores/workoutSessionStore";
import RestModal from "@/components/Student/RestModal";

const ROLE_CLIENT = "ROLE_CLIENT";

function formatRestTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function WorkoutActiveBanner() {
  const { user } = useAuth();
  const location = useLocation();
  const session = useWorkoutSessionStore((s) => s.session);
  const setShowWorkoutPrompt = useWorkoutSessionStore((s) => s.setShowWorkoutPrompt);
  const updateSetRest = useWorkoutSessionStore((s) => s.updateSetRest);
  const setRestTimer = useWorkoutSessionStore((s) => s.setRestTimer);

  const [restRemainingSeconds, setRestRemainingSeconds] = useState(0);
  const [restModalOpen, setRestModalOpen] = useState(false);
  const [restJustCompleted, setRestJustCompleted] = useState(false);
  const restModalCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isClient = !!user?.roles?.includes(ROLE_CLIENT);
  const isOnExecutePage = location.pathname.includes("/execute");

  const restEndsAt = session ? (session as { restEndsAt?: number | null }).restEndsAt ?? null : null;
  const restDuration = session?.restDuration ?? 0;
  const restContext = session ? (session as { restContext?: { periodExerciseId: number; setNumber: number } | null }).restContext ?? null : null;

  const restIsActive = restEndsAt != null && restDuration > 0;

  const recalcRestRemaining = useCallback((): number => {
    if (!restEndsAt || restDuration <= 0) return 0;
    const now = Date.now();
    if (now >= restEndsAt) return 0;
    return Math.max(0, Math.floor((restEndsAt - now) / 1000));
  }, [restEndsAt, restDuration]);

  const handleRestComplete = useCallback(() => {
    if (!restContext) return;
    updateSetRest(restContext.periodExerciseId, restContext.setNumber, restDuration);
    setRestTimer({ restStartedAt: null, restDuration: null });
    setRestModalOpen(true);
    setRestJustCompleted(true);
  }, [restContext, restDuration, updateSetRest, setRestTimer]);

  // Timer tick para re-render do banner quando descanso ativo (apenas exibição)
  useEffect(() => {
    if (!restIsActive) return;
    const remaining = recalcRestRemaining();
    setRestRemainingSeconds(remaining);
    if (remaining <= 0 && !isOnExecutePage) {
      handleRestComplete();
    }
  }, [restIsActive, recalcRestRemaining, handleRestComplete, isOnExecutePage]);

  useEffect(() => {
    if (!restIsActive) return;
    const t = setInterval(() => {
      const remaining = recalcRestRemaining();
      setRestRemainingSeconds(remaining);
      if (remaining <= 0 && !isOnExecutePage) {
        handleRestComplete();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [restIsActive, recalcRestRemaining, handleRestComplete, isOnExecutePage]);

  // Quando fora da tela de execução: visibility change e pageshow - recalc e mostrar modal se descanso concluiu
  useEffect(() => {
    if (!session || isOnExecutePage) return;
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const remaining = recalcRestRemaining();
      setRestRemainingSeconds(remaining);
      if (remaining <= 0 && restEndsAt != null && restContext != null) {
        handleRestComplete();
      }
      if (restJustCompleted) {
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
  }, [session, isOnExecutePage, recalcRestRemaining, restEndsAt, restContext, handleRestComplete, restJustCompleted]);

  // Auto-close do modal de descanso concluído
  useEffect(() => {
    if (!restJustCompleted || !restModalOpen) return;
    if (document.visibilityState !== "visible") return;
    const t = setTimeout(() => {
      setRestModalOpen(false);
      setRestJustCompleted(false);
    }, 1500);
    return () => clearTimeout(t);
  }, [restJustCompleted, restModalOpen]);

  if (!isClient || !session || isOnExecutePage) return null;

  const bannerText = restIsActive
    ? `Descanso: ${formatRestTime(restRemainingSeconds)}`
    : "Treino em execução";

  return (
    <>
      <button
        type="button"
        onClick={() => setShowWorkoutPrompt(true)}
        className="sticky top-0 z-50 w-full py-2 px-4 bg-black text-white text-center text-sm font-medium hover:bg-neutral-800 transition-colors"
      >
        {bannerText}
      </button>

      {!isOnExecutePage && (
        <RestModal
          open={restModalOpen}
          onOpenChange={setRestModalOpen}
          restDuration={restDuration || 60}
          onRestDurationChange={() => {}}
          restRemainingSeconds={0}
          restTimerRunning={false}
          restJustCompleted={restJustCompleted}
          onRestStart={() => {}}
          onRestPause={() => {}}
        />
      )}
    </>
  );
}
