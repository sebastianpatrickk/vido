// #!/usr/bin/env node

import { runCli } from "./cli/index.js"
import { logger } from "./utils/logger.js"

const main = async () => {
  const results = await runCli()

  //   TODO: process the data from CLI
  console.log(results)

  results?.videos[0]?.tags.forEach((tag) => {
    console.log(tag)
  })

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
