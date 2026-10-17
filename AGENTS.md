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
- Study: **daily streak** at ≥15 min. Day tiers: 15 = Minimum, 30 = OK, 60 = Gold. Topics are the 14 NCEES FE Mechanical knowledge areas.
- Calories: net (eaten − burned) is informational only. **No calorie streak or goal.**
- A streak for today is "at risk," not broken, until the day ends.
- Entries can be logged for today or any past date (DayPicker: "Today" or "Pick a date" → native calendar, max = today). No future dates.

## Design rules
- Each flow step is its own route: `/`, `/stretch`, `/study`, `/calories`, `/progress`, with a shared `Nav` (`aria-current="page"`).
- Use shared components from `components/ui/` everywhere (Button, Field, Input, Select, Chip, ChoiceGroup, AmountPicker, DayPicker, Card, ProgressBar, Toast). Amounts (minutes, durations) use AmountPicker: preset pills plus a Custom pill that opens a manual entry field. Don't hand-roll one-off inputs or buttons.
- Forms: one column, a real `<label>` on every field, errors next to the field that say what to do next (e.g., "Enter calories as a whole number, like 250."), keep what the person typed, and focus the first invalid field.
- First visit (nothing saved) must offer one-tap useful actions, never an empty dead end or a tour.
- Accessibility: everything works with a keyboard, focus is visible, and text contrast meets WCAG AA (4.5:1).
- Simplicity: remove unnecessary steps, fields, and interactions.

## Workflow
- Work in small steps; commit at each checkpoint and **push to origin right after every commit**. Run `npm run lint` and `npm run build` before each commit.
