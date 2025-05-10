"use client";

import { logoutAction } from "@/lib/actions/auth/logout";
import { useActionState } from "react";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const initialState = {
  message: "",
};

export function LogoutButton({ className }: { className?: string }) {
  const [, action] = useActionState(logoutAction, initialState);
  return (
    <form action={action}>
      <Button
        variant="ghost"
        className={cn(
          "text-muted-foreground hover:text-accent-foreground w-full flex justify-start text-xs h-7 py-1.5 px-2 rounded-sm",
          className,
        )}
      >
        Sign out
      </Button>
    </form>
  );
}
