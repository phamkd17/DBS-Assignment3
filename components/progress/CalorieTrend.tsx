"use client";

import { addDays, formatDay, toDayKey } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { formatKcal, netCalories } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";
import { useRoving } from "@/lib/use-roving";

const DAYS = 14;
const PLOT_HEIGHT = 160;

/** A clean tick step (1, 2, 5 × 10^n) for a range. */
function niceStep(range: number, ticks = 4): number {
  const raw = range / ticks;
  const power = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / power;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * power;
}

const compact = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K` : `${v}`);

/** Net calories per day for the last 14 days: one series, columns above/below zero. No goal line. */
export function CalorieTrend() {
  const data = useRoutineData();
  const now = useNow();
  const { shown, markProps } = useRoving(DAYS, (key) => (key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : key === "Home" ? -DAYS : key === "End" ? DAYS : null));
  if (!data || !now) return <div style={{ height: PLOT_HEIGHT + 48 }} aria-hidden="true" />;

  const end = toDayKey(now);
  const days = Array.from({ length: DAYS }, (_, i) => addDays(end, i - DAYS + 1));
  const nets = days.map((d) => netCalories(data, d, now).net);

  const step = niceStep(Math.max(...nets, 0) - Math.min(...nets, 0) || 1000);
  const top = Math.ceil(Math.max(...nets, 0) / step) * step;
  const bottom = Math.floor(Math.min(...nets, 0) / step) * step;
  const span = top - bottom || step;
  const y = (v: number) => ((top - v) / span) * PLOT_HEIGHT; // px from top
  const ticks: number[] = [];
  for (let t = top; t >= bottom; t -= step) ticks.push(t);

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="font-ct-sans text-sm text-ct-muted">Net calories per day, last 14 days. Today is so far.</figcaption>

      <div className="flex gap-2">
        {/* Y axis */}
        <div className="relative w-9 shrink-0 font-ct-sans text-[11px] text-ct-muted tabular-nums" style={{ height: PLOT_HEIGHT }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: y(t) }}>
              {compact(t)}
            </span>
          ))}
        </div>

        {/* Plot */}
        <div className="relative min-w-0 flex-1" style={{ height: PLOT_HEIGHT }}>
          {ticks.map((t) => (
            <div key={t} aria-hidden="true" className={`absolute inset-x-0 h-px ${t === 0 ? "bg-ct-border" : "bg-ct-hairline"}`} style={{ top: y(t) }} />
          ))}
          <div role="group" aria-label="Net calories by day. Use arrow keys to move between days." className="absolute inset-0 flex justify-between gap-0.5">
            {days.map((d, i) => {
              const v = nets[i];
              const barTop = v >= 0 ? y(v) : y(0);
              const barHeight = Math.max(2, Math.abs(y(v) - y(0)));
              return (
                <div
                  key={d}
                  {...markProps(i)}
                  aria-label={`${formatDay(d)}: net ${formatKcal(v)}`}
                  className="group relative flex h-full flex-1 cursor-default justify-center rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ct-accent"
                >
                  <div
                    className={`absolute left-1/2 w-full max-w-6 -translate-x-1/2 bg-ct-chart transition-[filter] group-hover:brightness-125 group-focus-visible:brightness-125 ${v >= 0 ? "rounded-t" : "rounded-b"}`}
                    style={{ top: barTop, height: barHeight }}
                  />
                  {shown === i && (
                    <div role="tooltip" style={{ bottom: PLOT_HEIGHT - barTop + 6 }} className={`pointer-events-none absolute z-10 whitespace-nowrap ${i < 3 ? "left-0" : i > DAYS - 4 ? "right-0" : "left-1/2 -translate-x-1/2"} rounded-md bg-ct-text px-2.5 py-1.5 font-ct-sans text-ct-bg shadow-ct-glow-strong`}>
                      <span className="block text-sm font-semibold">{formatKcal(v)}</span>
                      <span className="block text-xs">{formatDay(d)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X axis: first, middle, last day only */}
      <div className="ml-11 flex justify-between font-ct-sans text-[11px] text-ct-muted" aria-hidden="true">
        <span>{formatDay(days[0], { month: "short", day: "numeric" })}</span>
        <span>{formatDay(days[7], { month: "short", day: "numeric" })}</span>
        <span>Today · {formatKcal(nets[DAYS - 1])}</span>
      </div>

      <details className="font-ct-sans text-sm">
        <summary className="w-fit cursor-pointer rounded-sm text-ct-caramel underline decoration-ct-caramel/50 underline-offset-4 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ct-accent">
          Show as table
        </summary>
        <table className="mt-3 w-full text-left">
          <thead>
            <tr className="border-b border-ct-hairline text-[11px] uppercase tracking-[0.18em] text-ct-muted">
              <th scope="col" className="py-1.5 font-semibold">Day</th>
              <th scope="col" className="py-1.5 text-right font-semibold">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ct-hairline">
            {[...days].reverse().map((d) => (
              <tr key={d}>
                <td className="py-1.5 text-ct-linen">{formatDay(d)}</td>
                <td className="py-1.5 text-right text-ct-muted tabular-nums">{formatKcal(nets[days.indexOf(d)])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
