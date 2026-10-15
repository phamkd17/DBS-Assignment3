# Routine Tracker

A daily tracker for one person's routine: **shoulder and lower-body stretching**, **FE Mechanical exam study** (time per NCEES topic), and **net calories**. It saves to the browser (localStorage), so it remembers you on the device you use.

Built for *Design, Build, Ship* (MPCS 51238), Assignment 3: Patterns & Flows.

- **Live:** _TBD (Vercel URL)_
- **Stack:** Next.js, Tailwind CSS, localStorage. No database, accounts, or APIs.

## Who it's for and why you come back

It's built for me: I'm studying for the FE Mechanical exam and want to keep up a short daily stretching habit. The reason to come back is **streaks and visible progress**:

| Routine | Daily streak | Weekly streak |
|---|---|---|
| Shoulder stretch | ≥30 s that day | ≥10 min, Sun–Sat |
| Lower-body stretch | ≥30 s that day | ≥10 min, Sun–Sat |
| FE study | ≥15 min (15 Minimum · 30 OK · 60 Gold) | n/a |
| Calories | none: net total and trend only | n/a |

**Why 10 minutes per week?** Ingram et al. (*Sports Medicine*, 2024; 189 studies) found that static-stretching flexibility gains plateau at about 4 min per session and about 10 min per week per muscle group. The daily 30-second streak builds the habit, and the weekly streak tracks the dose that actually matters.

## Flows

**Main task:** I log a stretch, my study minutes, and what I ate → today's streaks and weekly bars fill up → I come back tomorrow, my streaks are still alive, and my FE topic hours keep growing.

Full diagrams with all states and errors are in [flows.md](flows.md).

```mermaid
flowchart LR
  subgraph First visit
    A[Open app, nothing saved] --> B["One-tap: +30 s Shoulder / +60 s Lower body / +15 min study"]
  end
  subgraph Main task
    B --> C[Log on /stretch, /study, /calories]
    C --> D{Valid?}
    D -- No --> E["Error next to field, input kept"] --> C
    D -- Yes --> F["Saved · Toast with Undo"]
    F --> G["Streaks + weekly bars fill up"]
  end
  subgraph Coming back
    G --> H["Next day: 'Welcome back'"]
    H --> I["At-risk / broken streaks, this week's progress"]
    I --> C
    H --> J["/progress: streaks, FE topic hours, calorie trend"]
  end
```

## Onboarding research

_TBD (Step 3)_

## First-run check (agent usability feedback)

_TBD (Step 11)_

## Run locally

```bash
npm install
npm run dev
```
