import { internal } from "./_generated/api"
import { httpAction } from "./_generated/server"
import { videosInfoSchema } from "@/lib/schemas/video"

export const uploadHandler = httpAction(async (ctx, req) => {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid Authorization header" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  const apiKey = authHeader.substring(7)

  const validation = await ctx.runMutation(internal.apiKeys.validateApiKey, {
    key: apiKey,
  })

  if (!validation) {
    return new Response(JSON.stringify({ error: "Invalid API key" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
  const { videos: rawVideos } = await req.json()

  const videos = videosInfoSchema.parse(rawVideos)

  const createdVideos = await ctx.runMutation(internal.video.createVideos, {
    videos,
  })

  return new Response(
    JSON.stringify({ message: "ok", videos: createdVideos.createdVideos }),
    {
      status: 201,
    },
  )
})

export const validateApiKeyHandler = httpAction(async (ctx, req) => {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const apiKey = authHeader.substring(7)

    const validation = await ctx.runMutation(internal.apiKeys.validateApiKey, {
      key: apiKey,
    })

    if (!validation) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(
      JSON.stringify({
        message: "ok",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
