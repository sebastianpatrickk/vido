import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface PageHeaderCardProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageHeaderCard({
  title,
  description,
  children,
}: PageHeaderCardProps) {
  return (
    <div className="grid gap-y-2">
      <h1 className="font-medium">{title}</h1>
      <p className="text-sm text-muted-foreground font-medium">{description}</p>
      {children}
    </div>
  );
}
