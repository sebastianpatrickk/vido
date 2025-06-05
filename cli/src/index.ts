// #!/usr/bin/env node

import { runCli } from "./cli/index.js"
import { logger } from "./utils/logger.js"
import { createVideoReferences, processVideoWithFFmpeg } from "./utils/video.js"
import color from "picocolors"
import { uploadDirectoryToR2 } from "./utils/upload.js"
import path from "path"
import {
  CLOUDFLARE_R2_ACCESS_KEY_ID,
  CLOUDFLARE_R2_ACCOUNT_ID,
  CLOUDFLARE_R2_BUCKET_NAME,
  CLOUDFLARE_R2_REGION,
  CLOUDFLARE_R2_SECRET_ACCESS_KEY,
} from "./constants.js"
import { VideoReference } from "./types.js"

const main = async () => {
  const results = await runCli()

  if (!results) {
    return
  }

  const { outputFolderPath, videos, authToken, shouldUpload } = results

  logger.info(color.cyan("\nStarting video processing..."))

  for (const video of videos) {
    try {
      logger.info(color.yellow(`\nProcessing video: ${video.name}`))
      await processVideoWithFFmpeg({
        inputFile: video.path,
        outputDir: outputFolderPath,
      })
      logger.info(color.green(`✓ Successfully processed ${video.name}`))
    } catch (error) {
      logger.error(color.red(`✗ Failed to process video ${video.name}:`))
      if (error instanceof Error) {
        logger.error(color.red(error.message))
      } else {
        logger.error(color.red("Unknown error occurred"))
      }
    }
  }

  logger.info(color.cyan("\nVideo processing complete."))

  if (shouldUpload && authToken) {
    logger.info(color.cyan("\nCreating video references..."))
    let videoRefs: VideoReference[]
    try {
      videoRefs = (await createVideoReferences(
        videos,
        authToken,
      )) as VideoReference[]

      logger.info(color.green("✓ Video references created successfully"))
    } catch (error) {
      logger.error(color.red("✗ Failed to create video references:"))
      if (error instanceof Error) {
        logger.error(color.red(error.message))
      } else {
        logger.error(color.red("Unknown error occurred"))
      }
      process.exit(1)
    }

    const videoRefsMap = videos.map((video) => {
      const ref = videoRefs.find((r) => r.name === video.name)
      return { ...video, id: ref?.id }
    })

    logger.info(color.cyan("\nStarting video uploads to R2..."))
    for (const video of videoRefsMap) {
      try {
        const basename = path.basename(video.path, path.extname(video.path))
        const videoOutputDir = path.join(outputFolderPath, basename)
        logger.info(color.yellow(`\nUploading ${video.name} to R2...`))
        await uploadDirectoryToR2(
          CLOUDFLARE_R2_ACCOUNT_ID,
          CLOUDFLARE_R2_BUCKET_NAME,
          CLOUDFLARE_R2_REGION,
          CLOUDFLARE_R2_ACCESS_KEY_ID,
          CLOUDFLARE_R2_SECRET_ACCESS_KEY,
          videoOutputDir,
          video.id,
        )
        logger.info(color.green(`✓ Uploaded ${video.name} to R2`))
      } catch (error) {
        logger.error(color.red(`✗ Failed to upload ${video.name} to R2:`))
        if (error instanceof Error) {
          logger.error(color.red(error.message))
        } else {
          logger.error(color.red("Unknown upload error occurred"))
        }
      }
    }
  }

  process.exit(0)
}

main().catch((err) => {
  logger.error(color.red("Aborting generation..."))
  if (err instanceof Error) {
    logger.error(color.red(err.message))
  } else {
    logger.error(
      color.red(
        "An unknown error has occurred. Please open an issue on github with the below:",
      ),
    )
    console.log(err)
  }
  process.exit(1)
})
