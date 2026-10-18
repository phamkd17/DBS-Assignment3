"use client";

import { History } from "./History";
import { useRoutineData } from "@/lib/storage";
import { formatKcal, netCalories } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";

export function CalorieHistory() {
  const data = useRoutineData();
  const now = useNow();
  if (!data || !now) return null;
  return (
    <History
      collection="calories"
      entries={data.calories}
      label={(e) => (
        <>
          <span className="text-ct-muted">{e.kind === "eaten" ? "Eaten" : "Burned"}</span>
          {e.label && <span> · {e.label}</span>}
        </>
      )}
      amount={(e) => formatKcal(e.kcal)}
      daySummary={(day) => `Net ${formatKcal(netCalories(data, day, now).net)}`}
      describe={(e) => `${formatKcal(e.kcal)} ${e.kind}${e.label ? ` (${e.label})` : ""}`}
    />
  );
}
