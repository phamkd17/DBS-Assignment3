import { CalorieLogger } from "@/components/CalorieLogger";
import { NetCalories } from "@/components/NetCalories";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";

export default function CaloriesPage() {
  return (
    <>
      <BackLink />
      <PageHeader title="Calories">Quick-add what you ate or burned. Just for tracking, with no goal.</PageHeader>
      <Card>
        <NetCalories />
      </Card>
      <Card>
        <CalorieLogger />
      </Card>
    </>
  );
}
