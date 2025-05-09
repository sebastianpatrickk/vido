import { globalGETRateLimit } from "@/lib/auth/request";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import GoogleOAuthButton from "@/components/google-oauth-button";

export const dynamic = "force-dynamic";

export default async function Page() {
  if (!globalGETRateLimit()) {
    return "Too many requests";
  }
  const { user } = await getCurrentSession();
  if (user !== null) {
    return redirect("/dashboard");
  }
  return (
    <div className="w-full p-4 max-w-sm">
      <h1 className="text-lg text-center font-medium mb-6">Login to Vido</h1>
      <GoogleOAuthButton />
    </div>
  );
}
