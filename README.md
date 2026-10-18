# Routine Tracker

A daily tracker for one person's routine: **shoulder and lower-body stretching**, **FE Mechanical exam study** (time per NCEES topic), and **net calories**. It saves to the browser (localStorage), so it remembers you on the device you use.

Built for *Design, Build, Ship* (MPCS 51238), Assignment 3: Patterns & Flows.

- **Live:** https://dbs-assignment3-zeta.vercel.app
- **Code:** https://github.com/phamkd17/DBS-Assignment3
- **Stack:** Next.js, Tailwind CSS, localStorage. No database, accounts, or APIs.

## Who it's for and why you come back

It's built for me: I'm studying for the FE Mechanical exam and want to keep up a short daily stretching habit. The reason to come back is **streaks and visible progress**:

| Routine | Daily streak | Weekly streak |
|---|---|---|
| Shoulder stretch | ≥30 s that day | ≥10 min, Sun–Sat |
| Lower-body stretch | ≥30 s that day | ≥10 min, Sun–Sat |
| FE study | ≥15 min (15 Bronze · 30 Silver · 60 Gold) | Goal: 420 min, Sun–Sat (progress bar, no streak) |
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
    B --> C[Log on Today: stretch, study, calories]
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

I sent three subagents to study how similar tools welcome someone new: the first screen, what it asks for, and how soon you get something useful.

| | **Duolingo** (streaks) | **Lose It!** (calorie logging) | **Bend** (stretching) |
|---|---|---|---|
| First screen | Mascot + one-line pitch + "Get Started" | Goal-driven setup (exact first screen unverified) | Welcome + "Get Started" |
| Asks before value | ~6 questions: goal, daily minutes, level | Long profile: weight, goal, activity, sign-up | 16–20-step quiz, rating prompt, 2 paywalls |
| Time to first value | ~1.5–3 min | "Within minutes"; 45–90 s per meal | ~2 min before the first stretch |
| Sign-up | After the first lesson | Up front | After the first workout |
| Return hook | Instant "1-day streak!", milestone celebrations, Streak Freeze | Quick Add, recent foods | Day streak + "Bendometer" consistency score |

**Pattern:** the best experiences let you *do the thing* before asking anything. All three add friction to sell subscriptions; this tool has no account or paywall, so it can skip straight to logging.

**What I'm using**
- **Ask nothing first** (Duolingo, Bend): the first screen is one-tap log buttons (+30 s Shoulder, +60 s Lower body, +15 min study). No questions, no setup.
- **Celebrate the first log** (Duolingo): the first tap immediately shows "1-day shoulder streak!", with bigger moments saved for 7 and 30 days.
- **Calorie Quick Add** (Lose It!): just a number + optional label, with an Eaten / Burned toggle. Net is shown without a budget or "calories remaining."

**What I'm not using**
- Long questionnaires, rating prompts, paywalls (all three).
- Streak Freeze (Duolingo): I kept the strict rule (miss a day and that region resets). Logging for a past date (calendar picker) already covers forgetting to log.
- Recent-entry chips, meal tags, consistency score: left out to keep it simple.

Sources: [Duolingo blog: streak habit](https://blog.duolingo.com/how-duolingo-streak-builds-habit/) · [Duolingo blog: improving the streak](https://blog.duolingo.com/improving-the-streak/) · [Gummble: Duolingo onboarding](https://gummble.com/blog/duolingo-onboarding-flow-analysis) · [Appcues GoodUX: Duolingo](https://goodux.appcues.com/blog/duolingo-user-onboarding) · [RevenueCat: Lose It! onboarding length](https://www.revenuecat.com/blog/growth/why-your-onboarding-experience-might-be-too-short) · [Lose It! review](https://calorie-trackers.com/reviews/lose-it/) · [ScreensDesign: Bend flow](https://screensdesign.com/showcase/stretching-flexibility-bend) · [Pratt IxD: Bend critique](https://ixd.prattsi.org/2024/09/design-critique-bend/) · [Bustle: Bend review](https://www.bustle.com/wellness/bend-stretching-app-review-price-features-subscriptions)

## Accessibility check

Checked with my agent on Oct 17, 2026, against WCAG 2.1 AA.

**Automated scan (axe-core):** all 5 pages, both empty (first visit) and with 30 days of data, with every collapsible section open. The first run found 3 issues, all fixed; the final run is **0 violations on all 10 page states**.
- Study quick-add chips had an accessible name ("Add 1 minute") that didn't match the visible text ("+1 min"). Removed the extra label.
- Chart day columns used `aria-label` without a role. They now use `role="img"`.
- "Show as table" scroll areas couldn't be reached by keyboard. They're now focusable, named regions.

**Keyboard:** I tabbed through every page in a real browser. Every control is reachable in a logical order, and every stop shows a visible saffron focus ring.
- "Skip to content" is the first stop.
- Pill choices (Eaten/Burned, Region, Day) are native radio groups: one Tab stop, then arrow keys.
- Each chart is one Tab stop: arrow keys move a day, Page Up/Down a week, and the tooltip shows on focus as well as hover.
- The calendar date picker works with arrows, Home/End, and Page Up/Down.
- Collapsible sections use native `<details>`.

**Labels:** every input has a real `<label>`; pill groups use `<fieldset>` + `<legend>`. Errors are tied to their fields with `aria-describedby` and `aria-invalid`, and focus moves to the first invalid field.

**Text contrast** (computed, including semi-transparent text blended onto its background):

| Pair | Ratio | Needs |
|---|---|---|
| Body text (cream) on card | 14.1:1 | 4.5:1 |
| Secondary text (linen) on card | 11.4:1 | 4.5:1 |
| Hints / muted text on card | 8.4:1 | 4.5:1 |
| Small muted 70% text (12px) | 4.8:1 | 4.5:1 |
| Link (caramel) on card | 5.7:1 | 4.5:1 |
| Error text (rose) on card | 6.4:1 | 4.5:1 |
| Primary button (espresso on saffron) | 8.4:1 | 4.5:1 |
| Selected pill (cream on claret) | 8.7:1 | 4.5:1 |
| Chart label (dark ink on saffron) | 5.6:1 | 4.5:1 |
| Input border vs card (UI) | 3.6:1 | 3:1 |
| Focus ring vs page (UI) | 8.4:1 | 3:1 |
| Placeholder example text (muted 75%) | 4.8:1 | 4.5:1 |

Placeholder hints ("e.g. 250") started at 3.6:1 because I'd asked for them dimmer. I raised them to 4.8:1 so they pass AA and still read lighter than typed text (12.3:1).

**Charts:** colors were checked with a palette validator for colorblind (protan/deutan) and normal-vision separation on the dark card. Taupe can't be told apart by color alone, so taupe series always get a checker pattern. Every chart has a "Show as table" view, so no value depends on color or hover.

**Also:** respects "reduce motion"; warns when the browser blocks storage (private mode), so entries aren't silently lost.

## First-run check (agent usability feedback)

_TBD (Step 11)_

## Run locally

```bash
npm install
npm run dev
```
