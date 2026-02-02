import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { TrainingCreateSchema } from "@/schemas/training";
import type { TrainingDraftType } from "@/types/trainingDraft";
import {
  useWorkoutDraftStore,
  getDraftContextKey,
  getAnyValidDraft,
  hasAtLeastOneField,
  type WorkoutDraft,
  type DraftContextKey,
} from "@/stores/workoutDraftStore";

const DEBOUNCE_MS = 300;
const SUBSCRIBE_DEBOUNCE_MS = 100;

/**
 * Cold start = carregamento completo da página (navegação ou reload).
 * Retorna true apenas quando o documento foi carregado por type === 'navigate' ou 'reload',
 * nunca quando o draft foi atualizado na mesma sessão (setField).
 */
function isColdStart(): boolean {
  if (typeof performance === "undefined" || !performance.getEntriesByType) return false;
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const type = nav?.type;
  return type === "navigate" || type === "reload";
}

/** Retorna true somente após a store persistida ter sido hidratada. Usado para bloquear escrita antes da hidratação. */
export function useWorkoutDraftHasHydrated(): boolean {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    const unsub = useWorkoutDraftStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    if (useWorkoutDraftStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return unsub;
  }, []);
  return hasHydrated;
}

type UseTrainingDraftOptions = {
  type: TrainingDraftType;
  clientId?: number;
  trainingId?: number;
  enabled: boolean;
  step: number;
  formData: TrainingCreateSchema;
  getFormData?: () => TrainingCreateSchema;
  selectedExerciseByPeriod: Record<number, { id: number; name: string } | null>;
  formSubscribe?: (callback: () => void) => () => void;
};

export function useTrainingDraft({
  type,
  clientId,
  trainingId,
  enabled,
  step,
  formData,
  getFormData,
  selectedExerciseByPeriod,
  formSubscribe,
}: UseTrainingDraftOptions): { flushDraft: () => void } {
  const hasHydrated = useWorkoutDraftHasHydrated();
  const contextKey = getDraftContextKey(type, { clientId, trainingId });
  const setDraft = useWorkoutDraftStore((s) => s.setDraft);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const getFormDataRef = useRef(getFormData);
  getFormDataRef.current = getFormData;
  const stepRef = useRef(step);
  const selectedRef = useRef(selectedExerciseByPeriod);
  stepRef.current = step;
  selectedRef.current = selectedExerciseByPeriod;

  /** Só permite escrita na store após hidratação para não sobrescrever draft com useState vazio. */
  const draftEnabled = enabled && hasHydrated;

  useEffect(() => {
    if (!draftEnabled) return;
    lastSavedRef.current = "";
  }, [draftEnabled]);  

  const buildDraft = useCallback((): WorkoutDraft => {
    const currentFormData = getFormDataRef.current?.() ?? formData;
    const draft: WorkoutDraft = {
      type,
      step: stepRef.current,
      formData: currentFormData,
      selectedExerciseByPeriod: { ...selectedRef.current },
      updatedAt: Date.now(),
    };
    if (clientId != null) draft.clientId = clientId;
    if (trainingId != null) draft.trainingId = trainingId;
    return draft;
  }, [type, clientId, trainingId, step, formData, selectedExerciseByPeriod]);

  const save = useCallback(() => {
    if (!hasHydrated) return;
  
    const draft = buildDraft();
  
    // Nunca sobrescrever draft válido com vazio
    if (!hasAtLeastOneField(draft)) return;
  
    const snapshot = JSON.stringify({
      step: draft.step,
      formData: draft.formData,
      selectedExerciseByPeriod: draft.selectedExerciseByPeriod,
    });
  
    lastSavedRef.current = snapshot;
  
    setDraft(contextKey as DraftContextKey, draft);
  }, [buildDraft, contextKey, setDraft, hasHydrated]);
  

  const flushDraft = useCallback(() => {
    if (hasHydrated) save();
  }, [save, hasHydrated]);

  useEffect(() => {
    if (!draftEnabled) return;
  
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      save();
    }, DEBOUNCE_MS);
  
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [draftEnabled, step, formData, selectedExerciseByPeriod, save]);  

  useEffect(() => {
    if (!draftEnabled || !formSubscribe) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const unsub = formSubscribe(() => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        timeoutId = null;
        save();
      }, SUBSCRIBE_DEBOUNCE_MS);
    });
    return () => {
      unsub();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [draftEnabled, formSubscribe, save]);

  return { flushDraft };
}

