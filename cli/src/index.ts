// #!/usr/bin/env node

import { runCli } from "./cli/index.js"
import { logger } from "./utils/logger.js"

const main = async () => {
  const results = await runCli()

  if (!results) {
    return
  }

  const { rootFolderPath, outputFolderPath, videos } = results

  // TODO: Convert videos with FFMPEG
  // TODO: Create references in Convex
  // TODO: Sync output folder into r2 with cludflare r2 sync comand

  process.exit(0)
}

main().catch((err) => {
  logger.error("Aborting installation...")
  if (err instanceof Error) {
    logger.error(err)
  } else {
    logger.error(
      "An unknown error has occurred. Please open an issue on github with the below:",
    )
    console.log(err)
  }
  process.exit(1)
})
