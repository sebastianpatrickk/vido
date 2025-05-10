import MaxWidthWrapper from "@/components/max-width-wrapper";
import { PageHeaderCard } from "@/components/page-header-card";

export default function FilesPage() {
  return (
    <MaxWidthWrapper>
      <PageHeaderCard
        title="Files"
        description="These are all of the files that have been uploaded via your uploader."
      />
    </MaxWidthWrapper>
  );
}
