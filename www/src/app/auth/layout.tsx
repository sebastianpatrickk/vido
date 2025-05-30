export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center flex-1 min-h-svh">
      {children}
    </div>
  );
}
