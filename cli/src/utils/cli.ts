import { SUPPORTED_FORMATS } from "@/constants.js"
import fs from "fs"
import path from "path"

export function getSupportedVideos(folderPath: string): string[] {
  return fs
    .readdirSync(folderPath)
    .filter((file) =>
      SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase()),
    )
    .map((file) => path.join(folderPath, file))
}

export function extractNameAndTags(filename: string) {
  const ext = path.extname(filename)
  const base = path.basename(filename, ext)
  const [name, tagsPart] = base.split("__")
  const tags = tagsPart ? tagsPart.split(",") : []
  return { name, tags, fileType: ext.replace(".", "") }
}
