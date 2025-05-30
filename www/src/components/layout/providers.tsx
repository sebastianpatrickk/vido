"use client";

import { ConvexClientProvider } from "./convex-client-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
