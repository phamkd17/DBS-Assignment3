"use client";

import { FE_TOPICS } from "@/lib/fe-topics";
import { useRoutineData } from "@/lib/storage";
import { formatMinutes } from "@/lib/streaks";

/** All-time minutes per FE topic, in exam order. The least-studied topic(s) are flagged. */
export function TopicTotals() {
  const data = useRoutineData();
  if (!data) return <div className="h-96" aria-hidden="true" />;

  const totals = new Map<string, number>();
  for (const s of data.study) totals.set(s.topic, (totals.get(s.topic) ?? 0) + s.minutes);
  const values = FE_TOPICS.map((t) => Math.max(0, totals.get(t.id) ?? 0));
  const max = Math.max(...values, 1);
  const least = Math.min(...values);

  return (
    <ul className="flex flex-col gap-3">
      {FE_TOPICS.map((t, i) => {
        const minutes = values[i];
        const isLeast = minutes === least;
        return (
          <li key={t.id} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 font-ct-sans text-sm">
              <span className="text-ct-linen">
                {t.name}
                {isLeast && <span className="ml-2 text-xs font-semibold text-ct-accent">Least studied</span>}
              </span>
              <span className="shrink-0 text-ct-muted">{formatMinutes(minutes)}</span>
            </div>
            <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-ct-raised">
              <div className={`h-full rounded-full ${isLeast ? "bg-ct-accent/50" : "bg-ct-caramel"}`} style={{ width: `${(minutes / max) * 100}%` }} />
            </div>
            <span className="font-ct-sans text-xs text-ct-muted/70">{t.questions} exam questions</span>
          </li>
        );
      })}
    </ul>
  );
}
