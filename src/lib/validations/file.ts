import { z } from "zod";

export const fileSchema = z.object({
  id: z.string().nanoid(),
  cloudflareId: z.string().nullable(),
  url: z.string().nullable(),
  code: z.string().nullable(),
  name: z.string(),
  size: z.number().nullable(),
  tags: z.array(z.string()).nullable().default([]),
  uploaded: z.coerce.date(),
});

export type File = z.infer<typeof fileSchema>;
