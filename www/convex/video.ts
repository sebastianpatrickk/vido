import { videoInfoSchema } from "@/lib/schemas/video"
import { zCustomMutation } from "convex-helpers/server/zod"
import { internalMutation } from "./_generated/server"
import { z } from "zod/v3"
import { NoOp } from "convex-helpers/server/customFunctions"
import { Id } from "./_generated/dataModel"

const zCreateVideosInternalMutation = zCustomMutation(internalMutation, NoOp)

export const createVideos = zCreateVideosInternalMutation({
  args: {
    videos: z.array(videoInfoSchema),
  },
  handler: async (ctx, args) => {
    const { videos } = args

    const allTagNames = new Set<string>()
    for (const video of videos) {
      for (const tag of video.tags) {
        allTagNames.add(tag)
      }
    }

    const tagNameToId: Record<string, string> = {}
    const missingTagNames: string[] = []

    for (const tagName of allTagNames) {
      const existingTag = await ctx.db
        .query("tags")
        .withIndex("by_name", (q) => q.eq("name", tagName))
        .first()

      if (existingTag) {
        tagNameToId[tagName] = existingTag._id
      } else {
        missingTagNames.push(tagName)
      }
    }

    for (const tagName of missingTagNames) {
      const tagId = await ctx.db.insert("tags", { name: tagName })
      tagNameToId[tagName] = tagId
    }

    const createdVideos: { id: Id<"videos">; name: string }[] = []

    for (const video of videos) {
      const videoId = await ctx.db.insert("videos", {
        name: video.name,
      })
      createdVideos.push({ id: videoId, name: video.name })

      for (const tagName of video.tags) {
        const tagId = tagNameToId[tagName] as Id<"tags">
        await ctx.db.insert("videoTags", {
          videoId,
          tagId,
        })
      }
    }

    return {
      createdVideos,
    }
  },
})
