"use server";

import { globalPOSTRateLimit } from "@/lib/auth/request";
import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from "@/lib/auth/session";
import { redirect } from "next/navigation";

interface ActionResult {
  message: string;
}

export async function logoutAction(): Promise<ActionResult> {
  if (!globalPOSTRateLimit()) {
    return {
      message: "Too many requests",
    };
  }
  const { session } = await getCurrentSession();
  if (session === null) {
    return {
      message: "Not authenticated",
    };
  }
  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect("/login");
}
