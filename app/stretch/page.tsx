import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { StretchLogger } from "@/components/StretchLogger";
import { SubtractSwitch } from "@/components/SubtractSwitch";
import { Card } from "@/components/ui/Card";

export default function StretchPage() {
  return (
    <>
      <BackLink />
      <PageHeader title="Stretch" action={<SubtractSwitch pref="stretchSubtract" />}>At least 30 s a day keeps each region&apos;s streak. 10 min a week is the goal.</PageHeader>
      <Card>
        <StretchLogger customOpen />
      </Card>
    </>
  );
}
