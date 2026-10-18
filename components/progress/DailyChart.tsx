"use client";

import { useEffect, useRef, useState } from "react";
import { formatDay, fromDayKey, type DayKey } from "@/lib/dates";
import { useRoving } from "@/lib/use-roving";

/** Days visible at once; the rest is a scroll (or arrow key) away. */
const VISIBLE_DAYS = 7;
const PLOT_HEIGHT = 200;
/** Bars cap at 24px wide; the rest of each column is air. */
const MAX_BAR = 24;
/** Surface gap between stacked segments. */
const GAP = 2;

export type Series = {
  key: string;
  label: string;
  /** Tailwind background class for the mark and its legend swatch. */
  fill: string;
  /** Above or below the zero line. Segments stack outward in this order. */
  side: "up" | "down";
};

export type DayRow = {
  day: DayKey;
  /** False for days before tracking began: drawn blank, "No data yet". */
  tracked: boolean;
  values: Record<string, number>;
  /** Optional dot (e.g. net calories). */
  dot?: number;
};

type Props = {
  caption: string;
  series: Series[];
  rows: DayRow[];
  /** Name of the dot in the legend, tooltip, and table (e.g. "Net"). */
  dotLabel?: string;
  /** Format a value for tooltips and the table, e.g. "250 kcal" or "1 min 30 s". */
  format: (value: number) => string;
  /** Format an axis tick, e.g. "1K" or "2 min". */
  formatTick: (value: number) => string;
  /** Accessible name for the group of days. */
  groupLabel: string;
};

/** A clean tick step (1, 2, 5 × 10^n) for a range. */
function niceStep(range: number, ticks = 4): number {
  const raw = range / ticks;
  const power = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / power;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * power;
}

/**
 * One column per day, one week visible, scrolled to the latest day. Series stack above and/or
 * below zero; an optional dot marks a per-day total. One tab stop: arrows move a day, Page Up /
 * Page Down a week. Tooltips show on hover and focus, and "Show as table" lists every tracked day.
 */
