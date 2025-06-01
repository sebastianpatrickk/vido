// #!/usr/bin/env node

import { runCli } from "./cli/index.js"
import { logger } from "./utils/logger.js"
import { processVideoWithFFmpeg } from "./utils/video.js"
import color from "picocolors"

const main = async () => {
  const results = await runCli()

  if (!results) {
    return
  }

  const { outputFolderPath, videos, shouldUpload } = results

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

  // TODO: Create references in Convex
  // TODO: Sync output folder into r2 with cludflare r2 sync comand

  process.exit(0)
}

main().catch((err) => {
  logger.error(color.red("Aborting installation..."))
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
