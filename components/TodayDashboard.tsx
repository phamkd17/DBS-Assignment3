"use client";

import { CalorieLogger } from "./CalorieLogger";
import { CardHeading } from "./CardHeading";
import { NetCalories } from "./NetCalories";
import { StartCard } from "./StartCard";
import { StretchLogger } from "./StretchLogger";
import { StretchTimeToday } from "./StretchTimeToday";
import { StudyLogger } from "./StudyLogger";
import { StudyMinutesToday } from "./StudyMinutesToday";
import { SubtractSwitch } from "./SubtractSwitch";
import { WeekProgress } from "./WeekProgress";
import { WelcomeBack } from "./WelcomeBack";
import { Card } from "./ui/Card";

/**
 * Today: Start card on a first visit, Welcome back on a new day, This week, Calories, then Stretch and FE study.
 * Each card's title opens its detail page.
 */
export function TodayDashboard() {
  return (
    <>
      <StartCard />
      <WelcomeBack />

      <Card className="flex flex-col gap-3">
        <CardHeading title="This week" href="/progress" action={<span className="font-ct-sans text-xs text-ct-muted/70">Resets Sunday</span>} />
        <WeekProgress weekLine={false} />
      </Card>

      <Card className="flex flex-col gap-3">
        <CardHeading title="Calories" href="/calories" />
        <NetCalories />
        <CalorieLogger />
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex flex-col">
          <CardHeading title="Stretch" href="/stretch" action={<SubtractSwitch pref="stretchSubtract" />} />
          <StretchTimeToday />
        </div>
        <StretchLogger />
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex flex-col">
          <CardHeading title="FE study" href="/study" action={<SubtractSwitch pref="studySubtract" />} />
          <StudyMinutesToday />
        </div>
        <StudyLogger />
      </Card>
    </>
  );
}
