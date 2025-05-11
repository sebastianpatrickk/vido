import MaxWidthWrapper from "@/components/max-width-wrapper";
import { getCurrentSession } from "@/lib/actions/auth/session";
import { redirect } from "next/navigation";

export default async function FilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <MaxWidthWrapper className="flex flex-col gap-y-4">
      {children}
    </MaxWidthWrapper>
  );
}
