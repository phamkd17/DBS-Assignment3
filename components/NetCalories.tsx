"use client";

import { toDayKey } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { formatKcal, netCalories } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

/** Today's net so far: eaten − body burn (accrues through the day) − logged exercise. No goal. */
export function NetCalories() {
  const data = useRoutineData();
  const now = useNow();
  if (!data || !now) return <div className="h-24" aria-hidden="true" />;

  const { eaten, exercise, bodyBurn, net } = netCalories(data, toDayKey(now), now);
  return (
    <div className="flex flex-col gap-0.5">
      {/* Phones: number and label share a line; wider screens stack them. */}
      <div className="flex flex-row-reverse items-baseline justify-end gap-3 sm:flex-col sm:items-start sm:gap-0.5">
        <p className="font-ct-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ct-muted">Net so far today</p>
        <p className="font-ct-serif text-3xl leading-tight italic text-ct-text sm:text-5xl">{formatKcal(net)}</p>
      </div>
      <p className="font-ct-sans text-xs text-ct-muted/70">
        {formatKcal(eaten)} eaten − {formatKcal(bodyBurn)} body burn − {formatKcal(exercise)} exercise
      </p>
    </div>
  );
}
