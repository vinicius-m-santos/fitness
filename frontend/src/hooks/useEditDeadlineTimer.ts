import { useState, useEffect, useCallback } from "react";
import {
  getEditDeadline,
  setEditDeadline,
  removeEditDeadline,
  deadlineFromFinishedAt,
} from "@/lib/editDeadlineDb";

type Options = {
  executionId: number;
  finishedAtIso: string;
  onExpired?: () => void;
};

/**
 * Timer de prazo para edição (24h após finalização).
 * Usa timestamp e IndexedDB para consistência ao reabrir a aba ou o app.
 */
export function useEditDeadlineTimer({
  executionId,
  finishedAtIso,
  onExpired,
}: Options): { remainingSeconds: number; canEdit: boolean } {
  const [deadlineAt, setDeadlineAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Carrega ou persiste deadline no IndexedDB
  useEffect(() => {
    let cancelled = false;
    getEditDeadline(executionId)
      .then((entry) => {
        if (cancelled) return;
        if (entry) {
          setDeadlineAt(entry.deadlineAt);
          return;
        }
        const at = deadlineFromFinishedAt(finishedAtIso);
        setDeadlineAt(at);
        setEditDeadline({ executionId, deadlineAt: at }).catch(() => {});
      })
      .catch(() => {
        if (cancelled) return;
        const at = deadlineFromFinishedAt(finishedAtIso);
        setDeadlineAt(at);
      });
    return () => {
      cancelled = true;
    };
  }, [executionId, finishedAtIso]);

  const recalc = useCallback(() => {
    if (deadlineAt == null) return;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((deadlineAt - now) / 1000));
    setRemainingSeconds(remaining);
    if (remaining <= 0) {
      removeEditDeadline(executionId).catch(() => {});
      onExpired?.();
    }
  }, [deadlineAt, executionId, onExpired]);

  useEffect(() => {
    if (deadlineAt == null) return;
    recalc();
    const t = setInterval(recalc, 1000);
    return () => clearInterval(t);
  }, [deadlineAt, recalc]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") recalc();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [recalc]);

  const canEdit = remainingSeconds > 0;
  return { remainingSeconds, canEdit };
}

export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return "0h 0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
