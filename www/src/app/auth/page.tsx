"use client";

import GoogleOAuthButton from "@/components/google-oauth-button";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <div className="w-full p-4 max-w-sm">
      <h1 className="text-lg text-center font-medium mb-6">Login to Vido</h1>
      <GoogleOAuthButton />
    </div>
  );
}
