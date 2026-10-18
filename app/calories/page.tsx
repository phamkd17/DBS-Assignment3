import { BackLink } from "@/components/BackLink";
import { CalorieHistory } from "@/components/CalorieHistory";
import { CalorieLogger } from "@/components/CalorieLogger";
import { CardHeading } from "@/components/CardHeading";
import { NetCalories } from "@/components/NetCalories";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";

export default function CaloriesPage() {
  return (
    <>
      <BackLink />
      <PageHeader title="Calories">Quick-add what you ate or burned. Just for tracking, with no goal.</PageHeader>
      <Card className="flex flex-col gap-5">
        <NetCalories />
        <CalorieLogger customOpen />
      </Card>
      <Card className="flex flex-col gap-4">
        <CardHeading title="History" />
        <CalorieHistory />
      </Card>
    </>
  );
}
