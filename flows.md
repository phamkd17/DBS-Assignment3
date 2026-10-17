# Flows

**Main task, in one sentence:**

> I log a stretch, my study minutes, and what I ate → today's streaks and weekly bars fill up → I come back tomorrow, my streaks are still alive, and my FE topic hours keep growing.

## 1. Map: pages and shared navigation

Every page is a route and shares the same nav, so you can always get back to Today.

```mermaid
flowchart LR
  Nav{{Shared nav}}
  Nav --> Today["/ Today"]
  Nav --> Stretch["/stretch"]
  Nav --> Study["/study"]
  Nav --> Calories["/calories"]
  Nav --> Progress["/progress"]
  Today -- quick-log chip --> Stretch
  Today -- quick-log chip --> Study
  Today -- quick-log chip --> Calories
  Progress -- export --> JSON[(Backup .json)]
```

## 2. First visit: useful right away

Nothing is saved yet. Instead of an empty screen or a tour, Today offers one-tap actions, and the first tap starts a streak.

```mermaid
flowchart TD
  A[Open app] --> B{Anything in localStorage?}
  B -- No --> C["Today: 'Track your stretching, FE study, and calories. Start with 30 seconds.'"]
  B -- Yes --> R[[Return visit, flow 4]]
  B -- Storage unavailable --> X["Banner: 'Can't save on this device. Entries will be lost when you close the tab.'"]
  X --> C
  C --> D["+30 s Shoulder"]
  C --> E["+60 s Lower body"]
  C --> F["+15 min FE study → pick a topic"]
  D --> G["Toast: 'Logged 30 s shoulder · Undo'"]
  E --> G
  F --> H["/study with minutes = 15, topic focused"]
  G --> I["Celebrate: '1-day shoulder streak!'"]
  I --> J[Shows what's left today: other region, study]
```

## 3. Main task: log an entry (form + errors)

All three forms share the same `Field`/`Input`/`Button` components and the same validation pattern.

```mermaid
flowchart TD
  S[Open /stretch, /study, or /calories] --> F["Fill the one-column form<br/>(day: Today, or Pick a date → calendar, no future dates)"]
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
  ST -- Study 15/30/60 --> M1["Tier reached: 'Minimum' / 'OK' / 'Gold day'"]
  ST -- Region ≥10 min this week --> M2["Weekly goal hit: 'Shoulder weekly goal done. Anything more is bonus.'"]
  ST -- No --> P[Progress bars update]
```

## 4. Coming back: it remembers

```mermaid
flowchart TD
  O[Open app on a later day] --> W["Today: 'Welcome back.'<br/>Yesterday's summary"]
  W --> C{Each streak}
  C -- Done yesterday, not today --> AR["At risk: 'Shoulder streak 6. Stretch 30 s to keep it.'"]
  C -- Missed a full day --> BR["Broken: 'Lower body streak reset. Your best was 9. Start again today.'"]
  C -- Done today --> OK[Checked off]
  W --> WK["This week: shoulder 6/10 min · lower body 10/10 ✓"]
  W --> MISS{Forgot to log a day?}
  MISS -- Yes --> Y["Pick a date → calendar → log it → streak restored"]
  AR --> Q[One-tap quick log]
  BR --> Q
  W --> PR["/progress: streaks (current + best), weekly history,<br/>minutes per FE topic, 14-day net calories"]
  PR --> EX[Export backup .json]
```
