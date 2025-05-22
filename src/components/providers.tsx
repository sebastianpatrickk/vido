"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";
import { getQueryClient } from "@/lib/get-query-client";
import { ConvexClientProvider } from "./convex-client-provider";

export const Providers = ({ children }: PropsWithChildren) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ConvexClientProvider>{children}</ConvexClientProvider>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
