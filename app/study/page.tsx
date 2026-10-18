import { BackLink } from "@/components/BackLink";
import { CardHeading } from "@/components/CardHeading";
import { PageHeader } from "@/components/PageHeader";
import { StreakLine } from "@/components/StreakLine";
import { StudyHistory } from "@/components/StudyHistory";
import { StudyLogger } from "@/components/StudyLogger";
import { StudyMinutesToday } from "@/components/StudyMinutesToday";
import { SubtractSwitch } from "@/components/SubtractSwitch";
import { TopicTotals } from "@/components/TopicTotals";
import { WeekProgress } from "@/components/WeekProgress";
import { Card } from "@/components/ui/Card";

export default function StudyPage() {
  return (
    <>
      <BackLink />
      <PageHeader title="FE study" action={<SubtractSwitch pref="studySubtract" />} subline={<StudyMinutesToday />}>
        Log each session: 15 min Bronze, 30 Silver, 60 Gold.
      </PageHeader>
      <Card className="flex flex-col gap-5">
        <StreakLine kind="study" />
        <StudyLogger customOpen />
      </Card>
      <Card className="flex flex-col gap-4">
        <CardHeading title="This week" />
        <WeekProgress show={["study"]} />
      </Card>
      <Card className="flex flex-col gap-4">
        <CardHeading title="Minutes per topic" />
        <TopicTotals />
      </Card>
      <Card className="flex flex-col gap-4">
        <CardHeading title="History" />
        <StudyHistory />
      </Card>
    </>
  );
}
