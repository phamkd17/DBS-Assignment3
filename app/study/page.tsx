import { PageHeader } from "@/components/PageHeader";
import { StudyLogger } from "@/components/StudyLogger";
import { StudyToday } from "@/components/StudyToday";
import { Card } from "@/components/ui/Card";

export default function StudyPage() {
  return (
    <>
      <PageHeader title="FE study">Log each session. Today&apos;s total adds them up: 15 min Bronze, 30 Silver, 60 Gold.</PageHeader>
      <Card>
        <StudyToday />
      </Card>
      <Card>
        <StudyLogger />
      </Card>
    </>
  );
}
