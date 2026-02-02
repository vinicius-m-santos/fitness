import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import type { TrainingCreateSchema } from "@/schemas/training";
import type { TrainingDraftType } from "@/types/trainingDraft";

export type WorkoutDraft = {
  type: TrainingDraftType;
  step: number;
  formData: TrainingCreateSchema;
  selectedExerciseByPeriod: Record<number, { id: number; name: string } | null>;
  clientId?: number;
  trainingId?: number;
  /** Timestamp para exibir "há X min" e ordenação */
  updatedAt: number;
  /** true quando o draft foi salvo pelo formulário (não apenas key vazia). Usado para validade. */
  initialized?: boolean;
};

/** Retorna true se o draft tem ao menos um campo preenchido em data. Exportado para o hook não sobrescrever draft válido com vazio. */
export function hasAtLeastOneField(draft: WorkoutDraft): boolean {
  const name = draft.formData?.name?.trim();
  if (name && name.length > 0) return true;
  const periods = draft.formData?.periods;
  if (Array.isArray(periods) && periods.length > 0) return true;
  const sel = draft.selectedExerciseByPeriod;
  if (sel && typeof sel === "object" && Object.values(sel).some(Boolean)) return true;
  return false;
}

/** Um draft só é considerado válido se initialized === true e existir ao menos um campo preenchido. */
export function isValidDraft(draft: WorkoutDraft | null | undefined): draft is WorkoutDraft {
  if (!draft || typeof draft !== "object") return false;
  if (draft.initialized !== true) return false;
  return hasAtLeastOneField(draft);
}

const STORAGE_KEY = "workout-drafts";

const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof indexedDB === "undefined") return null;
    try {
      const value = await get(name);
      return value ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof indexedDB === "undefined") return;
    try {
      await set(name, value);
    } catch (e) {
      console.warn("workoutDraftStore setItem failed:", e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof indexedDB === "undefined") return;
    try {
      await del(name);
    } catch (e) {
      console.warn("workoutDraftStore removeItem failed:", e);
    }
  },
};

/** Context keys: one draft per context, isolated by route intent */
export type DraftContextKey =
  | "student-create"
  | `student-update:${number}`
  | "default-create"
  | `default-update:${number}`;

export function getDraftContextKey(
  type: TrainingDraftType,
  options?: { clientId?: number; trainingId?: number }
): DraftContextKey {
  switch (type) {
    case "training-create":
      return "student-create";
    case "training-update":
      return `student-update:${options?.trainingId ?? 0}`;
    case "training-standard-create":
      return "default-create";
    case "training-standard-update":
      return `default-update:${options?.trainingId ?? 0}`;
    default:
      return "student-create";
  }
}

type WorkoutDraftState = {
  drafts: Record<string, WorkoutDraft>;
  setDraft: (contextKey: DraftContextKey, draft: WorkoutDraft) => void;
  setField: (
    contextKey: DraftContextKey,
    payload: Partial<Pick<WorkoutDraft, "formData" | "selectedExerciseByPeriod" | "clientId" | "trainingId" | "type">>
  ) => void;
  setStep: (contextKey: DraftContextKey, step: number) => void;
  clearDraft: (contextKey: DraftContextKey) => void;
  getDraft: (contextKey: DraftContextKey) => WorkoutDraft | undefined;
};

export const useWorkoutDraftStore = create<WorkoutDraftState>()(
  persist(
    (set, get) => ({
      drafts: {},

      setDraft(contextKey, draft) {
        set((state) => ({
          drafts: {
            ...state.drafts,
            [contextKey]: {
              ...draft,
              updatedAt: Date.now(),
              initialized: true,
            },
          },
        }));
      },

      setField(contextKey, payload) {
        const current = get().drafts[contextKey];
        if (!current) return;
        set((state) => ({
          drafts: {
            ...state.drafts,
            [contextKey]: {
              ...current,
              ...payload,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      setStep(contextKey, step) {
        const current = get().drafts[contextKey];
        if (!current) return;
        set((state) => ({
          drafts: {
            ...state.drafts,
            [contextKey]: { ...current, step, updatedAt: Date.now() },
          },
        }));
      },

      clearDraft(contextKey) {
        set((state) => {
          const next = { ...state.drafts };
          delete next[contextKey];
          return { drafts: next };
        });
      },

      getDraft(contextKey) {
        return get().drafts[contextKey];
      },
    }),
    {
      name: STORAGE_KEY,
      storage: idbStorage,
      partialize: (state) => ({ drafts: state.drafts }),
    }
  )
);

/** Returns the best valid draft for the current route, or null. Only call after store has hydrated. */
export function getDraftForCurrentRoute(
  pathname: string,
  drafts: Record<string, WorkoutDraft>
): { draft: WorkoutDraft; contextKey: string } | null {
  const entries = Object.entries(drafts);
  if (entries.length === 0) return null;

  const pickValid = ([key, d]: [string, WorkoutDraft]) =>
    isValidDraft(d) ? { draft: d, contextKey: key } : null;

  if (pathname.startsWith("/client-view/")) {
    const clientIdMatch = pathname.match(/^\/client-view\/(\d+)/);
    const clientId = clientIdMatch ? Number(clientIdMatch[1]) : null;
    const forCreate =
      clientId != null
        ? entries.find(
            ([k, d]) => k === "student-create" && d.clientId === clientId
          )
        : null;
    const createResult = forCreate ? pickValid(forCreate) : null;
    if (createResult) return createResult;
    const forUpdate = entries.find(([k]) => k.startsWith("student-update:"));
    return forUpdate ? pickValid(forUpdate) : null;
  }

  if (pathname === "/standard-trainings" || pathname.startsWith("/standard-trainings")) {
    const forCreate = entries.find(([k]) => k === "default-create");
    const createResult = forCreate ? pickValid(forCreate) : null;
    if (createResult) return createResult;
    const forUpdate = entries.find(([k]) => k.startsWith("default-update:"));
    return forUpdate ? pickValid(forUpdate) : null;
  }

  return null;
}

/** Retorna qualquer draft válido (o mais recente por updatedAt). Independente da rota: se existir draft, o prompt pode ser mostrado. */
export function getAnyValidDraft(
  drafts: Record<string, WorkoutDraft>
): { draft: WorkoutDraft; contextKey: string } | null {
  const entries = Object.entries(drafts).filter(([, d]) => isValidDraft(d));
  if (entries.length === 0) return null;
  const [contextKey, draft] = entries.reduce<[string, WorkoutDraft]>(
    (best, [key, d]) =>
      (d.updatedAt ?? 0) > (best[1].updatedAt ?? 0) ? [key, d] : best,
    entries[0]
  );
  return { draft, contextKey };
}
