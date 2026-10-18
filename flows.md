# Flows

**Main task, in one sentence:**

> I log a stretch, my study minutes, and what I ate → today's streaks and weekly bars fill up → I come back tomorrow, my streaks are still alive, and my FE topic hours keep growing.

## 1. Map: pages and shared navigation

The nav has two tabs, **Today** and **Progress**. All logging happens on Today. Each Today card's heading opens a detail page for that routine, and every detail page has a "‹ Today" link back.

```mermaid
flowchart LR
  Nav{{"Shared nav: Today · Progress"}}
  Nav --> Today["/ Today<br/>log stretch, study, calories"]
  Nav --> Progress["/progress"]
  Today -- "Stretch ›" --> Stretch["/stretch"]
  Today -- "FE study ›" --> Study["/study"]
  Today -- "Calories ›" --> Calories["/calories"]
  Today -- "This week ›" --> Progress
  Stretch -- "‹ Today" --> Today
  Study -- "‹ Today" --> Today
  Calories -- "‹ Today" --> Today
  Progress -- export --> JSON[(Backup .json)]
```

## 2. First visit: useful right away

Nothing is saved yet. Instead of an empty screen or a tour, Today opens with a **Start here** card of three one-tap wins. The first tap starts a streak, and the card goes away.

```mermaid
flowchart TD
  A[Open app] --> B{Anything in localStorage?}
  B -- No --> C["Today + 'Start here' card:<br/>'Three small wins to begin.'"]
  B -- Yes --> R[[Return visit, flow 4]]
  B -- Storage unavailable --> X["Banner: 'Can't save on this device. Entries will be lost when you close the tab.'"]
  X --> C
  C --> D["+30 s Shoulder"]
  C --> E["+60 s Lower body"]
  C --> F["+15 min Statics"]
  D --> G["Toast: '1-day shoulder streak!' · Undo"]
  E --> G
  F --> G
  G --> H["Start card disappears"]
  H --> I["Cards show streak lines:<br/>'Shoulder 1-day ✓ · Lower body no streak yet'"]
```

## 3. Main task: log an entry (form + errors)

All three forms share the same `Field`/`Input`/`Button` components and the same validation pattern.

```mermaid
flowchart TD
  S[Log on Today, or a detail page] --> F["Fill the one-column form<br/>(day: Today, or Pick a date → calendar, no future dates)"]
  F --> V{Valid?}
  V -- Missing choice --> E1["Next to field: 'Pick shoulder or lower body.' / 'Pick a topic.' / 'Name what you ate, like Oatmeal.'"]
  V -- Missing or invalid number --> E2["Next to field: 'Enter minutes, like 15.' / 'Enter calories as a whole number, like 250.'"]
  V -- Unrealistic value --> E3["Next to field: 'That's over 10 hours. Check the number.'"]
  E1 --> K[Keep what was typed; focus the first invalid field]
  E2 --> K
  E3 --> K
  K --> F
  V -- Yes --> SAVE[(Save to localStorage)]
  SAVE --> T["Toast: 'Logged 15 min Statics · Undo'"]
  T -- Undo --> UNDO[Remove entry] --> F
  T --> L[Entry appears in today's list, which has delete + Undo]
  L --> ST{Milestone?}
  ST -- Study 15/30/60 --> M1["Tier reached: 'Bronze day' / 'Silver day' / 'Gold day'"]
  ST -- Region ≥10 min this week --> M2["Weekly goal hit: 'Shoulder weekly goal done. Anything more is bonus.'"]
  ST -- No --> P[Progress bars update]
```

## 4. Coming back: it remembers

```mermaid
flowchart TD
  O[Open app on a later day] --> W{"History saved, nothing logged today,<br/>banner not dismissed?"}
  W -- Yes --> WB["Welcome back."]
  WB --> AR["At risk: 'Stretch 30 s of shoulder to keep your 6-day streak.'"]
  WB --> WK["Weekly nudge: '3 days left this week: shoulder 4 min, FE study 180 min to go.'"]
  WB --> GOT["Got it, or log anything → banner hides for today"]
  W -- No --> CARDS
  GOT --> CARDS["Cards: streak lines per routine<br/>'Shoulder 6-day ✓ · Lower body reset · best 9'"]
  CARDS --> MISS{Forgot to log a day?}
  MISS -- Yes --> Y["Custom → Pick a date → log it → streak restored"]
  CARDS --> PR["This week › → /progress: streaks, weekly history,<br/>minutes per FE topic, calorie trend"]
  PR --> EX[Export backup .json]
```
