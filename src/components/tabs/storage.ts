import { TABS } from "./tabs-data";
import type { TabsState } from "./types";

const STORAGE_KEY = "tabs-state";
const listeners = new Set<() => void>();

const defaultState = (): TabsState => ({
  order: TABS.map((tab) => tab.id),
  pinned: [],
});

function parse(raw: string | null): TabsState {
  if (!raw) return defaultState();

  try {
    const parsed = JSON.parse(raw) as TabsState;
    const knownIds = new Set(TABS.map((tab) => tab.id));
    const order = parsed.order.filter((id) => knownIds.has(id));
    const missing = TABS.map((tab) => tab.id).filter((id) => !order.includes(id));
    const pinned = parsed.pinned.filter((id) => knownIds.has(id));

    return { order: [...order, ...missing], pinned };
  } catch {
    return defaultState();
  }
}

let cachedRaw: string | null = null;
let cachedState: TabsState = defaultState();
const serverSnapshot: TabsState = defaultState();

export function getTabsSnapshot(): TabsState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parse(raw);
  }
  return cachedState;
}

export function getServerTabsSnapshot(): TabsState {
  return serverSnapshot;
}

export function subscribeTabsState(callback: () => void) {
  window.addEventListener("storage", callback);
  listeners.add(callback);
  return () => {
    window.removeEventListener("storage", callback);
    listeners.delete(callback);
  };
}

export function setTabsState(state: TabsState) {
  cachedRaw = JSON.stringify(state);
  cachedState = state;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  for (const listener of listeners) listener();
}
