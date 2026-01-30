"use client";

import { useState, useEffect, useRef } from "react";
import { getActiveSession } from "@/lib/activeSessionDb";
import type { ActiveSessionData } from "@/lib/activeSessionDb";

export type ExecutionFromApi = {
  id: number;
  finishedAt: string | null;
  trainingId: number;
  exerciseExecutions: {
    id: number;
    periodExerciseId: number;
    executionOrder: number;
    durationSeconds: number | null;
  }[];
};

type UseActiveWorkoutCheckOptions = {
  /** Quando informados, só considera sessão que bata com este treino/período (ex.: página execute). */
  trainingId?: string | null;
  periodId?: string | null;
  /** Função que faz a requisição GET /training-execution/:id */
  request: (opts: { method: string; url: string }) => Promise<ExecutionFromApi>;
  /** Chamado quando a execução está finalizada (redirecionar e limpar). */
  onFinished?: () => void;
};

type UseActiveWorkoutCheckResult = {
  checkDone: boolean;
  showPrompt: boolean;
  session: ActiveSessionData | null;
  execution: ExecutionFromApi | null;
  periodName: string;
  setShowPrompt: (v: boolean) => void;
  clearSession: () => void;
};

/**
 * Verifica se há treino ativo no IndexedDB e valida no backend.
 * - Na página execute (trainingId + periodId): só mostra prompt se a sessão for do mesmo treino/período.
 * - Em outras páginas (sem trainingId/periodId): mostra prompt para qualquer sessão ativa.
 */
export function useActiveWorkoutCheck({
  trainingId,
  periodId,
  request,
  onFinished,
}: UseActiveWorkoutCheckOptions): UseActiveWorkoutCheckResult {
  const [checkDone, setCheckDone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [session, setSession] = useState<ActiveSessionData | null>(null);
  const [execution, setExecution] = useState<ExecutionFromApi | null>(null);
  const [periodName, setPeriodName] = useState("");
  const hasRunRef = useRef(false);

  const clearSession = () => {
    setSession(null);
    setExecution(null);
    setShowPrompt(false);
  };

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    getActiveSession()
      .then((s) => {
        if (!s) {
          setCheckDone(true);
          return;
        }
        const matchUrl =
          trainingId != null &&
          periodId != null &&
          s.trainingId === Number(trainingId) &&
          s.periodId === Number(periodId);
        if (trainingId != null && periodId != null && !matchUrl) {
          setCheckDone(true);
          return;
        }
        return request({
          method: "GET",
          url: `/training-execution/${s.executionId}`,
        }).then((data) => {
          setCheckDone(true);
          if (data.finishedAt != null) {
            onFinished?.();
            return;
          }
          setSession(s);
          setExecution(data);
          setPeriodName(s.periodName ?? `Período ${s.periodId}`);
          setShowPrompt(true);
        });
      })
      .catch(() => setCheckDone(true));
  }, [trainingId, periodId, request]);

  return {
    checkDone,
    showPrompt,
    session,
    execution,
    periodName,
    setShowPrompt,
    clearSession,
  };
}
