"use client";

import { CalorieLogger } from "./CalorieLogger";
import { CardHeading } from "./CardHeading";
import { NetCalories } from "./NetCalories";
import { StartCard } from "./StartCard";
import { StreakLine } from "./StreakLine";
import { StretchLogger } from "./StretchLogger";
import { StudyLogger } from "./StudyLogger";
import { StudyMinutesToday } from "./StudyMinutesToday";
import { SubtractSwitch } from "./SubtractSwitch";
import { WeekProgress } from "./WeekProgress";
import { WelcomeBack } from "./WelcomeBack";
import { Card } from "./ui/Card";

/**
 * Today: Start card on a first visit, Welcome back on a new day, then one card per routine.
 * Each card's title opens its detail page.
 */
export function TodayDashboard() {
  return (
    <>
      <StartCard />
      <WelcomeBack />

      <Card className="flex flex-col gap-4">
        <CardHeading title="Stretch" href="/stretch" action={<SubtractSwitch pref="stretchSubtract" />} subline={<StreakLine kind="stretch" />} />
        <StretchLogger />
      </Card>

      <Card className="flex flex-col gap-4">
        <CardHeading
          title="FE study"
          href="/study"
          aside={<StudyMinutesToday />}
          action={<SubtractSwitch pref="studySubtract" />}
          subline={<StreakLine kind="study" />}
        />
        <StudyLogger />
      </Card>

      <Card className="flex flex-col gap-5">
        <CardHeading title="Calories" href="/calories" />
        <NetCalories />
        <CalorieLogger />
      </Card>

      <Card className="flex flex-col gap-4">
        <CardHeading title="This week" href="/progress" />
        <WeekProgress />
      </Card>
    </>
  );
}
