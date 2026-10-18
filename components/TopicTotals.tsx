"use client";

import { FE_TOPICS } from "@/lib/fe-topics";
import { useRoutineData } from "@/lib/storage";
import { formatMinutes } from "@/lib/streaks";

/**
 * All-time minutes per FE topic, in exam order. Topics with no time say "Not started";
 * among topics you've begun, the lowest is flagged "Least studied". Collapsed by default;
 * the summary names the least-studied topic.
 */
export function TopicTotals() {
  const data = useRoutineData();
  if (!data) return <div className="h-11" aria-hidden="true" />;

  const totals = new Map<string, number>();
  for (const s of data.study) totals.set(s.topic, (totals.get(s.topic) ?? 0) + s.minutes);
  const values = FE_TOPICS.map((t) => Math.max(0, totals.get(t.id) ?? 0));
  const max = Math.max(...values, 1);
  const started = values.filter((v) => v > 0);
  const least = started.length > 1 ? Math.min(...started) : null;

  const leastNames = FE_TOPICS.filter((_, i) => least !== null && values[i] === least).map((t) => t.name);
  const notStarted = values.filter((v) => v === 0).length;
  const hint = leastNames.length ? `Least studied: ${leastNames.join(", ")}` : notStarted ? `${notStarted} not started` : "";

  return (
    <details className="group">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md font-ct-sans focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ct-accent [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="text-ct-muted transition-transform group-open:rotate-90">
          ▸
        </span>
        <span className="text-[15px] font-medium text-ct-text">Minutes per topic</span>
        {hint && <span className="text-xs text-ct-muted/70">· {hint}</span>}
      </summary>
      <ul className="mt-3 flex flex-col gap-3">
        {FE_TOPICS.map((t, i) => {
          const minutes = values[i];
          const isLeast = least !== null && minutes === least;
          return (
            <li key={t.id} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3 font-ct-sans text-sm">
                <span className="text-ct-linen">
                  {t.name}
                  {isLeast && <span className="ml-2 text-xs font-semibold text-ct-accent">Least studied</span>}
                  {minutes === 0 && <span className="ml-2 text-xs text-ct-muted/70">Not started</span>}
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
    </details>
  );
}
