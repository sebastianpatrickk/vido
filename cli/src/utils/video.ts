import { execa } from "execa"
import fs from "fs"
import path from "path"
import { logger } from "./logger.js"
import color from "picocolors"
import ora from "ora"

interface VideoProcessingOptions {
  inputFile: string
  outputDir: string
}

interface ResolutionConfig {
  resolution: string
  bitrate: string
  outputName: string
  profile: string
  level: string
}

const RESOLUTIONS: ResolutionConfig[] = [
  {
    resolution: "1280x720",
    bitrate: "1200k",
    outputName: "720p",
    profile: "main",
    level: "3.1",
  },
  {
    resolution: "1920x1080",
    bitrate: "2500k",
    outputName: "1080p",
    profile: "high",
    level: "4.2",
  },
  {
    resolution: "3840x2160",
    bitrate: "8000k",
    outputName: "2160p",
    profile: "high",
    level: "5.1",
  },
]

async function getFrameRate(inputFile: string): Promise<number> {
  const { stdout } = await execa("ffprobe", [
    "-v",
    "0",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=avg_frame_rate",
    inputFile,
  ])

  const [num, denom] = stdout.split("/").map(Number)
  if (typeof num !== "number" || isNaN(num)) {
    throw new Error("Could not determine video frame rate")
  }
  return Math.floor(num / (denom || 1))
}

async function processVideo(
  inputFile: string,
  outputDir: string,
  config: ResolutionConfig,
  gopSize: number,
): Promise<void> {
  const playlist = `${config.outputName}.m3u8`
  const segmentPattern = `${config.outputName}_%03d.ts`

  await execa("ffmpeg", [
    "-y",
    "-i",
    inputFile,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-profile:v",
    config.profile,
    "-level:v",
    config.level,
    "-b:v",
    config.bitrate,
    "-s",
    config.resolution,
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ac",
    "2",
    "-g",
    gopSize.toString(),
    "-keyint_min",
    gopSize.toString(),
    "-sc_threshold",
    "0",
    "-force_key_frames",
    "expr:gte(t,n_forced*4)",
    "-hls_time",
    "4",
    "-hls_list_size",
    "0",
    "-hls_flags",
    "independent_segments",
    "-hls_segment_filename",
    path.join(outputDir, segmentPattern),
    path.join(outputDir, playlist),
  ])
}

async function generateMasterPlaylist(
  outputDir: string,
  configs: ResolutionConfig[],
): Promise<void> {
  const masterPlaylistPath = path.join(outputDir, "playlist.m3u8")
  let content = "#EXTM3U\n#EXT-X-VERSION:3\n"

  for (const config of configs) {
    const bandwidth = parseInt(config.bitrate) * 1000 + 128000
    content += `\n#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${config.resolution}\n${config.outputName}.m3u8\n`
  }

  await fs.promises.writeFile(masterPlaylistPath, content)
}

export async function processVideoWithFFmpeg({
  inputFile,
  outputDir,
}: VideoProcessingOptions): Promise<void> {
  const checkSpinner = ora("Checking for FFmpeg and FFprobe").start()
  try {
    await execa("ffmpeg", ["-version"])
    await execa("ffprobe", ["-version"])
    checkSpinner.succeed(color.green("FFmpeg and FFprobe found."))
  } catch (error) {
    checkSpinner.fail(
      color.red("FFmpeg or FFprobe not installed or not in PATH."),
    )
    throw new Error("FFmpeg or FFprobe is not installed or not in PATH.")
  }

  const basename = path.basename(inputFile, path.extname(inputFile))
  const finalOutputDir = path.join(outputDir, basename)

  if (fs.existsSync(finalOutputDir)) {
    const removeSpinner = ora(
      color.yellow(`Removing existing output directory: ${finalOutputDir}`),
    ).start()
    await fs.promises.rm(finalOutputDir, { recursive: true })
    removeSpinner.succeed(color.green(`Removed existing output directory.`))
  }

  await fs.promises.mkdir(finalOutputDir, { recursive: true })

  const frameRate = await getFrameRate(inputFile)
  logger.info(color.blue(`\nDetected frame rate: ${frameRate} fps`))

  const gopSize = frameRate * 4

  logger.info(color.cyan("\nStarting resolution processing..."))
  for (const config of RESOLUTIONS) {
    const processSpinner = ora(`Processing ${config.outputName}`).start()
    try {
      await processVideo(inputFile, finalOutputDir, config, gopSize)
      processSpinner.succeed(color.green(`Processed ${config.outputName}.`))
    } catch (error) {
      processSpinner.fail(color.red(`Failed to process ${config.outputName}.`))
      throw error
    }
  }

  const playlistSpinner = ora("Generating master playlist").start()
  try {
    await generateMasterPlaylist(finalOutputDir, RESOLUTIONS)
    playlistSpinner.succeed(color.green("Master playlist generated."))
  } catch (error) {
    playlistSpinner.fail(color.red("Failed to generate master playlist."))
    throw error
  }

  logger.info(color.green(`\n✓ Video processing complete for ${basename}.`))
  logger.info(color.green(`Output directory: ${finalOutputDir}`))
}
