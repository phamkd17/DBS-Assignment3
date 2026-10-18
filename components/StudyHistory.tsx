"use client";

import { History } from "./History";
import { topicName } from "@/lib/fe-topics";
import { useRoutineData } from "@/lib/storage";
import { formatMinutes, studyTier } from "@/lib/streaks";

export function StudyHistory() {
  const data = useRoutineData();
  if (!data) return null;
  return (
    <History
      collection="study"
      entries={data.study}
      label={(e) => topicName(e.topic) + (e.minutes < 0 ? " (subtracted)" : "")}
      amount={(e) => (e.minutes < 0 ? `−${formatMinutes(-e.minutes)}` : formatMinutes(e.minutes))}
      daySummary={(_, entries) => {
        const total = entries.reduce((t, e) => t + e.minutes, 0);
        const tier = studyTier(total);
        return `${formatMinutes(total)}${tier ? ` · ${tier}` : ""}`;
      }}
      describe={(e) => `${formatMinutes(Math.abs(e.minutes))} ${topicName(e.topic)}`}
    />
  );
}
