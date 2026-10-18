import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { StudyLogger } from "@/components/StudyLogger";
import { StudyMinutesToday } from "@/components/StudyMinutesToday";
import { SubtractSwitch } from "@/components/SubtractSwitch";
import { Card } from "@/components/ui/Card";

export default function StudyPage() {
  return (
    <>
      <BackLink />
      <PageHeader title="FE study" aside={<StudyMinutesToday />} action={<SubtractSwitch pref="studySubtract" />}>
        Log each session: 15 min Bronze, 30 Silver, 60 Gold.
      </PageHeader>
      <Card>
        <StudyLogger />
      </Card>
    </>
  );
}
