const DB_NAME = "fitness_edit_deadlines";
const STORE_NAME = "deadlines";

export type EditDeadlineEntry = {
  executionId: number;
  /** Timestamp (ms) até quando o aluno pode editar/excluir = finishedAt + 24h */
  deadlineAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: "executionId" });
    };
  });
}

export async function getEditDeadline(executionId: number): Promise<EditDeadlineEntry | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(executionId);
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
    req.onsuccess = () => {
      db.close();
      resolve(req.result ?? null);
    };
  });
}

export async function setEditDeadline(entry: EditDeadlineEntry): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(entry);
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

export async function removeEditDeadline(executionId: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(executionId);
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

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Gera deadline (timestamp ms) a partir de finishedAt ISO. */
export function deadlineFromFinishedAt(finishedAtIso: string): number {
  return new Date(finishedAtIso).getTime() + EDIT_WINDOW_MS;
}
