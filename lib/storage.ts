"use client";

// All app data lives in one versioned localStorage key. Components read it through
// useRoutineData(), which uses useSyncExternalStore so the server render (no storage)
// and the first client render agree, then updates as soon as storage is readable.

import { useSyncExternalStore } from "react";
import type { DayKey } from "./dates";
import type { TopicId } from "./fe-topics";

export type Region = "shoulder" | "lower";

export type StretchEntry = { id: string; date: DayKey; region: Region; seconds: number; createdAt: number };
export type StudyEntry = { id: string; date: DayKey; topic: TopicId; minutes: number; createdAt: number };
export type CalorieEntry = { id: string; date: DayKey; kind: "eaten" | "burned"; kcal: number; label: string; createdAt: number };

/** Last choices in each form, so they open where you left off. Day always resets to Today. */
export type Prefs = {
  studyTopic?: TopicId;
  /** The FE study Subtract switch; stays as you left it. */
  studySubtract?: boolean;
  stretchRegion?: Region;
  /** The Stretch Subtract switch; stays as you left it. */
  stretchSubtract?: boolean;
  stretchAmount?: string;
  stretchUnit?: "seconds" | "minutes";
  calorieKind?: "eaten" | "burned";
  /** Calories your body burns in a full day; accrues through the day. */
  dailyBurn?: number;
};

export type RoutineData = {
  version: 1;
  stretches: StretchEntry[];
  study: StudyEntry[];
  calories: CalorieEntry[];
  /** Day of the previous visit, used for the "Welcome back" summary. */
  lastVisit: DayKey | null;
  prefs: Prefs;
};

const KEY = "routine:v1";

export const EMPTY: RoutineData = { version: 1, stretches: [], study: [], calories: [], lastVisit: null, prefs: {} };

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedData: RoutineData = EMPTY;
// Fallback when localStorage is unavailable (private mode, quota): data lives for this tab only.
let memoryRaw: string | null = null;

export function isStorageAvailable(): boolean {
  try {
    const probe = "__routine_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return memoryRaw;
  }
}

function parse(raw: string | null): RoutineData {
  if (!raw) return EMPTY;
  try {
    const data = JSON.parse(raw) as Partial<RoutineData>;
    return {
      version: 1,
      stretches: Array.isArray(data.stretches) ? data.stretches : [],
      study: Array.isArray(data.study) ? data.study : [],
      calories: Array.isArray(data.calories) ? data.calories : [],
      lastVisit: typeof data.lastVisit === "string" ? data.lastVisit : null,
      prefs: data.prefs && typeof data.prefs === "object" ? data.prefs : {},
    };
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): RoutineData {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedData = parse(raw);
  }
  return cachedData;
}

/** Read the current data outside React (e.g. right after saving). */
export function getData(): RoutineData {
  return getSnapshot();
}

function getServerSnapshot(): null {
  return null;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Current data, or `null` during the server render and hydration. */
export function useRoutineData(): RoutineData | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function updateData(update: (data: RoutineData) => RoutineData): void {
  const raw = JSON.stringify(update(getSnapshot()));
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    memoryRaw = raw;
  }
  listeners.forEach((listener) => listener());
}

type Collection = "stretches" | "study" | "calories";
type NewEntry<C extends Collection> = Omit<RoutineData[C][number], "id" | "createdAt">;

/** Save a new entry and return its id (for Undo). */
export function addEntry<C extends Collection>(collection: C, entry: NewEntry<C>): string {
  const id = crypto.randomUUID();
  updateData((data) => ({ ...data, [collection]: [...data[collection], { ...entry, id, createdAt: Date.now() }] }));
  return id;
}

/** Remember that you've seen today's Welcome back. */
export function markVisited(day: DayKey): void {
  updateData((data) => ({ ...data, lastVisit: day }));
}

export function savePrefs(prefs: Prefs): void {
  updateData((data) => ({ ...data, prefs: { ...data.prefs, ...prefs } }));
}

/** Put back a deleted entry exactly as it was (for Undo). */
export function restoreEntry<C extends Collection>(collection: C, entry: RoutineData[C][number]): void {
  updateData((data) => ({ ...data, [collection]: [...data[collection], entry] }));
}

export function removeEntry(collection: Collection, id: string): void {
  updateData((data) => ({ ...data, [collection]: data[collection].filter((e) => e.id !== id) }));
}

export function exportJson(): string {
  return JSON.stringify(getSnapshot(), null, 2);
}
