import { v } from "convex/values"
import { internalMutation } from "./_generated/server"

export const logApiUsage = internalMutation({
  args: {
    apiKeyId: v.id("apiKeys"),
    userId: v.id("users"),
    endpoint: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("apiUsage", {
      apiKeyId: args.apiKeyId,
      userId: args.userId,
      endpoint: args.endpoint,
      data: args.data,
      timestamp: Date.now(),
    })
  },
})
