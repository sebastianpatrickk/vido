import { z } from "zod";

export const userSchema = z.object({
  id: z.string().nanoid(),
  googleId: z.string(),
  email: z.string().email(),
  name: z.string(),
  picture: z.string(),
});

export type User = z.infer<typeof userSchema>;
