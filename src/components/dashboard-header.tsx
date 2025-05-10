import { buttonVariants } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/actions/auth/session";
import { CircleHelp } from "lucide-react";
import Link from "next/link";
import DashboardNav from "./dashboard-nav";
import AuthPopover from "./auth-popover";
import { ModeToggle } from "./mode-toggle";

export default async function DashboardHeader() {
  const { user } = await getCurrentSession();

  return (
    <header className="flex h-12 items-center flex-shrink-0 border-b">
      <div className="flex items-center justify-between h-full pr-3 flex-1 overflow-x-auto gap-x-8 pl-4">
        <Link href="/dashboard" className="text-sm font-medium">
          Vido
        </Link>
        <DashboardNav />

        <div className="flex items-center gap-2">
          <Link
            href="/docs"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <CircleHelp className="size-4" />
          </Link>
          <ModeToggle />
          {user && <AuthPopover user={user} />}
        </div>
      </div>
    </header>
  );
}
