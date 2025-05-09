import DashboardHeader from "@/components/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh flex flex-col">
      <DashboardHeader />

      <main className="flex-1">{children}</main>
    </div>
  );
}
