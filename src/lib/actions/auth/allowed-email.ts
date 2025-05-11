"use server";

import { env } from "@/env";
import { redis } from "@/lib/redis";
import { AllowedEmails } from "@/lib/validations/allowed-emails";
import { getCurrentSession, invalidateUserSessions } from "./session";
import { deleteUserData } from "./user";

const ALLOWED_EMAILS_KEY = "allowed_emails";

export async function isEmailAllowed(email: string): Promise<boolean> {
  const result = await redis.sismember(ALLOWED_EMAILS_KEY, email);
  if (result === 1) {
    return true;
  }
  return email === env.NEXT_PUBLIC_OWNER_EMAIL;
}

export async function editAllowedEmails(
  emails: AllowedEmails,
): Promise<AllowedEmails> {
  const { user } = await getCurrentSession();

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (user.email !== env.NEXT_PUBLIC_OWNER_EMAIL) {
    throw new Error("Not authorized");
  }

  const emailsWithoutOwner = emails.filter(
    (email) => email.email !== env.NEXT_PUBLIC_OWNER_EMAIL,
  );

  const currentEmails = await redis.smembers(ALLOWED_EMAILS_KEY);
  const newEmails = emailsWithoutOwner.map((email) => email.email);

  const emailsToAdd = newEmails.filter(
    (email) => !currentEmails.includes(email),
  );

  const emailsToRemove = currentEmails.filter(
    (email) => !newEmails.includes(email),
  );

  if (emailsToAdd.length === 0 && emailsToRemove.length === 0) {
    return emailsWithoutOwner;
  }

  const pipeline = redis.pipeline();

  for (const email of emailsToAdd) {
    pipeline.sadd(ALLOWED_EMAILS_KEY, email);
  }

  for (const email of emailsToRemove) {
    pipeline.srem(ALLOWED_EMAILS_KEY, email);
  }

  await pipeline.exec();

  await Promise.all(emailsToRemove.map((email) => deleteUserData(email)));

  return emails;
}

export async function removeAllowedEmails(
  emails: AllowedEmails,
): Promise<void> {
  await redis.srem(ALLOWED_EMAILS_KEY, ...emails.map((email) => email.email));
}

export async function getAllowedEmails(): Promise<AllowedEmails> {
  const result = await redis.smembers(ALLOWED_EMAILS_KEY);
  return result.map((email) => ({ email }));
}
