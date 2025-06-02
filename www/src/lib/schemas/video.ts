import { z } from "zod/v3"

export const videoInfoSchema = z.object({
  name: z.string(),
  tags: z.array(z.string()),
  fileType: z.string(),
  path: z.string(),
})

export type VideoInfo = z.infer<typeof videoInfoSchema>

export const videosInfoSchema = z.array(videoInfoSchema)
