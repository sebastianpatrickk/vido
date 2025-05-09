import { z } from "zod";
import { userSchema } from "./user";

export const sessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  expiresAt: z.number().int().positive(),
});

export type Session = z.infer<typeof sessionSchema>;

export type SessionValidationResult =
  | { session: Session; user: z.infer<typeof userSchema> }
  | { session: null; user: null };
