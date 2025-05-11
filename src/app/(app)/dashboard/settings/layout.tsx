import MaxWidthWrapper from "@/components/max-width-wrapper";
import { getCurrentSession } from "@/lib/actions/auth/session";
import { redirect } from "next/navigation";
import { env } from "@/env";
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/login");
  }

  if (user.email !== env.NEXT_PUBLIC_OWNER_EMAIL) {
    redirect("/dashboard");
  }

  return (
    <MaxWidthWrapper className="flex flex-col gap-y-4">
      {children}
    </MaxWidthWrapper>
  );
}
