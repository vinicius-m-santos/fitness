import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

export type SetExecutionLocal = {
  setNumber: number;
  loadKg: number | null;
  restSeconds: number | null;
};

export type ExerciseExecutionLocal = {
  periodExerciseId: number;
  executionOrder: number;
  durationSeconds: number | null;
  sets: SetExecutionLocal[];
};

export type WorkoutSession = {
  trainingId: number;
  periodId: number;
  periodName: string;
  startedAt: number;
  exerciseExecutions: Record<number, ExerciseExecutionLocal>;
  executionOrderCounter: number;
  lastRestSeconds: number | null;
  restDurationValue: number;
  restStartedAt: number | null;
  restDuration: number | null;
  /** Timestamp (ms) em que o descanso termina. restStartedAt + restDuration*1000. */
  restEndsAt: number | null;
  /** Contexto do descanso para salvar ao concluir (ex: após restore/coldStart). */
  restContext: { periodExerciseId: number; setNumber: number } | null;
  currentTimedPeriodExerciseId: number | null;
  exerciseStartedAt: number | null;
  exerciseFinalized: Record<number, boolean>;
  currentExerciseIndex: number;
  currentSetIndex: number;
  /** Duração acumulada de execuções anteriores (ex: ao reiniciar treino do histórico). */
  previousDurationSeconds?: number;
  /** ID da execução a ser atualizada (ao reiniciar treino do histórico). */
  executionId?: number;
};

const ACTIVE_SESSION_KEY = "fitness-active-session";

