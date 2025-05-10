import { redis } from "@/lib/redis";
import { User, userSchema } from "@/lib/validations/user";
import { nanoid } from "nanoid";

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

  await redis.hset(`user:${id}`, user);
  await redis.set(`user:googleId:${googleId}`, id);
  await redis.sadd("users", id);

  return user;
}

export async function getUserFromGoogleId(
  googleId: string,
): Promise<User | null> {
  const userId = await redis.get(`user:googleId:${googleId}`);
  if (!userId) {
    return null;
  }

  const userData = await redis.hgetall(`user:${userId}`);
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
