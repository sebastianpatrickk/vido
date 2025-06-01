import { v } from "convex/values"
import { query, mutation, internalMutation } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"
import { nanoid } from "nanoid"

export const createApiKey = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const apiKey = nanoid(32)

    const keyId = await ctx.db.insert("apiKeys", {
      userId,
      name: args.name,
      key: apiKey,
      isActive: true,
      usageCount: 0,
    })

    return { id: keyId, key: apiKey }
  },
})

export const listApiKeys = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const apiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    return apiKeys.map((key) => ({
      ...key,
      key: key.key.substring(0, 8) + "...",
    }))
  },
})

export const toggleApiKey = mutation({
  args: {
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const apiKey = await ctx.db.get(args.keyId)
    if (!apiKey || apiKey.userId !== userId) {
      throw new Error("API key not found")
    }

    await ctx.db.patch(args.keyId, {
      isActive: !apiKey.isActive,
    })
  },
})

export const deleteApiKey = mutation({
  args: {
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const apiKey = await ctx.db.get(args.keyId)
    if (!apiKey || apiKey.userId !== userId) {
      throw new Error("API key not found")
    }

    await ctx.db.delete(args.keyId)
  },
})

export const validateApiKey = internalMutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first()

    if (!apiKey || !apiKey.isActive) {
      return null
    }

    await ctx.db.patch(apiKey._id, {
      lastUsed: Date.now(),
      usageCount: apiKey.usageCount + 1,
    })

    return {
      userId: apiKey.userId,
      keyId: apiKey._id,
    }
  },
})

export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const usage = await ctx.db
      .query("apiUsage")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50)

    return usage
  },
})

export const getApiKeysForDocs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const apiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    return apiKeys.map((key) => ({
      _id: key._id,
      name: key.name,
      key: key.key,
    }))
  },
})
