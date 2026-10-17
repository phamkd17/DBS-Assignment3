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

export type RoutineData = {
  version: 1;
  stretches: StretchEntry[];
  study: StudyEntry[];
  calories: CalorieEntry[];
  /** Day of the previous visit, used for the "Welcome back" summary. */
  lastVisit: DayKey | null;
};

const KEY = "routine:v1";

export const EMPTY: RoutineData = { version: 1, stretches: [], study: [], calories: [], lastVisit: null };

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

export function newId(): string {
  return crypto.randomUUID();
}

type Collection = "stretches" | "study" | "calories";

export function addEntry<C extends Collection>(collection: C, entry: RoutineData[C][number]): void {
  updateData((data) => ({ ...data, [collection]: [...data[collection], entry] }));
}

export function removeEntry(collection: Collection, id: string): void {
  updateData((data) => ({ ...data, [collection]: data[collection].filter((e) => e.id !== id) }));
}

export function exportJson(): string {
  return JSON.stringify(getSnapshot(), null, 2);
}
