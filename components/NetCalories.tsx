"use client";

import { today } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { formatKcal, netCalories } from "@/lib/streaks";

/** Today's net calories (eaten − burned). No goal, no budget: just the number. */
export function NetCalories() {
  const data = useRoutineData();
  if (!data) return <div className="h-24" aria-hidden="true" />;
  const { eaten, burned, net } = netCalories(data, today());
  return (
    <div className="flex flex-col gap-1">
      <p className="font-ct-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ct-muted">Net today</p>
      <p className="font-ct-serif text-5xl italic text-ct-text">{formatKcal(net)}</p>
      <p className="font-ct-sans text-sm text-ct-linen">
        {formatKcal(eaten)} eaten − {formatKcal(burned)} burned
      </p>
    </div>
  );
}