const idbStorage = {
  getItem: async (): Promise<string | null> => {
    if (typeof indexedDB === "undefined") return null;
    try {
      const value = await get(ACTIVE_SESSION_KEY);
      return value ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (_: string, value: string): Promise<void> => {
    if (typeof indexedDB === "undefined") return;
    try {
      await set(ACTIVE_SESSION_KEY, value);
    } catch {
      // ignore
    }
  },
  removeItem: async (): Promise<void> => {
    if (typeof indexedDB === "undefined") return;
    try {
      await del(ACTIVE_SESSION_KEY);
    } catch {
      // ignore
    }
  },
};

type WorkoutSessionState = WorkoutSession | null;

type WorkoutSessionStore = {
  session: WorkoutSessionState;
  showWorkoutPrompt: boolean;
  setShowWorkoutPrompt: (v: boolean) => void;
  initSession: (params: {
    trainingId: number;
    periodId: number;
    periodName: string;
    lastRestSeconds: number | null;
    restDurationValue: number;
  }) => void;
  addExerciseExecution: (periodExerciseId: number, seriesCount: number, lastLoads?: { setNumber: number; loadKg: number | null }[]) => void;
  removeExerciseExecution: (periodExerciseId: number) => void;
  updateLoads: (periodExerciseId: number, sets: SetExecutionLocal[]) => void;
  updateSetRest: (periodExerciseId: number, setNumber: number, restSeconds: number) => void;
  setDuration: (periodExerciseId: number, durationSeconds: number) => void;
  setFinalized: (periodExerciseId: number, finalized: boolean) => void;
  setLastRestSeconds: (seconds: number) => void;
  setRestDurationValue: (value: number) => void;
  setCurrentExerciseIndex: (index: number) => void;
  setCurrentSetIndex: (index: number) => void;
  setRestTimer: (params: {
    restStartedAt: number | null;
    restDuration: number | null;
    restContext?: { periodExerciseId: number; setNumber: number } | null;
  }) => void;
  setTimedExercise: (params: { periodExerciseId: number | null; exerciseStartedAt: number | null }) => void;
  getPayloadForFinish: () => {
    executionId?: number;
    trainingId: number;
    periodId: number;
    startedAt: string;
    finishedAt: string;
    exerciseExecutions: {
      periodExerciseId: number;
      executionOrder: number;
      durationSeconds: number | null;
      sets: { setNumber: number; loadKg: number | null; restSeconds: number | null }[];
    }[];
  } | null;
  clearSession: () => void;
  restoreFromHistory: (item: {
    id: number;
    trainingId: number;
    periodId: number;
    periodName: string;
    startedAt: string;
    totalDurationSeconds: number;
    exerciseExecutions: {
      periodExerciseId: number;
      durationSeconds: number | null;
      executed: boolean;
      sets: { setNumber: number; loadKg: number | null; restSeconds?: number | null }[];
    }[];
  }) => void;
};

export const useWorkoutSessionStore = create<WorkoutSessionStore>()(
  persist(
    (set, get) => ({
      session: null,
      showWorkoutPrompt: false,

      setShowWorkoutPrompt(v) {
        set({ showWorkoutPrompt: v });
      },

      initSession(params) {
        set({
          session: {
            trainingId: params.trainingId,
            periodId: params.periodId,
            periodName: params.periodName,
            startedAt: Date.now(),
            exerciseExecutions: {},
            executionOrderCounter: 1,
            lastRestSeconds: params.lastRestSeconds,
            restDurationValue: params.restDurationValue,
            restStartedAt: null,
            restDuration: null,
            restEndsAt: null,
            restContext: null,
            currentTimedPeriodExerciseId: null,
            exerciseStartedAt: null,
            exerciseFinalized: {},
            currentExerciseIndex: 0,
            currentSetIndex: 0,
          },
        });
      },

      removeExerciseExecution(periodExerciseId) {
        const s = get().session;
        if (!s) return;
        const next = { ...s.exerciseExecutions };
        delete next[periodExerciseId];
        const nextFinalized = { ...s.exerciseFinalized };
        delete nextFinalized[periodExerciseId];
        set({
          session: {
            ...s,
            exerciseExecutions: next,
            exerciseFinalized: nextFinalized,
          },
        });
      },

      addExerciseExecution(periodExerciseId, seriesCount, lastLoads = []) {
        const s = get().session;
        if (!s) return;
        const order = s.executionOrderCounter;
        const loadMap: Record<number, number | null> = {};
        for (let i = 1; i <= seriesCount; i++) {
          loadMap[i] = 0;
        }
        lastLoads.forEach((l) => {
          loadMap[l.setNumber] = l.loadKg ?? 0;
        });
        const sets: SetExecutionLocal[] = Array.from({ length: seriesCount }, (_, i) => ({
          setNumber: i + 1,
          loadKg: loadMap[i + 1] ?? 0,
          restSeconds: null,
        }));
        set({
          session: {
            ...s,
            exerciseExecutions: {
              ...s.exerciseExecutions,
              [periodExerciseId]: {
                periodExerciseId,
                executionOrder: order,
                durationSeconds: null,
                sets,
              },
            },
            executionOrderCounter: order + 1,
          },
        });
      },

      updateLoads(periodExerciseId, sets) {
        const s = get().session;
        if (!s || !s.exerciseExecutions[periodExerciseId]) return;
        const existing = s.exerciseExecutions[periodExerciseId].sets;
        const merged = sets.map((ns) => {
          const ex = existing.find((e) => e.setNumber === ns.setNumber);
          return { ...ns, restSeconds: ex?.restSeconds ?? ns.restSeconds };
        });
        set({
          session: {
            ...s,
            exerciseExecutions: {
              ...s.exerciseExecutions,
              [periodExerciseId]: {
                ...s.exerciseExecutions[periodExerciseId],
                sets: merged,
              },
            },
          },
        });
      },

      updateSetRest(periodExerciseId, setNumber, restSeconds) {
        const s = get().session;
        if (!s || !s.exerciseExecutions[periodExerciseId]) return;
        const ee = s.exerciseExecutions[periodExerciseId];
        const sets = ee.sets.map((x) =>
          x.setNumber === setNumber ? { ...x, restSeconds } : x
        );
        set({
          session: {
            ...s,
            exerciseExecutions: {
              ...s.exerciseExecutions,
              [periodExerciseId]: { ...ee, sets },
            },
            lastRestSeconds: restSeconds,
          },
        });
      },

      setDuration(periodExerciseId, durationSeconds) {
        const s = get().session;
        if (!s || !s.exerciseExecutions[periodExerciseId]) return;
        set({
          session: {
            ...s,
            exerciseExecutions: {
              ...s.exerciseExecutions,
              [periodExerciseId]: {
                ...s.exerciseExecutions[periodExerciseId],
                durationSeconds,
              },
            },
          },
        });
      },

      setFinalized(periodExerciseId, finalized) {
        const s = get().session;
        if (!s) return;
        set({
          session: {
            ...s,
            exerciseFinalized: { ...s.exerciseFinalized, [periodExerciseId]: finalized },
          },
        });
      },

      setLastRestSeconds(seconds) {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, lastRestSeconds: seconds } });
      },

      setRestDurationValue(value) {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, restDurationValue: value } });
      },

      setCurrentExerciseIndex(index) {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, currentExerciseIndex: index, currentSetIndex: 0 } });
      },

      setCurrentSetIndex(index) {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, currentSetIndex: index } });
      },

      setRestTimer(params) {
        const s = get().session;
        if (!s) return;
        const restStartedAt = params.restStartedAt;
        const restDuration = params.restDuration;
        const restEndsAt =
          restStartedAt != null && restDuration != null
            ? restStartedAt + restDuration * 1000
            : null;
        const restContext =
          restStartedAt != null ? (params.restContext ?? null) : null;
        set({
          session: {
            ...s,
            restStartedAt,
            restDuration,
            restEndsAt,
            restContext,
          },
        });
      },

      setTimedExercise(params) {
        const s = get().session;
        if (!s) return;
        set({
          session: {
            ...s,
            currentTimedPeriodExerciseId: params.periodExerciseId,
            exerciseStartedAt: params.exerciseStartedAt,
          },
        });
      },

      getPayloadForFinish() {
        const s = get().session;
        if (!s) return null;
        const finishedAt = Date.now();
        const prevDuration = (s as { previousDurationSeconds?: number }).previousDurationSeconds ?? 0;
        const executionId = (s as { executionId?: number }).executionId;
        const currentDurationSec = Math.floor((finishedAt - s.startedAt) / 1000);
        const totalDurationSec = prevDuration + currentDurationSec;
        const startedAt = new Date(finishedAt - totalDurationSec * 1000).toISOString();
        const exerciseExecutions = Object.values(s.exerciseExecutions).map((ee) => ({
          periodExerciseId: ee.periodExerciseId,
          executionOrder: ee.executionOrder,
          durationSeconds: ee.durationSeconds,
          sets: ee.sets.map((x) => ({
            setNumber: x.setNumber,
            loadKg: x.loadKg,
            restSeconds: x.restSeconds,
          })),
        }));
        const payload: {
          executionId?: number;
          trainingId: number;
          periodId: number;
          startedAt: string;
          finishedAt: string;
          lastRestSeconds?: number | null;
          exerciseExecutions: { periodExerciseId: number; executionOrder: number; durationSeconds: number | null; sets: { setNumber: number; loadKg: number | null; restSeconds: number | null }[] }[];
        } = {
          trainingId: s.trainingId,
          periodId: s.periodId,
          startedAt,
          finishedAt: new Date(finishedAt).toISOString(),
          exerciseExecutions,
        };
        if (executionId != null) payload.executionId = executionId;
        if (s.lastRestSeconds != null) payload.lastRestSeconds = s.lastRestSeconds;
        return payload;
      },

      clearSession() {
        set({ session: null, showWorkoutPrompt: false });
      },

      restoreFromHistory(item) {
        const executedEes = item.exerciseExecutions.filter((ee) => ee.executed);
        let lastRestSeconds = 60;
        for (const ee of executedEes) {
          for (const s of ee.sets) {
            if (s.restSeconds != null && s.restSeconds > 0) {
              lastRestSeconds = s.restSeconds;
            }
          }
        }
        const exerciseExecutions: Record<number, ExerciseExecutionLocal> = {};
        const exerciseFinalized: Record<number, boolean> = {};
        let order = 1;
        for (const ee of item.exerciseExecutions) {
          if (ee.executed) {
            const sets: SetExecutionLocal[] = ee.sets.map((s) => ({
              setNumber: s.setNumber,
              loadKg: s.loadKg ?? 0,
              restSeconds: s.restSeconds ?? null,
            }));
            exerciseExecutions[ee.periodExerciseId] = {
              periodExerciseId: ee.periodExerciseId,
              executionOrder: order++,
              durationSeconds: ee.durationSeconds,
              sets,
            };
            exerciseFinalized[ee.periodExerciseId] = true;
          } else {
            exerciseFinalized[ee.periodExerciseId] = false;
          }
        }
        const firstNotExecutedIdx = item.exerciseExecutions.findIndex((ee) => !ee.executed);
        const currentExerciseIndex =
          firstNotExecutedIdx >= 0 ? firstNotExecutedIdx : Math.max(0, item.exerciseExecutions.length - 1);
        const now = Date.now();
        set({
          session: {
            trainingId: item.trainingId,
            periodId: item.periodId,
            periodName: item.periodName,
            startedAt: now,
            previousDurationSeconds: item.totalDurationSeconds,
            executionId: item.id,
            exerciseExecutions,
            executionOrderCounter: order,
            lastRestSeconds,
            restDurationValue: lastRestSeconds,
            restStartedAt: null,
            restDuration: null,
            restEndsAt: null,
            restContext: null,
            currentTimedPeriodExerciseId: null,
            exerciseStartedAt: null,
            exerciseFinalized,
            currentExerciseIndex,
            currentSetIndex: 0,
          },
        });
      },
    }),
    {
      name: "workout-session",
      storage: {
        getItem: async () => {
          const str = await idbStorage.getItem();
          return str ? { state: { session: JSON.parse(str) }, version: 0 } : { state: { session: null }, version: 0 };
        },
        setItem: async () => {
          const session = useWorkoutSessionStore.getState().session;
          if (session != null) {
            await idbStorage.setItem("", JSON.stringify(session));
          } else {
            await idbStorage.removeItem();
          }
        },
        removeItem: async () => idbStorage.removeItem(),
      },
      partialize: (state) => ({ session: state.session }),
    }
  )
);