export function DailyChart({ caption, series, rows, dotLabel, format, formatTick, groupLabel }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const count = rows.length;
  const { shown, markProps } = useRoving(count, (key) => ({ ArrowLeft: -1, ArrowRight: 1, PageUp: -7, PageDown: 7, Home: -count, End: count })[key] ?? null);

  // Size columns so exactly one week fills the visible width, and keep it on resize.
  const [column, setColumn] = useState(40);
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setColumn(Math.max(24, el.clientWidth / VISIBLE_DAYS)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const bar = Math.min(MAX_BAR, Math.round(column * 0.55));
  // First visible column, so tooltips open toward the middle of what's on screen.
  const [firstVisible, setFirstVisible] = useState(Math.max(0, rows.length - VISIBLE_DAYS));

  // Open scrolled to the latest day.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, [count, column]);

  const up = series.filter((s) => s.side === "up");
  const down = series.filter((s) => s.side === "down");
  const tracked = rows.filter((r) => r.tracked);
  const sum = (r: DayRow, list: Series[]) => list.reduce((t, s) => t + Math.max(0, r.values[s.key] ?? 0), 0);

  const maxUp = Math.max(0, ...tracked.map((r) => sum(r, up)));
  const maxDown = Math.max(0, ...tracked.map((r) => sum(r, down)));
  const step = niceStep(maxUp + maxDown || 1);
  const top = Math.ceil(maxUp / step) * step || (down.length ? 0 : step);
  const bottom = -Math.ceil(maxDown / step) * step;
  const span = top - bottom || step;
  const y = (v: number) => ((top - v) / span) * PLOT_HEIGHT; // px from top
  const px = (v: number) => (Math.max(0, v) / span) * PLOT_HEIGHT;
  const ticks: number[] = [];
  for (let t = top; t >= bottom - 1e-9; t -= step) ticks.push(Math.round(t * 1000) / 1000);
  const zero = y(0);
  const tipRow = shown !== null ? rows[shown] : null;
  const last = count - 1;

  /** Segments from the zero line outward; only the outermost gets the rounded data-end. */
  function stack(r: DayRow, list: Series[], side: "up" | "down") {
    const present = list.filter((s) => (r.values[s.key] ?? 0) > 0);
    let offset = 0;
    return present.map((s, i) => {
      const h = px(r.values[s.key]);
      const outer = i === present.length - 1;
      const gap = i === 0 && side === "up" ? 0 : GAP;
      const style = side === "up" ? { top: zero - offset - h, height: Math.max(2, h - gap) } : { top: zero + offset + GAP, height: Math.max(2, h - GAP) };
      offset += h;
      return <div key={s.key} className={`absolute inset-x-0 ${s.fill} ${outer ? (side === "up" ? "rounded-t" : "rounded-b") : ""}`} style={style} />;
    });
  }

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="font-ct-sans text-sm text-ct-muted">{caption}</figcaption>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 font-ct-sans text-xs text-ct-linen" aria-label="Legend">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-3 rounded-sm ${s.fill}`} />
            {s.label}
          </li>
        ))}
        {dotLabel && (
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2 rounded-full bg-ct-text ring-2 ring-ct-surface" />
            {dotLabel}
          </li>
        )}
      </ul>

      <div className="flex gap-2">
        {/* Y axis stays put while the plot scrolls. */}
        <div className="relative w-9 shrink-0 font-ct-sans text-[11px] text-ct-muted tabular-nums" style={{ height: PLOT_HEIGHT }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2 whitespace-nowrap" style={{ top: y(t) }}>
              {formatTick(t)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div
            ref={scroller}
            onScroll={(e) => setFirstVisible(Math.round(e.currentTarget.scrollLeft / column))}
            className="ct-no-scrollbar snap-x snap-mandatory overflow-x-auto"
          >
            <div className="relative" style={{ width: count * column, height: PLOT_HEIGHT + 22 }}>
              {ticks.map((t) => (
                <div key={t} aria-hidden="true" className={`absolute inset-x-0 h-px ${t === 0 ? "bg-ct-border" : "bg-ct-hairline"}`} style={{ top: y(t) }} />
              ))}

              <div role="group" aria-label={groupLabel} className="absolute inset-x-0 top-0 flex" style={{ height: PLOT_HEIGHT }}>
                {rows.map((r, i) => {
                  const parts = series.map((s) => `${s.label.toLowerCase()} ${format(r.values[s.key] ?? 0)}`).join(", ");
                  const label = r.tracked
                    ? `${formatDay(r.day)}: ${parts}${dotLabel && r.dot !== undefined ? `, ${dotLabel.toLowerCase()} ${format(r.dot)}` : ""}`
                    : `${formatDay(r.day)}: no data yet`;
                  return (
                    <div
                      key={r.day}
                      {...markProps(i)}
                      aria-label={label}
                      className="group relative h-full shrink-0 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ct-accent"
                      style={{ width: column, scrollSnapAlign: i % VISIBLE_DAYS === last % VISIBLE_DAYS ? "end" : undefined }}
                    >
                      {r.tracked && (
                        <>
                          <div
                            className="absolute inset-y-0 left-1/2 -translate-x-1/2 transition-[filter] group-hover:brightness-125 group-focus-visible:brightness-125"
                            style={{ width: bar }}
                          >
                            {stack(r, up, "up")}
                            {stack(r, down, "down")}
                          </div>
                          {r.dot !== undefined && (
                            <span
                              aria-hidden="true"
                              className="absolute left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ct-text ring-2 ring-ct-surface"
                              style={{ top: y(r.dot) }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* X axis: one label per day, centered under its column. Sundays show the date. */}
              <div aria-hidden="true" className="absolute inset-x-0 flex font-ct-sans text-[11px] text-ct-muted" style={{ top: PLOT_HEIGHT + 6 }}>
                {rows.map((r, i) => (
                  <span key={r.day} className="shrink-0 text-center whitespace-nowrap" style={{ width: column }}>
                    {i === last
                      ? "Today"
                      : fromDayKey(r.day).getDay() === 0
                        ? formatDay(r.day, { month: "short", day: "numeric" })
                        : formatDay(r.day, { weekday: "short" })}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Tooltip sits in the visible corner opposite the hovered day, so it never clips or covers it. */}
          {shown !== null && tipRow && (
            <div
              role="tooltip"
              style={{ top: 4 }}
              className={`pointer-events-none absolute z-10 w-max rounded-md bg-ct-text px-3 py-2 font-ct-sans text-ct-bg shadow-ct-glow-strong ${shown - firstVisible < VISIBLE_DAYS / 2 ? "right-1" : "left-1"}`}
            >
              <span className="block text-xs font-semibold">{formatDay(tipRow.day)}</span>
              {!tipRow.tracked ? (
                <span className="block text-xs">No data yet</span>
              ) : (
                <>
                  {series.map((s) => (
                    <span key={s.key} className="flex items-center gap-2 text-xs">
                      <span aria-hidden="true" className={`h-0.5 w-3 rounded-full ${s.fill}`} />
                      <span className="font-semibold tabular-nums">{format(tipRow.values[s.key] ?? 0)}</span>
                      <span>{s.label}</span>
                    </span>
                  ))}
                  {dotLabel && tipRow.dot !== undefined && (
                    <span className="mt-1 block border-t border-ct-bg/20 pt-1 text-sm font-semibold">
                      {dotLabel} {format(tipRow.dot)}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <details className="font-ct-sans text-sm">
        <summary className="w-fit cursor-pointer rounded-sm text-ct-caramel underline decoration-ct-caramel/50 underline-offset-4 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ct-accent">
          Show as table
        </summary>
        {tracked.length === 0 ? (
          <p className="mt-3 text-ct-muted">Nothing logged yet.</p>
        ) : (
          <div className="mt-3 max-h-96 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-ct-surface">
                <tr className="border-b border-ct-hairline text-[11px] uppercase tracking-[0.18em] text-ct-muted">
                  <th scope="col" className="py-1.5 font-semibold">
                    Day
                  </th>
                  {series.map((s) => (
                    <th key={s.key} scope="col" className="py-1.5 pl-2 text-right font-semibold">
                      {s.label.split(" ")[0]}
                    </th>
                  ))}
                  {dotLabel && (
                    <th scope="col" className="py-1.5 pl-2 text-right font-semibold">
                      {dotLabel}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ct-hairline tabular-nums">
                {[...tracked].reverse().map((r) => (
                  <tr key={r.day}>
                    <td className="py-1.5 text-ct-linen">{formatDay(r.day, { month: "short", day: "numeric" })}</td>
                    {series.map((s) => (
                      <td key={s.key} className="py-1.5 pl-2 text-right text-ct-muted">
                        {format(r.values[s.key] ?? 0)}
                      </td>
                    ))}
                    {dotLabel && <td className="py-1.5 pl-2 text-right text-ct-linen">{r.dot !== undefined ? format(r.dot) : ""}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>
    </figure>
  );
}
