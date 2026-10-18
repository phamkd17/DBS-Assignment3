import { CardHeading } from "@/components/CardHeading";
import { PageHeader } from "@/components/PageHeader";
import { TopicTotals } from "@/components/TopicTotals";
import { CalorieTrend } from "@/components/progress/CalorieTrend";
import { ExportBackup } from "@/components/progress/ExportBackup";
import { StreakBoard } from "@/components/progress/StreakBoard";
import { StretchTotal } from "@/components/progress/StretchTotal";
import { StudyCalendar } from "@/components/progress/StudyCalendar";
import { StudyTotal } from "@/components/progress/StudyTotal";
import { WeeklyHistory } from "@/components/progress/WeeklyHistory";
import { Card } from "@/components/ui/Card";

export default function ProgressPage() {
  return (
    <>
      <PageHeader title="Progress">Your streaks, weeks, and FE study over time.</PageHeader>
      <Card className="flex flex-col gap-4">
        <CardHeading title="Calorie trend" href="/calories" />
        <CalorieTrend />
      </Card>
      <Card className="flex flex-col gap-5">
        <CardHeading title="FE study" href="/study" />
        <StudyTotal />
        <StudyCalendar />
        <TopicTotals />
      </Card>
      <Card className="flex flex-col gap-4">
        <CardHeading title="Stretch" href="/stretch" />
        <StretchTotal />
      </Card>
      <Card className="flex flex-col gap-4">
        <CardHeading title="Streaks" />
        <StreakBoard />
      </Card>
      <Card className="flex flex-col gap-4">
        <CardHeading title="Weekly goals" />
        <WeeklyHistory />
      </Card>
      <Card className="flex flex-col gap-4">
        <CardHeading title="Backup and reset" />
        <ExportBackup />
      </Card>
    </>
  );
}
