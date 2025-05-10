import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Separator } from "@/components/ui/separator";
import { PageHeaderCard } from "@/components/page-header-card";

export default function SettingsPage() {
  return (
    <MaxWidthWrapper className="flex flex-col gap-y-4">
      <PageHeaderCard
        title="Settings"
        description="Configure the settings for this application"
      />
    </MaxWidthWrapper>
  );
}
