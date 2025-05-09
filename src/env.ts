import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    KV_REST_API_URL: z.string().url(),
    KV_REST_API_TOKEN: z.string(),
  },
  // client: {},
  runtimeEnv: {
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  },
});
