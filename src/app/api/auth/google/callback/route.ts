import { createSession } from "@/lib/actions/auth/session";
import { google } from "@/lib/auth/oauth";
import { cookies } from "next/headers";
import { createUser, getUserFromGoogleId } from "@/lib/actions/auth/user";
import { globalGETRateLimit } from "@/lib/actions/auth/request";
import { decodeIdToken, type OAuth2Tokens } from "arctic";
import { isEmailAllowed } from "@/lib/actions/auth/allowed-email";

export async function GET(request: Request): Promise<Response> {
  if (!globalGETRateLimit()) {
    return new Response("Too many requests", {
      status: 429,
    });
  }
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;
  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  const claims = decodeIdToken(tokens.idToken()) as {
    sub: string;
    name: string;
    picture: string;
    email: string;
  };

  const googleId = claims.sub;
  const name = claims.name;
  const picture = claims.picture;
  const email = claims.email;

  const existingUser = await getUserFromGoogleId(googleId);
  if (existingUser !== null) {
    await createSession(existingUser.id);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  const allowed = await isEmailAllowed(email);
  if (!allowed) {
    return new Response(
      "Your email is not authorized to access this application.",
      {
        status: 403,
      },
    );
  }

  const user = await createUser(googleId, email, name, picture);
  await createSession(user.id);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}
