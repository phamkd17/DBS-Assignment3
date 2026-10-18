import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { StreakLine } from "@/components/StreakLine";
import { StretchLogger } from "@/components/StretchLogger";
import { SubtractSwitch } from "@/components/SubtractSwitch";
import { Card } from "@/components/ui/Card";

export default function StretchPage() {
  return (
    <>
      <BackLink />
      <PageHeader title="Stretch" action={<SubtractSwitch pref="stretchSubtract" />}>At least 30 s a day keeps each region&apos;s streak. 10 min a week is the goal.</PageHeader>
      <Card className="flex flex-col gap-5">
        <StreakLine kind="stretch" />
        <StretchLogger customOpen />
      </Card>
    </>
  );
}
