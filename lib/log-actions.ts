"use client";

// Save an entry and build the confirmation message. Shared by the Start card, quick chips,
// and Custom forms so every log reads the same way. Callers show `message` in a toast with `undo`.

import { formatDay, today, type DayKey } from "./dates";
import { topicName, type TopicId } from "./fe-topics";
import { addEntry, getData, removeEntry, type Region } from "./storage";
import { dailyStretchStreak, formatDuration, studyMinutesByDay, studyStreak, studyTier } from "./streaks";

export const REGION_NAME: Record<Region, string> = { shoulder: "shoulder", lower: "lower body" };

type Logged = { message: string; undo: () => void };

export function logStretch(region: Region, seconds: number, date: DayKey, subtract = false): Logged {
  const id = addEntry("stretches", { date, region, seconds: subtract ? -seconds : seconds });
  const streak = dailyStretchStreak(getData(), region, today());
  const name = REGION_NAME[region];
  const when = date === today() ? "" : ` for ${formatDay(date)}`;
  const message = subtract
    ? `Removed ${formatDuration(seconds)} ${name}${when}`
    : streak.status === "done" && streak.current === 1 && streak.best === 1 && !when
      ? `1-day ${name} streak!`
      : `Logged ${formatDuration(seconds)} ${name}${when}${streak.status === "done" ? ` · ${streak.current}-day streak` : ""}`;
  return { message, undo: () => removeEntry("stretches", id) };
}

export function logStudy(topic: TopicId, minutes: number, date: DayKey, subtract = false): Logged {
  const id = addEntry("study", { date, topic, minutes: subtract ? -minutes : minutes });
  const dayTotal = studyMinutesByDay(getData()).get(date) ?? 0;
  const tier = studyTier(dayTotal);
  const streak = studyStreak(getData(), today());
  const isToday = date === today();
  const when = isToday ? "" : ` for ${formatDay(date)}`;
  const extras = [
    isToday && (subtract || dayTotal !== minutes) ? `${dayTotal} min today` : null,
    tier && isToday ? `${tier} day` : null,
    streak.status === "done" ? `${streak.current}-day streak` : null,
  ].filter(Boolean);
  const message = `${subtract ? "Removed" : "Logged"} ${minutes} min ${topicName(topic)}${when}${extras.length ? ` · ${extras.join(" · ")}` : ""}`;
  return { message, undo: () => removeEntry("study", id) };
}
