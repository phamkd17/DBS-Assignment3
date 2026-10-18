"use client";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { today , weekdayIndex } from "@/lib/dates";
import { markVisited, useRoutineData } from "@/lib/storage";
import { STRETCH_WEEKLY_SECONDS, STUDY_WEEKLY_MINUTES, dailyStretchStreak, formatDuration, studyStreak, weekTotals } from "@/lib/streaks";

/**
 * Coming back on a new day: streaks at risk and what's left this week.
 * Shows until you log something today or tap "Got it".
 */
export function WelcomeBack() {
  const data = useRoutineData();
  if (!data) return null;
  const day = today();
  const hasHistory = data.stretches.length + data.study.length + data.calories.length > 0;
  const loggedToday = [...data.stretches, ...data.study, ...data.calories].some((e) => e.date === day);
  if (!hasHistory || loggedToday || data.lastVisit === day) return null;

  const atRisk: string[] = [];
  const shoulder = dailyStretchStreak(data, "shoulder", day);
  const lower = dailyStretchStreak(data, "lower", day);
  const study = studyStreak(data, day);
  if (shoulder.status === "at-risk") atRisk.push(`Stretch 30 s of shoulder to keep your ${shoulder.current}-day streak.`);
  if (lower.status === "at-risk") atRisk.push(`Stretch 30 s of lower body to keep your ${lower.current}-day streak.`);
  if (study.status === "at-risk") atRisk.push(`Study 15 min to keep your ${study.current}-day FE streak.`);

  const week = weekTotals(data, day);
  const daysLeft = 7 - weekdayIndex(day);
  const needs = [
    week.shoulderSeconds < STRETCH_WEEKLY_SECONDS ? `shoulder ${formatDuration(STRETCH_WEEKLY_SECONDS - week.shoulderSeconds)}` : null,
    week.lowerSeconds < STRETCH_WEEKLY_SECONDS ? `lower body ${formatDuration(STRETCH_WEEKLY_SECONDS - week.lowerSeconds)}` : null,
    week.studyMinutes < STUDY_WEEKLY_MINUTES ? `FE study ${STUDY_WEEKLY_MINUTES - week.studyMinutes} min` : null,
  ].filter(Boolean);
  const when = daysLeft === 1 ? "Last day of the week" : `${daysLeft} days left this week`;
  const weekly = needs.length ? `${when}: ${needs.join(", ")} to go.` : "All weekly goals met. Anything more is a bonus.";

  return (
    <Card aria-labelledby="welcome-title" className="flex flex-col gap-3 border border-ct-selected">
      <h2 id="welcome-title" className="font-ct-serif text-2xl italic text-ct-text">
        Welcome back.
      </h2>
      <ul className="flex flex-col gap-1.5 font-ct-sans text-[15px] text-ct-linen">
        {atRisk.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden="true" className="text-ct-accent">●</span>
            {line}
          </li>
        ))}
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-ct-muted">●</span>
          {weekly}
        </li>
      </ul>
      <div>
        <Button variant="secondary" onClick={() => markVisited(day)}>
          Got it
        </Button>
      </div>
    </Card>
  );
}
