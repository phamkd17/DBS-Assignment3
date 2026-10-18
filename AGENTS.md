<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Routine Tracker: project rules

A personal daily-routine tracker for one person (Khang): shoulder + lower-body stretching, FE Mechanical study time per topic, and net calories. Built for MPCS 51238 Assignment 3 (Patterns & Flows).

## Stack (do not expand)
- Next.js (App Router) + TypeScript + Tailwind CSS.
- Data lives in the browser in `localStorage` only. **No database, backend, auth, external APIs, or new npm packages** unless Khang explicitly approves.
- Charts are plain SVG, with no chart library.

## Product rules
- Weeks run **Monday–Sunday** (local time). Dates are stored as local `YYYY-MM-DD`.
- Stretch: each region (shoulder, lower body) has its own **daily streak** (≥30 s that day) and **weekly streak** (≥10 min in a Mon–Sun week). Missing a region resets only that region. Default log amount (quick-log chip + form prefill): shoulder 30 s, lower body 60 s.
- Study: **daily streak** at ≥15 min. **Weekly goal 420 min** (60 × 7), shown as progress only, with no weekly study streak. Day tiers: 15 = Bronze, 30 = Silver, 60 = Gold (shown in the log toast, e.g. "Silver day"). Topics are the 14 NCEES FE Mechanical knowledge areas.
- Calories: net = eaten − body burn so far − logged exercise. Body burn defaults to **2,052 kcal/day** (editable, `prefs.dailyBurn`) and accrues evenly through the day, starting from the first day with a calorie entry (no burn before that); past days count the full amount. Informational only: **no calorie streak or goal.**
- A streak for today is "at risk," not broken, until the day ends.
- Forms remember choices in `prefs`: study topic and calorie Eaten/Burned are saved the moment you pick them; custom stretch region, amount, and unit are saved when you log. The day always resets to Today.
- Study and stretch: quick-add chips log instantly for today; Day only appears under Custom. Calories: typed number with the Add button beside it (moves below when More is open); Label and Day sit behind a ▾ toggle (aria-label "More calorie options") in the Type row, whose "Type" legend is visually hidden (still announced).
- Entries can be logged for today or any past date (DayPicker: "Today" or "Pick a date" → Calendar component in app colors, max = today). No future dates.

## Design rules
- Shared `Nav` has **two tabs only: Today (`/`) and Progress (`/progress`)**. All logging happens on Today. `/stretch`, `/study`, `/calories` are detail pages opened from Today's card headings ("Stretch ›", always styled as links: caramel, underlined); each starts with a "‹ Today" back link, the Today tab stays highlighted on them, and their Custom panels start (and stay) open (`customOpen`). Each detail page ends with a History card: all entries newest first, grouped by day with a day summary, 7 days at a time ("Show 7 more days"), Delete + Undo on every row. Stretch adds its weekly bars; FE study adds the weekly 420 bar and minutes per topic (collapsible, closed by default; summary names the least-studied topic).
- Use shared components from `components/ui/` everywhere (Button, Field, Input, Listbox, Chip, ChoiceGroup, Switch, DayPicker, Calendar, Card, ProgressBar, Toast). Stretch and study use one-tap quick-add chips (+30 s, +60 s; +1/+5/+10/+15/+30/+60 min) plus an expand chip that opens a typed amount and Day (Stretch, FE study, and Calories show just ▾ / ▴ with an aria-label like "More study options"). Study and Stretch each have a "Subtract" switch (takes time off that day's newest entries first, deleting entries it fully covers and shortening the next; capped at that topic's or region's time that day; Undo restores the exact entries; stays as you left it, even across reloads, until switched off manually). Don't hand-roll one-off inputs or buttons.
- Dropdowns use `Listbox` (themed ARIA listbox), not native `<select>`, whose menu the OS draws in its own colors.
- Forms: one column, a real `<label>` on every field, errors next to the field that say what to do next (e.g., "Enter calories as a whole number, like 250."), keep what the person typed, and focus the first invalid field.
- First visit (nothing saved) must offer one-tap useful actions, never an empty dead end or a tour.
- Accessibility: everything works with a keyboard, focus is visible, and text contrast meets WCAG AA (4.5:1).
- Simplicity: remove unnecessary steps, fields, and interactions.

## Progress page
- Sections: Streaks (all 5, current + best + status), Weekly goals (last 8 weeks as a table with meters), FE study (all-time total, 12-week calendar heatmap (under 5 empty, 5–14 a dim hint, then Bronze/Silver/Gold; one-hue ramp `ct-heat-1..3` + accent, validated), minutes per topic), Stretch (cumulative per region: time, days, average per week vs the 10-min goal; then a daily chart, shoulder + lower body stacked), Calorie trend (always 6 months, one week visible at a time, scrollable with the scrollbar hidden (`.ct-no-scrollbar`), opens on today; days before the first calorie log are blank ("No data yet"); consumed above zero, resting + active burn stacked below, net as a dot; no goal line), Backup and reset (download .json; "Import backup" validates every entry with `lib/backup.ts`, previews the file, then Merge (skips ids already present) or Replace, with Undo; "Clear history…" deletes all entries after an inline confirm, focus starts on Cancel, toast offers Undo; settings are kept).
- Charts are plain HTML/CSS, no library. Follow the dataviz rules: chart colors are tokens validated with the palette checker (`ct-chart`, `ct-heat-1`, `ct-heat-2`, accent; calorie breakdown `ct-consumed` saffron, `ct-resting` taupe (quiet baseline, emphasis form), `ct-active` red `#c63d4a` (saffron/red validated all-pairs); stretch `ct-shoulder` saffron, `ct-lower` taupe. Taupe fails color-only checks next to saffron and red, so every taupe series carries the `.ct-checker` pattern. In-bar labels: dark ink on saffron; cream on a dark chip over taupe. Both daily charts use the shared `components/progress/DailyChart.tsx`; one tab stop per chart with arrow-key navigation (`useRoving`); tooltips show on hover and focus; every chart has a "Show as table" view.
- Tailwind 4: a focus outline needs `outline-solid` along with `outline-2`, or it won't draw.
- After adding a new `--color-*` token in `app/globals.css`, restart `next dev`; the dev server can keep serving a stylesheet without it (and avoid running `next build` while dev is running).

## Workflow
- Work in small steps; commit at each checkpoint and **push to origin right after every commit**. Run `npm run lint` and `npm run build` before each commit.
