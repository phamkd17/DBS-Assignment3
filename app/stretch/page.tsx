import { PageHeader } from "@/components/PageHeader";
import { StretchLogger } from "@/components/StretchLogger";
import { Card } from "@/components/ui/Card";

export default function StretchPage() {
  return (
    <>
      <PageHeader title="Stretch">At least 30 s a day keeps each region&apos;s streak. 10 min a week is the goal.</PageHeader>
      <Card>
        <StretchLogger />
      </Card>
    </>
  );
}
