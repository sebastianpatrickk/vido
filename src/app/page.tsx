import { LogoutButton } from "@/components/logout-button";
import { globalGETRateLimit } from "@/lib/auth/request";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Home() {
  if (!globalGETRateLimit()) {
    return "Too many requests";
  }
  const { user } = await getCurrentSession();
  if (user === null) {
    return redirect("/login");
  }
  return (
    <>
      <h1>Hi, {user.name}!</h1>
      <img src={user.picture} height="100px" width="100px" alt="profile" />
      <p>Email: {user.email}</p>
      <LogoutButton />
    </>
  );
}
