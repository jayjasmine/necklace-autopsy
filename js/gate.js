import { ALLOW_TEST_UNLOCK } from "./config.js";

const UNLOCK_KEY = "na_unlocked";
const DEV_KEY = "na_dev_unlock";

function bucket() {
  const probe = "__na_probe";
  try {
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    /* private mode or blocked storage */
  }
  try {
    sessionStorage.setItem(probe, "1");
    sessionStorage.removeItem(probe);
    return sessionStorage;
  } catch {
    /* fall through to memory; unlock will not survive a navigation */
  }
  const memory = new Map();
  return {
    getItem(key) {
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      memory.set(key, String(value));
    },
    removeItem(key) {
      memory.delete(key);
    },
  };
}

const store = bucket();

export function isUnlocked() {
  if (store.getItem(UNLOCK_KEY) === "1") return true;
  try {
    return sessionStorage.getItem(DEV_KEY) === "1";
  } catch {
    return false;
  }
}

export function grantUnlock() {
  store.setItem(UNLOCK_KEY, "1");
}

export function markPaidUnlock() {
  grantUnlock();
  try {
    sessionStorage.removeItem(DEV_KEY);
  } catch {
    /* ignore */
  }
}

export function clearUnlock() {
  store.removeItem(UNLOCK_KEY);
  try {
    sessionStorage.removeItem(DEV_KEY);
  } catch {
    /* ignore */
  }
}

export function hasDevUnlockParam() {
  return new URLSearchParams(location.search).get("unlocked") === "1";
}

/**
 * Dev unlock is only the explicit ?unlocked=1 query.
 * ALLOW_TEST_UNLOCK never unlocks a normal visit.
 */
export function applyDevUnlockFromQuery() {
  if (!hasDevUnlockParam()) return false;
  try {
    sessionStorage.setItem(DEV_KEY, "1");
  } catch {
    grantUnlock();
  }
  return true;
}

export function isDevUnlockSession() {
  try {
    return sessionStorage.getItem(DEV_KEY) === "1";
  } catch {
    return false;
  }
}

export function testUnlockControlVisible() {
  return ALLOW_TEST_UNLOCK === true;
}
