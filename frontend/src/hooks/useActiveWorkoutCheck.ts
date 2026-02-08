"use client";

import { useState, useEffect } from "react";
import { useWorkoutSessionStore, type WorkoutSession } from "@/stores/workoutSessionStore";

type UseActiveWorkoutCheckOptions = {
  trainingId?: string | null;
  periodId?: string | null;
  onFinished?: () => void;
};

type UseActiveWorkoutCheckResult = {
  checkDone: boolean;
  showPrompt: boolean;
  session: WorkoutSession | null;
  periodName: string;
  setShowPrompt: (v: boolean) => void;
  clearSession: () => void;
};

export function useWorkoutSessionHasHydrated(): boolean {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    const unsub = useWorkoutSessionStore.persist?.onFinishHydration?.(() => {
      setHasHydrated(true);
    });
    if (useWorkoutSessionStore.persist?.hasHydrated?.()) {
      setHasHydrated(true);
    }
    return () => {
      unsub?.();
    };
  }, []);
  return hasHydrated;
}

export function useActiveWorkoutCheck({
  trainingId,
  periodId,
}: UseActiveWorkoutCheckOptions): UseActiveWorkoutCheckResult {
  const hasHydrated = useWorkoutSessionHasHydrated();
  const [checkDone, setCheckDone] = useState(false);
  const session = useWorkoutSessionStore((s) => s.session);
  const showPrompt = useWorkoutSessionStore((s) => s.showWorkoutPrompt);
  const setShowPrompt = useWorkoutSessionStore((s) => s.setShowWorkoutPrompt);
  const clearSessionStore = useWorkoutSessionStore((s) => s.clearSession);

  useEffect(() => {
    if (hasHydrated) setCheckDone(true);
  }, [hasHydrated]);

  // Nunca auto-mostrar o prompt. O prompt é exibido apenas ao clicar na barra superior (WorkoutActiveBanner).

  const periodName = session?.periodName ?? `Período ${session?.periodId ?? ""}`;
  const clearSession = () => clearSessionStore();

  return {
    checkDone,
    showPrompt,
    session,
    periodName,
    setShowPrompt,
    clearSession,
  };
}
