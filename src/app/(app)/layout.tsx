import { globalGETRateLimit } from "@/lib/auth/request";
import { getCurrentSession } from "@/lib/auth/session";
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
