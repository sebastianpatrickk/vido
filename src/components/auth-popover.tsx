"use client";

import { UserRoundIcon } from "lucide-react";
import { Button } from "./ui/button";
import { User } from "@/lib/validations/user";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "./logout-button";

export default function AuthPopover({ user }: { user: User }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserRoundIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="grid">
          <div className="py-2 px-3">
            <h4 className="text-sm font-medium leading-tight">{user.name}</h4>
            <p className="text-xs font-medium text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Separator />
          <div className="px-1">
            <LogoutButton className="my-1" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
