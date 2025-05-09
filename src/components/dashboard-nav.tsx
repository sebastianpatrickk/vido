"use client";

import { Button } from "@/components/ui/button";
import { Files, House, KeyRound, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: <House className="size-4" />,
  },
  {
    label: "Files",
    href: "/dashboard/files",
    icon: <Files className="size-4" />,
  },
  {
    label: "API Keys",
    href: "/dashboard/api-keys",
    icon: <KeyRound className="size-4" />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="size-4" />,
  },
];

export default function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex items-center gap-2">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          size="xs"
          data-state={isActive(item.href) ? "active" : "inactive"}
          onClick={() => router.push(item.href)}
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </div>
  );
}
