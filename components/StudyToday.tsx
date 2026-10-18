"use client";

import { Button } from "./ui/Button";
import { ProgressBar } from "./ui/ProgressBar";
import { useToast } from "./ui/Toast";
import { topicName } from "@/lib/fe-topics";
import { toDayKey } from "@/lib/dates";
import { removeEntry, restoreEntry, useRoutineData } from "@/lib/storage";
import { STUDY_TIERS, studyTier } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

const GOLD = STUDY_TIERS[0].minutes;

/** Today's cumulative study time across all sessions, its tier, and each session. */
export function StudyToday() {
  const data = useRoutineData();
  const now = useNow();
  const toast = useToast();
  if (!data || !now) return <div className="h-32" aria-hidden="true" />;

  const day = toDayKey(now);
  const sessions = data.study.filter((s) => s.date === day).sort((a, b) => a.createdAt - b.createdAt);
  const total = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const tier = studyTier(total);
  const nextTier = [...STUDY_TIERS].reverse().find((t) => total < t.minutes);
  const status = nextTier ? `${nextTier.minutes - total} min to ${nextTier.label}` : "Gold reached";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-ct-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ct-muted">Today so far</p>
        <p className="font-ct-serif text-5xl italic text-ct-text">
          {total} min
          {tier && <span className="ml-3 font-ct-sans text-lg not-italic text-ct-accent">{tier} day</span>}
        </p>
      </div>
      <ProgressBar label={sessions.length === 1 ? "1 session" : `${sessions.length} sessions`} value={total} max={GOLD} valueText={status} />

      {sessions.length > 0 && (
        <ul className="flex flex-col divide-y divide-ct-hairline border-t border-ct-hairline">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-1.5 font-ct-sans text-[15px]">
              <span className="text-ct-linen">{topicName(s.topic)}</span>
              <span className="flex items-center gap-1">
                <span className="text-ct-muted">{s.minutes} min</span>
                <Button
                  variant="ghost"
                  aria-label={`Delete ${s.minutes} min ${topicName(s.topic)}`}
                  onClick={() => {
                    removeEntry("study", s.id);
                    toast(`Deleted ${s.minutes} min ${topicName(s.topic)}`, () => restoreEntry("study", s));
                  }}
                >
                  Delete
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
