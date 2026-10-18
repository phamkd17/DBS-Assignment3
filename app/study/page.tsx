import { PageHeader } from "@/components/PageHeader";
import { StudyLogger } from "@/components/StudyLogger";
import { StudyMinutesToday } from "@/components/StudyMinutesToday";
import { Card } from "@/components/ui/Card";

export default function StudyPage() {
  return (
    <>
      <PageHeader title="FE study" aside={<StudyMinutesToday />}>
        Log each session: 15 min Bronze, 30 Silver, 60 Gold.
      </PageHeader>
      <Card>
        <StudyLogger />
      </Card>
    </>
  );
}
