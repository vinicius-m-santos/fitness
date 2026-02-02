import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { TrainingCreateSchema } from "@/schemas/training";
import type { TrainingDraft, TrainingDraftType } from "@/types/trainingDraft";
import {
  setTrainingDraft,
  setTrainingDraftSync,
  getTrainingDraft,
  TRAINING_DRAFT_CLEARED_EVENT,
} from "@/utils/trainingDraftStorage";

const DEBOUNCE_MS = 300;
/** Debounce menor no subscribe para persistir logo após adicionar exercício ou alterar campo */
const SUBSCRIBE_DEBOUNCE_MS = 100;

type UseTrainingDraftOptions = {
  type: TrainingDraftType;
  clientId?: number;
  trainingId?: number;
  enabled: boolean;
  step: number;
  /** Valores atuais do formulário (ex.: form.watch()) — usados para disparar o efeito de save */
  formData: TrainingCreateSchema;
  /** Retorna os valores atuais no momento do save; se passado, o rascunho usa sempre o estado mais recente */
  getFormData?: () => TrainingCreateSchema;
  selectedExerciseByPeriod: Record<number, { id: number; name: string } | null>;
  /** subscribe do useForm — quando passado, o rascunho é salvo a cada alteração de valores (sem depender de re-render) */
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const getFormDataRef = useRef(getFormData);
  getFormDataRef.current = getFormData;
  const stepRef = useRef(step);
  const selectedRef = useRef(selectedExerciseByPeriod);
  stepRef.current = step;
  selectedRef.current = selectedExerciseByPeriod;

  const buildDraft = useCallback((): TrainingDraft => {
    const currentFormData = getFormDataRef.current?.() ?? formData;
    const draft: TrainingDraft = {
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
    const draft = buildDraft();
    lastSavedRef.current = JSON.stringify({
      step: stepRef.current,
      formData: draft.formData,
      selectedExerciseByPeriod: selectedRef.current,
    });
    setTrainingDraft(draft).catch((e) => console.error("setTrainingDraft failed:", e));
  }, [buildDraft]);

  const saveSync = useCallback(() => {
    const draft = buildDraft();
    setTrainingDraftSync(draft);
  }, [buildDraft]);

  const flushDraft = useCallback(() => {
    save();
  }, [save]);

  useEffect(() => {
    if (!enabled) return;
    const key = JSON.stringify({ step, formData, selectedExerciseByPeriod });
    if (key === lastSavedRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      lastSavedRef.current = key;
      save();
    }, DEBOUNCE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, step, formData, selectedExerciseByPeriod, save]);

  useEffect(() => {
    if (!enabled || !formSubscribe) return;
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
  }, [enabled, formSubscribe, save]);

  // Ao recarregar (F5) ou fechar aba: gravação síncrona em localStorage para não perder dados
  // (IndexedDB é assíncrono e o navegador não espera terminar antes de descarregar a página)
  useEffect(() => {
    if (!enabled) return;
    const handler = () => {
      saveSync();
    };
    window.addEventListener("pagehide", handler);
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("pagehide", handler);
      window.removeEventListener("beforeunload", handler);
    };
  }, [enabled, saveSync]);

  return { flushDraft };
}

export type UseContinueTrainingDraftResult = {
  draft: TrainingDraft | null;
  showPrompt: boolean;
  onContinue: () => void;
  onDiscard: () => void;
};

/** Flag no sessionStorage: setado no beforeunload para detectar F5 e ignorar state do bfcache */
const RELOAD_FLAG_KEY = "training-draft-reload";

export function useContinueTrainingDraft(): UseContinueTrainingDraftResult {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { restoreTrainingDraft?: TrainingDraft } | null;
  const [draft, setDraft] = useState<TrainingDraft | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const clearedStateForReloadRef = useRef(false);

  useEffect(() => {
    const handler = () => {
      try {
        sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
      } catch {}
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    clearedStateForReloadRef.current = false;
    const isReload = typeof sessionStorage !== "undefined" && sessionStorage.getItem(RELOAD_FLAG_KEY);
    if (isReload) {
      try {
        sessionStorage.removeItem(RELOAD_FLAG_KEY);
      } catch {}
      navigate(location.pathname, { replace: true, state: {} });
      clearedStateForReloadRef.current = true;
    }
    getTrainingDraft().then((d) => {
      if (!cancelled && d && (clearedStateForReloadRef.current || !locationState?.restoreTrainingDraft)) {
        setDraft(d);
        setShowPrompt(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [location.pathname, locationState?.restoreTrainingDraft, navigate]);

  useEffect(() => {
    const handler = () => {
      setDraft(null);
      setShowPrompt(false);
    };
    window.addEventListener(TRAINING_DRAFT_CLEARED_EVENT, handler);
    return () => window.removeEventListener(TRAINING_DRAFT_CLEARED_EVENT, handler);
  }, []);

  const onContinue = () => {
    if (!draft) return;
    setShowPrompt(false);
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
    setDraft(null);
    setShowPrompt(false);
  };

  return { draft, showPrompt, onContinue, onDiscard };
}
