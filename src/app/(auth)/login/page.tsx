"use server";

import { globalGETRateLimit } from "@/lib/auth/request";
import { getCurrentSession } from "@/lib/auth/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  if (!globalGETRateLimit()) {
    return "Too many requests";
  }
  const { user } = await getCurrentSession();
  if (user !== null) {
    return redirect("/");
  }
  return (
    <div className="w-full p-4 max-w-md">
      <Link href="/api/auth/google">Sign in with Google</Link>
      <h1>Sign in</h1>
    </div>
  );
}
