"use client";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";

export default function GoogleOAuthButton() {
  const { signIn } = useAuthActions();

  return (
    <Button
      onClick={() => void signIn("google")}
      className="w-full h-11"
      variant="secondary"
    >
      Continue with Google
    </Button>
  );
}
