import { globalGETRateLimit } from "@/lib/actions/auth/request";
import { getCurrentSession } from "@/lib/actions/auth/session";
import { redirect } from "next/navigation";
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!globalGETRateLimit()) {
    return "Too many requests";
  }
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
