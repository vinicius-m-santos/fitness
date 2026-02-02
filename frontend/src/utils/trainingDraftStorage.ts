import type { TrainingDraft } from "@/types/trainingDraft";

const DB_NAME = "fitness-drafts";
const STORE_NAME = "training-draft";
const KEY = "current";
/** Fallback síncrono no unload (F5/fechar aba): o navegador não espera IndexedDB terminar */
const LOCAL_STORAGE_UNLOAD_KEY = "fitness-training-draft-unload";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/** Grava o rascunho de forma síncrona (localStorage). Usado no unload para não perder dados no F5. */
export function setTrainingDraftSync(draft: TrainingDraft): void {
  try {
    const payload = { ...draft, updatedAt: Date.now() };
    localStorage.setItem(LOCAL_STORAGE_UNLOAD_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("setTrainingDraftSync failed:", e);
  }
}

export async function getTrainingDraft(): Promise<TrainingDraft | null> {
  const unloadJson = localStorage.getItem(LOCAL_STORAGE_UNLOAD_KEY);
  if (unloadJson) {
    try {
      const draft = JSON.parse(unloadJson) as TrainingDraft;
      // Escrever no IndexedDB antes de remover do localStorage, para que uma segunda
      // chamada (ex.: effect re-run por mudança de pathname) ainda encontre o rascunho
      await setTrainingDraft(draft);
      localStorage.removeItem(LOCAL_STORAGE_UNLOAD_KEY);
      return draft;
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_UNLOAD_KEY);
    }
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(KEY);
    req.onerror = (e) => {
      console.error("getTrainingDraft: read failed:", (e.target as IDBRequest).error);
      db.close();
      reject((e.target as IDBRequest).error);
    };
    req.onsuccess = () => {
      db.close();
      resolve(req.result ?? null);
    };
  });
}

export async function setTrainingDraft(draft: TrainingDraft): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(
      { ...draft, updatedAt: Date.now() },
      KEY
    );
    req.onerror = (e) => {
      db.close();
      reject((e.target as IDBRequest).error);
    };
    req.onsuccess = () => {
      db.close();
      resolve();
    };
  });
}

export async function clearTrainingDraft(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_UNLOAD_KEY);
  } catch {}
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(KEY);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      db.close();
      resolve();
    };
  });
}

export const TRAINING_DRAFT_CLEARED_EVENT = "training-draft-cleared";

export function notifyTrainingDraftCleared(): void {
  window.dispatchEvent(new CustomEvent(TRAINING_DRAFT_CLEARED_EVENT));
}
