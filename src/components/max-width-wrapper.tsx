import { cn } from "@/lib/utils";

export default function MaxWidthWrapper({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full max-w-6xl mx-auto mt-8 px-4", className)}>
      {children}
    </div>
  );
}
