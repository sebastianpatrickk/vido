import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import { cache } from "react";
import {
  Session,
  SessionValidationResult,
  sessionSchema,
} from "@/lib/validations/session";
import { userSchema } from "@/lib/validations/user";

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  return Buffer.from(tokenBytes).toString("base64url");
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("hex");
}

export async function getSessionById(
  sessionId: string,
): Promise<Session | null> {
  try {
    const sessionData = await redis.hgetall(`session:${sessionId}`);
    if (!sessionData) {
      return null;
    }

    const sessionResult = sessionSchema.safeParse(sessionData);
    if (!sessionResult.success) {
      console.error("Invalid session data in Redis:", sessionResult.error);
      return null;
    }

    return sessionResult.data;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  try {
    const sessionId = await hashToken(token);
    const sessionData = await redis.hgetall(`session:${sessionId}`);

    if (!sessionData) {
      return { session: null, user: null };
    }

    const sessionResult = sessionSchema.safeParse(sessionData);
    if (!sessionResult.success) {
      console.error("Invalid session data in Redis:", sessionResult.error);
      return { session: null, user: null };
    }

    const session = sessionResult.data;
    const now = Date.now();

    if (now >= session.expiresAt) {
      await redis.del(`session:${sessionId}`);
      return { session: null, user: null };
    }

    // Refresh session if it's close to expiring (15 days before expiry)
    if (now >= session.expiresAt - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = now + 1000 * 60 * 60 * 24 * 30;
      await redis.hset(`session:${sessionId}`, session);
      await redis.expire(
        `session:${sessionId}`,
        Math.floor((session.expiresAt - Date.now()) / 1000),
      );
    }

    const userData = await redis.hgetall(`user:${session.userId}`);
    if (!userData) {
      return { session: null, user: null };
    }

    const userResult = userSchema.safeParse(userData);
    if (!userResult.success) {
      console.error("Invalid user data in Redis:", userResult.error);
      return { session: null, user: null };
    }

    return { session, user: userResult.data };
  } catch (error) {
    console.error("Error validating session:", error);
    return { session: null, user: null };
  }
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("session")?.value ?? null;
      if (token === null) {
        return { session: null, user: null };
      }
      return validateSessionToken(token);
    } catch (error) {
      console.error("Error getting current session:", error);
      return { session: null, user: null };
    }
  },
);

export async function invalidateSession(sessionId: string): Promise<void> {
  try {
    await redis.del(`session:${sessionId}`);
  } catch (error) {
    console.error("Error invalidating session:", error);
    throw error;
  }
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  try {
    const sessions = await redis.keys(`session:*`);
    for (const sessionKey of sessions) {
      const sessionData = await redis.hgetall(sessionKey);
      if (sessionData?.userId === userId) {
        await redis.del(sessionKey);
      }
    }
  } catch (error) {
    console.error("Error invalidating user sessions:", error);
    throw error;
  }
}

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    });
  } catch (error) {
    console.error("Error setting session cookie:", error);
    throw error;
  }
}

export async function deleteSessionTokenCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });
  } catch (error) {
    console.error("Error deleting session cookie:", error);
    throw error;
  }
}

export async function createSession(userId: string): Promise<Session> {
  try {
    const token = generateSessionToken();
    const sessionId = await hashToken(token);
    const session: Session = {
      id: sessionId,
      userId,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };

    await redis.hset(`session:${sessionId}`, session);
    await redis.expire(
      `session:${sessionId}`,
      Math.floor((session.expiresAt - Date.now()) / 1000),
    );
    await setSessionTokenCookie(token, new Date(session.expiresAt));
    return session;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}
