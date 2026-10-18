import { BackLink } from "@/components/BackLink";
import { CardHeading } from "@/components/CardHeading";
import { PageHeader } from "@/components/PageHeader";
import { StreakLine } from "@/components/StreakLine";
import { StretchHistory } from "@/components/StretchHistory";
import { StretchLogger } from "@/components/StretchLogger";
import { StretchTimeToday } from "@/components/StretchTimeToday";
import { SubtractSwitch } from "@/components/SubtractSwitch";
import { WeekProgress } from "@/components/WeekProgress";
import { Card } from "@/components/ui/Card";

export default function StretchPage() {
  return (
    <>
      <BackLink />
      <PageHeader title="Stretch" action={<SubtractSwitch pref="stretchSubtract" />} subline={<StretchTimeToday />}>
        At least 30 s a day keeps each region&apos;s streak. 10 min a week is the goal.
      </PageHeader>
      <Card className="flex flex-col gap-5">
        <StreakLine kind="stretch" />
        <StretchLogger customOpen />
      </Card>
      <Card className="flex flex-col gap-4">
        <CardHeading title="This week" />
        <WeekProgress show={["stretch"]} />
      </Card>
      <Card className="flex flex-col gap-4">
        <CardHeading title="History" />
        <StretchHistory />
      </Card>
    </>
  );
}