export type UseContinueTrainingDraftResult = {
  draft: WorkoutDraft | null;
  contextKey: string | null;
  showPrompt: boolean;
  hasHydrated: boolean;
  onContinue: () => void;
  onDiscard: () => void;
};

export function useContinueTrainingDraft(): UseContinueTrainingDraftResult {
  const navigate = useNavigate();
  const location = useLocation();
  const clearDraft = useWorkoutDraftStore((s) => s.clearDraft);
  const hasHydrated = useWorkoutDraftHasHydrated();
  const [promptDraft, setPromptDraft] = useState<{
    draft: WorkoutDraft;
    contextKey: string;
  } | null>(null);
  const locationState = location.state as { restoreTrainingDraft?: WorkoutDraft } | null;
  const hasRestoreInStateRef = useRef(!!locationState?.restoreTrainingDraft);
  hasRestoreInStateRef.current = !!locationState?.restoreTrainingDraft;

  // Prompt independente da rota: qualquer draft válido exibe o prompt (usuário deve finalizar ou descartar).
  useEffect(() => {
    const unsub = useWorkoutDraftStore.persist.onFinishHydration(() => {
      if (!isColdStart()) return;
      if (hasRestoreInStateRef.current) return;
      setTimeout(() => {
        const currentDrafts = useWorkoutDraftStore.getState().drafts;
        const result = getAnyValidDraft(currentDrafts);
        setPromptDraft(result);
      }, 0);
    });

    if (useWorkoutDraftStore.persist.hasHydrated()) {
      if (isColdStart() && hasRestoreInStateRef.current) {
        const currentDrafts = useWorkoutDraftStore.getState().drafts;
        const result = getAnyValidDraft(currentDrafts);
        setPromptDraft(result);
      }
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (hasRestoreInStateRef.current) return;
    if (!isColdStart()) return;
    const currentDrafts = useWorkoutDraftStore.getState().drafts;
    const result = getAnyValidDraft(currentDrafts);
    setPromptDraft(result);
  }, [hasHydrated]);

  // Visibility / bfcache: reavaliar qualquer draft válido.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && hasHydrated && isColdStart()) {
        if (hasRestoreInStateRef.current) return;
        const currentDrafts = useWorkoutDraftStore.getState().drafts;
        const result = getAnyValidDraft(currentDrafts);
        if (result) setPromptDraft(result);
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && hasHydrated && isColdStart()) {
        if (hasRestoreInStateRef.current) return;
        const currentDrafts = useWorkoutDraftStore.getState().drafts;
        const result = getAnyValidDraft(currentDrafts);
        if (result) setPromptDraft(result);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [hasHydrated]);

  const onContinue = () => {
    if (!promptDraft) return;
    setPromptDraft(null);
    const { draft } = promptDraft;
    if (draft.type === "training-create" || draft.type === "training-update") {
      const clientId = draft.clientId ?? 0;
      navigate(`/client-view/${clientId}`, {
        state: { restoreTrainingDraft: draft },
        replace: false,
      });
    } else {
      navigate("/standard-trainings", {
        state: { restoreTrainingDraft: draft },
        replace: false,
      });
    }
  };

  const onDiscard = () => {
    if (promptDraft) {
      clearDraft(promptDraft.contextKey as DraftContextKey);
      setPromptDraft(null);
    }
  };

  return {
    draft: promptDraft?.draft ?? null,
    contextKey: promptDraft?.contextKey ?? null,
    showPrompt: hasHydrated && promptDraft != null,
    hasHydrated,
    onContinue,
    onDiscard,
  };
}
