"use client";

import { useEffect, useRef } from "react";
import { addDays, formatDay, fromDayKey, toDayKey, type DayKey } from "@/lib/dates";
import { useRoutineData } from "@/lib/storage";
import { formatKcal, netCalories } from "@/lib/streaks";
import { useNow } from "@/lib/use-now";
import { useRoving } from "@/lib/use-roving";

/** About six months of days. */
const MAX_DAYS = 183;
const PLOT_HEIGHT = 200;
/** Column pitch: a bar up to 14px plus air, so ~14 days fit on a phone before scrolling. */
const COLUMN = 22;
const BAR = 14;
/** Surface gap between stacked segments. */
const GAP = 2;

const SERIES = [
  { key: "consumed", label: "Consumed", fill: "bg-ct-consumed" },
  { key: "resting", label: "Resting burn", fill: "bg-ct-resting" },
  { key: "active", label: "Active burn", fill: "bg-ct-active" },
] as const;

/** A clean tick step (1, 2, 5 × 10^n) for a range. */
function niceStep(range: number, ticks = 4): number {
  const raw = range / ticks;
  const power = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / power;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * power;
}

const compact = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K` : `${v}`);

/**
 * Calories per day, up to six months back, scrolled to today. Consumed sits above zero;
 * resting and active burn stack below it; a dot marks the day's net. Scroll (or use the
 * arrow keys) to go back in time.
 */
export function CalorieTrend() {
  const data = useRoutineData();
  const now = useNow();
  const scroller = useRef<HTMLDivElement>(null);

  // Always six months of days ending today. Days before the first calorie log are blank:
  // no data was tracked then, so no made-up resting burn.
  const end = now ? toDayKey(now) : "";
  const firstLog = data?.calories.reduce<DayKey | null>((min, c) => (min === null || c.date < min ? c.date : min), null) ?? end;
  const start = now ? addDays(end, -(MAX_DAYS - 1)) : "";
  const count = now ? MAX_DAYS : 1;

  const { shown, markProps } = useRoving(count, (key) =>
    key === "ArrowLeft"
      ? -1
      : key === "ArrowRight"
        ? 1
        : key === "PageUp"
          ? -7
          : key === "PageDown"
            ? 7
            : key === "Home"
              ? -MAX_DAYS
              : key === "End"
                ? MAX_DAYS
                : null,
  );

  // Open scrolled to today.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, [count]);

  if (!data || !now) return <div style={{ height: PLOT_HEIGHT + 96 }} aria-hidden="true" />;

  const days = Array.from({ length: count }, (_, i) => addDays(start, i));
  const rows = days.map((d) => {
    const n = netCalories(data, d, now);
    return { day: d, tracked: d >= firstLog, consumed: n.eaten, resting: n.bodyBurn, active: n.exercise, net: n.net };
  });
  const tracked = rows.filter((r) => r.tracked);

  const maxUp = Math.max(0, ...tracked.map((r) => r.consumed));
  const maxDown = Math.max(0, ...tracked.map((r) => r.resting + r.active));
  const step = niceStep(maxUp + maxDown || 1000);
  const top = Math.ceil(maxUp / step) * step;
  const bottom = -Math.ceil(maxDown / step) * step;
  const span = top - bottom || step;
  const y = (v: number) => ((top - v) / span) * PLOT_HEIGHT; // px from top
  const px = (kcal: number) => (Math.abs(kcal) / span) * PLOT_HEIGHT;
  const ticks: number[] = [];
  for (let t = top; t >= bottom; t -= step) ticks.push(t);
  const zero = y(0);

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="font-ct-sans text-sm text-ct-muted">
        Calories per day: consumed above the line, burned below. Scroll left to go back up to 6 months. Today is so far.
      </figcaption>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 font-ct-sans text-xs text-ct-linen" aria-label="Legend">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-3 rounded-sm ${s.fill}`} />
            {s.label}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-ct-text ring-2 ring-ct-surface" />
          Net
        </li>
      </ul>

      <div className="flex gap-2">
        {/* Y axis stays put while the plot scrolls. */}
        <div className="relative w-9 shrink-0 font-ct-sans text-[11px] text-ct-muted tabular-nums" style={{ height: PLOT_HEIGHT }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: y(t) }}>
              {compact(t)}
            </span>
          ))}
        </div>

        <div ref={scroller} className="min-w-0 flex-1 overflow-x-auto pb-1">
          <div className="relative" style={{ width: count * COLUMN, height: PLOT_HEIGHT + 22 }}>
            {ticks.map((t) => (
              <div key={t} aria-hidden="true" className={`absolute inset-x-0 h-px ${t === 0 ? "bg-ct-border" : "bg-ct-hairline"}`} style={{ top: y(t) }} />
            ))}

            <div
              role="group"
              aria-label="Calories by day. Use arrow keys to move between days, Page Up and Page Down to jump a week."
              className="absolute inset-x-0 top-0 flex"
              style={{ height: PLOT_HEIGHT }}
            >
              {rows.map((r, i) => {
                const restingH = px(r.resting);
                const activeH = px(r.active);
                const label = !r.tracked
                  ? `${formatDay(r.day)}: no data yet`
                  : `${formatDay(r.day)}: consumed ${formatKcal(r.consumed)}, resting burn ${formatKcal(r.resting)}, active burn ${formatKcal(r.active)}, net ${formatKcal(r.net)}`;
                return (
                  <div
                    key={r.day}
                    {...markProps(i)}
                    aria-label={label}
                    className="group relative h-full shrink-0 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ct-accent"
                    style={{ width: COLUMN }}
                  >
                    {r.tracked && (
                      <>
                        <div
                          className="absolute inset-y-0 left-1/2 -translate-x-1/2 transition-[filter] group-hover:brightness-125 group-focus-visible:brightness-125"
                          style={{ width: BAR }}
                        >
                          {r.consumed > 0 && (
                            <div
                              className="absolute inset-x-0 rounded-t bg-ct-consumed"
                              style={{ top: y(r.consumed), height: Math.max(2, zero - y(r.consumed)) }}
                            />
                          )}
                          {r.resting > 0 && (
                            <div
                              className={`absolute inset-x-0 bg-ct-resting ${activeH > 0 ? "" : "rounded-b"}`}
                              style={{ top: zero + GAP, height: Math.max(2, restingH - GAP) }}
                            />
                          )}
                          {r.active > 0 && (
                            <div
                              className="absolute inset-x-0 rounded-b bg-ct-active"
                              style={{ top: zero + restingH + GAP, height: Math.max(2, activeH - GAP) }}
                            />
                          )}
                        </div>
                        <span
                          aria-hidden="true"
                          className="absolute left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ct-text ring-2 ring-ct-surface"
                          style={{ top: y(r.net) }}
                        />
                      </>
                    )}

                    {shown === i && (
                      <div
                        role="tooltip"
                        className={`pointer-events-none absolute z-10 w-max rounded-md bg-ct-text px-3 py-2 font-ct-sans text-ct-bg shadow-ct-glow-strong ${i < 6 ? "left-full ml-1" : "right-full mr-1"}`}
                        style={{ top: 4 }}
                      >
                        <span className="block text-xs font-semibold">{formatDay(r.day)}</span>
                        {!r.tracked ? (
                          <span className="block text-xs">No data yet</span>
                        ) : (
                          <>
                            {(
                              [
                                ["Consumed", r.consumed, "bg-ct-consumed"],
                                ["Resting", r.resting, "bg-ct-resting"],
                                ["Active", r.active, "bg-ct-active"],
                              ] as const
                            ).map(([name, value, fill]) => (
                              <span key={name} className="flex items-center gap-2 text-xs">
                                <span aria-hidden="true" className={`h-0.5 w-3 rounded-full ${fill}`} />
                                <span className="font-semibold tabular-nums">{formatKcal(value)}</span>
                                <span>{name}</span>
                              </span>
                            ))}
                            <span className="mt-1 block border-t border-ct-bg/20 pt-1 text-sm font-semibold">Net {formatKcal(r.net)}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* X axis: each Sunday, plus today. */}
            <div aria-hidden="true" className="absolute inset-x-0 font-ct-sans text-[11px] text-ct-muted" style={{ top: PLOT_HEIGHT + 6 }}>
              {rows.map((r, i) =>
                i === count - 1 ? (
                  <span key={r.day} className="absolute right-0 whitespace-nowrap">
                    Today
                  </span>
                ) : fromDayKey(r.day).getDay() === 0 && i < count - 3 ? (
                  <span key={r.day} className="absolute whitespace-nowrap" style={{ left: i * COLUMN }}>
                    {formatDay(r.day, { month: "short", day: "numeric" })}
                  </span>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </div>

      <details className="font-ct-sans text-sm">
        <summary className="w-fit cursor-pointer rounded-sm text-ct-caramel underline decoration-ct-caramel/50 underline-offset-4 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ct-accent">
          Show as table
        </summary>
        <div className="mt-3 max-h-96 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-ct-surface">
              <tr className="border-b border-ct-hairline text-[11px] uppercase tracking-[0.18em] text-ct-muted">
                <th scope="col" className="py-1.5 font-semibold">
                  Day
                </th>
                <th scope="col" className="py-1.5 text-right font-semibold">
                  Consumed
                </th>
                <th scope="col" className="py-1.5 text-right font-semibold">
                  Resting
                </th>
                <th scope="col" className="py-1.5 text-right font-semibold">
                  Active
                </th>
                <th scope="col" className="py-1.5 text-right font-semibold">
                  Net
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ct-hairline tabular-nums">
              {[...tracked].reverse().map((r) => (
                <tr key={r.day}>
                  <td className="py-1.5 text-ct-linen">{formatDay(r.day, { month: "short", day: "numeric" })}</td>
                  <td className="py-1.5 text-right text-ct-muted">{r.consumed.toLocaleString()}</td>
                  <td className="py-1.5 text-right text-ct-muted">{r.resting.toLocaleString()}</td>
                  <td className="py-1.5 text-right text-ct-muted">{r.active.toLocaleString()}</td>
                  <td className="py-1.5 text-right text-ct-linen">{r.net.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
