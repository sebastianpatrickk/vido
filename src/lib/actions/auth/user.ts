import { redis } from "@/lib/redis";
import { User, userSchema } from "@/lib/validations/user";
import { nanoid } from "nanoid";

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
