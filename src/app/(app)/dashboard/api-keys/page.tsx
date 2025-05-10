import MaxWidthWrapper from "@/components/max-width-wrapper";
import { PageHeaderCard } from "@/components/page-header-card";

export default function ApiKeysPage() {
  return (
    <MaxWidthWrapper>
      <PageHeaderCard
        title="API Keys"
        description="View and manage your Vido API keys."
      />
    </MaxWidthWrapper>
  );
}
