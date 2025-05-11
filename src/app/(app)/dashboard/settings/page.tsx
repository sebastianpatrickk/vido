import MaxWidthWrapper from "@/components/max-width-wrapper";
import { PageHeaderCard } from "@/components/page-header-card";
import AllowedEmailsForm from "@/components/allowed-emails-form";
import { getQueryClient } from "@/lib/get-query-client";
import { getAllowedEmails } from "@/lib/actions/auth/allowed-email";
import { allowedEmailKeys } from "@/lib/queries/allowed-email";
import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";

export default async function SettingsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: allowedEmailKeys.all,
    queryFn: getAllowedEmails,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageHeaderCard
        title="Settings"
        description="Configure the settings for this application"
      />
      <AllowedEmailsForm />
    </HydrationBoundary>
  );
}
