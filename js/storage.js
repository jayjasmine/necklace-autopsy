const DB_NAME = "necklace-autopsy";
const DB_VERSION = 1;
const STORE = "session";
const KEY = "current";

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("storage-blocked"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("storage-blocked"));
  });
}

function run(mode, fn) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        let settled = false;
        let result;
        const finish = (settle) => {
          if (settled) return;
          settled = true;
          try {
            db.close();
          } catch {
            /* already closing */
          }
          settle();
        };
        const tx = db.transaction(STORE, mode);
        const request = fn(tx.objectStore(STORE));
        request.onsuccess = () => {
          result = request.result;
        };
        tx.oncomplete = () => finish(() => resolve(result));
        tx.onerror = () => finish(() => reject(tx.error || new Error("storage-blocked")));
        tx.onabort = () => finish(() => reject(tx.error || new Error("storage-blocked")));
      })
  );
}

export function saveSession(record) {
  return run("readwrite", (store) => store.put(record, KEY)).then(() => undefined);
}

export function loadSession() {
  return run("readonly", (store) => store.get(KEY)).then((value) => value || null);
}

export function clearSession() {
  return run("readwrite", (store) => store.delete(KEY)).then(() => undefined);
}
