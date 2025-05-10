import { redis } from "@/lib/redis";

const ALLOWED_EMAILS_KEY = "allowed_emails";

export async function isEmailAllowed(email: string): Promise<boolean> {
  const result = await redis.sismember(ALLOWED_EMAILS_KEY, email);
  return result === 1;
}

export async function addAllowedEmail(email: string): Promise<void> {
  await redis.sadd(ALLOWED_EMAILS_KEY, email);
}

export async function removeAllowedEmail(email: string): Promise<void> {
  await redis.srem(ALLOWED_EMAILS_KEY, email);
}

export async function getAllowedEmails(): Promise<string[]> {
  return await redis.smembers(ALLOWED_EMAILS_KEY);
}
