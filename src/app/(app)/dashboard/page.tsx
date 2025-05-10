import MaxWidthWrapper from "@/components/max-width-wrapper";
import { PageHeaderCard } from "@/components/page-header-card";

export default function Dashboard() {
  return (
    <MaxWidthWrapper>
      <PageHeaderCard
        title="Dashboard"
        description="Welcome to the dashboard"
      />
    </MaxWidthWrapper>
  );
}
