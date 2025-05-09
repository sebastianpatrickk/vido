"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function GoogleOAuthButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("/api/auth/google")}
      className="w-full h-11"
      variant="secondary"
    >
      Continue with Google
    </Button>
  );
}
