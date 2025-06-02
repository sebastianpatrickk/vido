import { defineSchema, defineTable } from "convex/server"
import { authTables } from "@convex-dev/auth/server"
import { v } from "convex/values"

const schema = defineSchema({
  ...authTables,
  videos: defineTable({
    name: v.string(),
  }),
  tags: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),
  videoTags: defineTable({
    videoId: v.id("videos"),
    tagId: v.id("tags"),
  })
    .index("by_videoId", ["videoId"])
    .index("by_tagId", ["tagId"]),

  apiKeys: defineTable({
    userId: v.id("users"),
    name: v.string(),
    key: v.string(),
    isActive: v.boolean(),
    lastUsed: v.optional(v.number()),
    usageCount: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_key", ["key"]),
  apiUsage: defineTable({
    apiKeyId: v.id("apiKeys"),
    userId: v.id("users"),
    endpoint: v.string(),
    data: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_api_key", ["apiKeyId"])
    .index("by_user", ["userId"]),
})

export default schema
