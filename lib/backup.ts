// Read a backup file (the .json from "Download backup") and validate every entry, so a wrong
// or damaged file can never put bad data into storage.

import { isTopicId } from "./fe-topics";
import type { CalorieEntry, Prefs, RoutineData, StretchEntry, StudyEntry } from "./storage";

export type Backup = Pick<RoutineData, "stretches" | "study" | "calories"> & { prefs: Prefs };

export type BackupResult =
  | { ok: true; backup: Backup; count: number; skipped: number; first: string | null; last: string | null }
  | { ok: false; error: string };

const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function base(e: Record<string, unknown>) {
  return isDay(e.date) && typeof e.id === "string" && e.id.length > 0 ? { id: e.id, date: e.date, createdAt: isNum(e.createdAt) ? e.createdAt : 0 } : null;
}

function stretch(e: unknown): StretchEntry | null {
  if (!isObj(e)) return null;
  const b = base(e);
  return b && (e.region === "shoulder" || e.region === "lower") && isNum(e.seconds) ? { ...b, region: e.region, seconds: e.seconds } : null;
}

function study(e: unknown): StudyEntry | null {
  if (!isObj(e)) return null;
  const b = base(e);
  return b && typeof e.topic === "string" && isTopicId(e.topic) && isNum(e.minutes) ? { ...b, topic: e.topic, minutes: e.minutes } : null;
}

function calorie(e: unknown): CalorieEntry | null {
  if (!isObj(e)) return null;
  const b = base(e);
  return b && (e.kind === "eaten" || e.kind === "burned") && isNum(e.kcal) && e.kcal >= 0
    ? { ...b, kind: e.kind, kcal: Math.round(e.kcal), label: typeof e.label === "string" ? e.label.slice(0, 60) : "" }
    : null;
}

const NOT_A_BACKUP = "That file isn't a Routine backup. Choose the .json file you saved with Download backup.";

export function readBackup(text: string): BackupResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: NOT_A_BACKUP };
  }
  if (!isObj(raw) || raw.version !== 1 || ![raw.stretches, raw.study, raw.calories].some(Array.isArray)) return { ok: false, error: NOT_A_BACKUP };

  const pick = <T>(list: unknown, check: (e: unknown) => T | null) => (Array.isArray(list) ? list.map(check) : []);
  const s = pick(raw.stretches, stretch);
  const st = pick(raw.study, study);
  const c = pick(raw.calories, calorie);
  const all = [...s, ...st, ...c];
  const valid = <T>(list: (T | null)[]) => list.filter((e): e is T => e !== null);
  const backup: Backup = { stretches: valid(s), study: valid(st), calories: valid(c), prefs: isObj(raw.prefs) ? (raw.prefs as Prefs) : {} };
  const count = backup.stretches.length + backup.study.length + backup.calories.length;
  if (count === 0) return { ok: false, error: all.length ? "None of the entries in that file could be read. Nothing was imported." : "That backup has no entries to import." };

  const dates = [...backup.stretches, ...backup.study, ...backup.calories].map((e) => e.date).sort();
  return { ok: true, backup, count, skipped: all.length - count, first: dates[0] ?? null, last: dates.at(-1) ?? null };
}
