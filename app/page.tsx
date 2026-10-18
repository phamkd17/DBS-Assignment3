import { PageHeader } from "@/components/PageHeader";
import { TodayDashboard } from "@/components/TodayDashboard";

export default function TodayPage() {
  return (
    <>
      <PageHeader title="Today">Stretch, study for the FE, and track calories. Saved on this device.</PageHeader>
      <TodayDashboard />
    </>
  );
}
