import { env } from "@/env";
import { redis } from "@/lib/redis";
import { User, userSchema } from "@/lib/validations/user";
import { nanoid } from "nanoid";
import { getCurrentSession, invalidateUserSessions } from "./session";

export const USER_KEY = "user";
export const USERS_KEY = "users";
export const GOOGLE_ID_KEY = "googleId";

export async function createUser(
  googleId: string,
  email: string,
  name: string,
  picture: string,
): Promise<User> {
  const id = nanoid();
  const user: User = {
    id,
    googleId,
    email,
    name,
    picture,
  };

  await Promise.all([
    redis.hset(`${USER_KEY}:${id}`, user),
    redis.set(`${USER_KEY}:${GOOGLE_ID_KEY}:${googleId}`, id),
    redis.sadd(USERS_KEY, id),
  ]);

  return user;
}

export async function getUserFromGoogleId(
  googleId: string,
): Promise<User | null> {
  const userId = await redis.get(`${USER_KEY}:${GOOGLE_ID_KEY}:${googleId}`);
  if (!userId) {
    return null;
  }

  const userData = await redis.hgetall(`${USER_KEY}:${userId}`);
  if (!userData) {
    return null;
  }

  const result = userSchema.safeParse(userData);
  if (!result.success) {
    console.error("Invalid user data in Redis:", result.error);
    return null;
  }

  return result.data;
}

export async function getUsersByEmails(emails: string[]): Promise<User[]> {
  const users: User[] = [];
  const allUserIds = await redis.smembers(USERS_KEY);

  for (const userId of allUserIds) {
    const userData = await redis.hgetall(`${USER_KEY}:${userId}`);
    if (!userData) continue;

    const result = userSchema.safeParse(userData);
    if (!result.success) {
      console.error("Invalid user data in Redis:", result.error);
      continue;
    }

    if (emails.includes(result.data.email.toLowerCase())) {
      users.push(result.data);
    }
  }

  return users;
}

export async function deleteUserData(email: string): Promise<void> {
  const { user } = await getCurrentSession();

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (user.email !== env.NEXT_PUBLIC_OWNER_EMAIL) {
    throw new Error("Not authorized");
  }

  const users = await getUsersByEmails([email]);

  if (users.length === 0) {
    return;
  }

  const userToDelete = users[0];

  await Promise.all([
    redis.del(`${USER_KEY}:${userToDelete.id}`),
    redis.del(`${USER_KEY}:${GOOGLE_ID_KEY}:${userToDelete.googleId}`),
    redis.srem(USERS_KEY, userToDelete.id),
  ]);

  await invalidateUserSessions(userToDelete.id);
}
