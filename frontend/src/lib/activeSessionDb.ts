const DB_NAME = "fitness";
const STORE_NAME = "activeSession";
const KEY = "session";

export type ActiveSessionData = {
  executionId: number;
  trainingId: number;
  periodId: number;
  /** Nome do período/treino para exibir na tela "Continuar treino". */
  periodName?: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  restStartedAt: number | null;
  restDuration: number | null;
  currentTimedPeriodExerciseId: number | null;
  exerciseStartedAt: number | null;
  exerciseElapsedSeconds: Record<number, number>;
  exerciseExecutionIds: Record<number, number>;
  exerciseFinalized: Record<number, boolean>;
  executionOrderCounter: number;
  lastRestSeconds: number | null;
  restDurationValue: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: "key" });
    };
  });
}

export async function getActiveSession(): Promise<ActiveSessionData | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(KEY);
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
    req.onsuccess = () => {
      db.close();
      resolve(req.result?.value ?? null);
    };
  });
}

export async function setActiveSession(data: ActiveSessionData | null): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    if (data == null) {
      store.delete(KEY);
    } else {
      store.put({ key: KEY, value: data });
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function clearActiveSession(): Promise<void> {
  return setActiveSession(null);
}
