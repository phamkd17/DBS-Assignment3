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
- Weeks run **Sunday–Saturday** (local time). Dates are stored as local `YYYY-MM-DD`.
- Stretch: each region (shoulder, lower body) has its own **daily streak** (≥30 s that day) and **weekly streak** (≥10 min in a Sun–Sat week). Missing a region resets only that region. Default log amount (quick-log chip + form prefill): shoulder 30 s, lower body 60 s.
- Study: **daily streak** at ≥15 min. **Weekly goal 420 min** (60 × 7), shown as progress only, with no weekly study streak. Day tiers: 15 = Bronze, 30 = Silver, 60 = Gold (shown in the log toast, e.g. "Silver day"). Topics are the 14 NCEES FE Mechanical knowledge areas.
- Calories: net = eaten − body burn so far − logged exercise. Body burn defaults to **2,052 kcal/day** (editable, `prefs.dailyBurn`) and accrues evenly through the day; past days count the full amount. Informational only: **no calorie streak or goal.**
- A streak for today is "at risk," not broken, until the day ends.
- Forms remember your last logged choices (study topic; custom stretch region, amount, unit; calorie Eaten/Burned) in `prefs`. The day always resets to Today.
- Study and stretch: quick-add chips log instantly for today; Day only appears under Custom. Calories: typed number; Label and Day sit behind a "Custom" toggle in the Type row.
- Entries can be logged for today or any past date (DayPicker: "Today" or "Pick a date" → Calendar component in app colors, max = today). No future dates.

## Design rules
- Shared `Nav` has **two tabs only: Today (`/`) and Progress (`/progress`)**. All logging happens on Today. `/stretch`, `/study`, `/calories` are detail pages opened from Today's card headings ("Stretch ›"); each starts with a "‹ Today" back link, the Today tab stays highlighted on them, and their Custom panels start (and stay) open (`customOpen`). Each detail page ends with a History card: all entries newest first, grouped by day with a day summary, 7 days at a time ("Show 7 more days"), Delete + Undo on every row. Stretch adds its weekly bars; FE study adds the weekly 420 bar and minutes per topic (least studied flagged).
- Use shared components from `components/ui/` everywhere (Button, Field, Input, Select, Chip, ChoiceGroup, Switch, DayPicker, Calendar, Card, ProgressBar, Toast). Stretch and study use one-tap quick-add chips (+30 s, +60 s; +1/+5/+15/+30/+60 min) plus a "Custom ▾" chip that opens a typed amount and Day. Study and Stretch each have a "Subtract" switch (takes time off that day's newest entries first, deleting entries it fully covers and shortening the next; capped at that topic's or region's time that day; Undo restores the exact entries; stays as you left it, even across reloads, until switched off manually). Don't hand-roll one-off inputs or buttons.
- Forms: one column, a real `<label>` on every field, errors next to the field that say what to do next (e.g., "Enter calories as a whole number, like 250."), keep what the person typed, and focus the first invalid field.
- First visit (nothing saved) must offer one-tap useful actions, never an empty dead end or a tour.
- Accessibility: everything works with a keyboard, focus is visible, and text contrast meets WCAG AA (4.5:1).
- Simplicity: remove unnecessary steps, fields, and interactions.

## Progress page
- Sections: Streaks (all 5, current + best + status), Weekly goals (last 8 weeks as a table with meters), FE study (all-time total, 12-week calendar heatmap Bronze/Silver/Gold, minutes per topic), Calorie trend (always 6 months, scrollable, opens on today; days before the first calorie log are blank ("No data yet"); consumed above zero, resting + active burn stacked below, net as a dot; no goal line), Backup (download .json).
- Charts are plain HTML/CSS, no library. Follow the dataviz rules: chart colors are tokens validated with the palette checker (`ct-chart`, `ct-heat-1`, `ct-heat-2`, accent; calorie breakdown `ct-consumed`, `ct-resting`, `ct-active`, validated all-pairs); one tab stop per chart with arrow-key navigation (`useRoving`); tooltips show on hover and focus; every chart has a "Show as table" view.
- Tailwind 4: a focus outline needs `outline-solid` along with `outline-2`, or it won't draw.
- After adding a new `--color-*` token in `app/globals.css`, restart `next dev`; the dev server can keep serving a stylesheet without it (and avoid running `next build` while dev is running).

## Workflow
- Work in small steps; commit at each checkpoint and **push to origin right after every commit**. Run `npm run lint` and `npm run build` before each commit.
