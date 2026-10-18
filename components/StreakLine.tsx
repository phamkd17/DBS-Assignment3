"use client";

import { today } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { dailyStretchStreak, studyStreak, type Streak } from "@/lib/streaks";

function Badge({ label, streak }: { label: string; streak: Streak }) {
  const { current, best, status } = streak;
  const [text, tone] =
    status === "done"
      ? [`${current}-day ✓`, "text-ct-success"]
      : status === "at-risk"
        ? [`${current}-day · at risk`, "text-ct-accent"]
        : status === "broken"
          ? [`reset · best ${best}`, "text-ct-muted"]
          : ["no streak yet", "text-ct-muted"];
  return (
    <span>
      <span className="text-ct-linen">{label}</span> <span className={tone}>{text}</span>
    </span>
  );
}

/** Today's streaks for a card: both stretch regions, or FE study. */
export function StreakLine({ kind }: { kind: "stretch" | "study" }) {
  const data = useRoutineData();
  if (!data) return <p className="h-5" aria-hidden="true" />;
  const day = today();
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 font-ct-sans text-sm">
      {kind === "stretch" ? (
        <>
          <Badge label="Shoulder" streak={dailyStretchStreak(data, "shoulder", day)} />
          <span aria-hidden="true" className="text-ct-hairline">·</span>
          <Badge label="Lower body" streak={dailyStretchStreak(data, "lower", day)} />
        </>
      ) : (
        <Badge label="Streak" streak={studyStreak(data, day)} />
      )}
    </p>
  );
}
