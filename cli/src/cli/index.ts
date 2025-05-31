import {
  intro,
  isCancel,
  outro,
  select,
  text,
  multiselect,
} from "@clack/prompts"
import path from "path"
import fs from "fs"
import color from "picocolors"
import { extractNameAndTags, getSupportedVideos } from "@/utils/cli.js"

export interface VideoInfo {
  name: string
  tags: string[]
  fileType: string
  path: string
}

export interface CliResults {
  rootFolderPath: string
  outputFolderPath: string
  videos: VideoInfo[]
}

export async function runCli(): Promise<CliResults | undefined> {
  console.clear()

  intro(color.bgMagenta(" vido CLI "))

  const rootFolderPath = await text({
    message: "Zadejte cestu ke složce, kde máte uložená svá videa.",
    placeholder: "např. C:/moje-videa",
    validate: (value) => {
      if (!value) {
        return "Prosím zadejte cestu ke složce se zdrojovými videi."
      }

      const folderPath = path.resolve(value)
      if (!fs.existsSync(folderPath)) {
        return "Zadaná složka neexistuje. Zkontrolujte prosím správnost cesty."
      }
      if (!fs.statSync(folderPath).isDirectory()) {
        return "Zadaná cesta nevede ke složce. Zadejte prosím platnou složku."
      }
      const files = fs.readdirSync(folderPath)
      if (files.length === 0) {
        return "Složka je prázdná. Vyberte prosím složku, která obsahuje videa."
      }
      return
    },
  })

  if (isCancel(rootFolderPath)) {
    outro("Nastavení bylo zrušeno.")
    return undefined
  }

  const allVideoPaths = getSupportedVideos(rootFolderPath as string)

  if (allVideoPaths.length === 0) {
    outro("Ve složce nebyla nalezena žádná podporovaná videa.")
    return undefined
  }

  const selectAllOrSome = await select<"all" | "pick">({
    message: "Chcete použít všechna videa, nebo si vybrat jen některá?",
    options: [
      { value: "all", label: "Použít všechna videa" },
      { value: "pick", label: "Vybrat konkrétní videa" },
    ],
  })

  if (isCancel(selectAllOrSome)) {
    outro("Nastavení bylo zrušeno.")
    return undefined
  }

  let selectedVideoPaths = allVideoPaths

  if (selectAllOrSome === "pick") {
    const videoOptions = allVideoPaths.map((filePath) => {
      const file = path.basename(filePath)
      return {
        value: filePath,
        label: file,
      }
    })

    const result = await multiselect({
      message: "Vyberte videa, která chcete použít:",
      options: videoOptions,
      required: true,
    })

    if (isCancel(result) || !Array.isArray(result) || result.length === 0) {
      outro("Nastavení bylo zrušeno nebo nebylo vybráno žádné video.")
      return undefined
    }

    selectedVideoPaths = result
  }

  const videos: VideoInfo[] = selectedVideoPaths.map((filePath) => {
    const { name, tags, fileType } = extractNameAndTags(path.basename(filePath))
    return {
      name: name || path.basename(filePath, path.extname(filePath)),
      tags,
      fileType,
      path: filePath,
    }
  })

  const outputFolderOption = await select<"default" | "custom">({
    message: "Kam si přejete ukládat vygenerovaná videa?",
    options: [
      {
        value: "default",
        label: `Vytvořit složku „generated“ ve složce: ${rootFolderPath}`,
      },
      { value: "custom", label: "Vybrat vlastní složku" },
    ],
  })

  if (isCancel(outputFolderOption)) {
    outro("Nastavení bylo zrušeno.")
    return undefined
  }

  let outputFolderPath: string | undefined = undefined

  if (outputFolderOption === "custom") {
    const result = await text({
      message:
        "Zadejte cestu ke složce, do které chcete ukládat vygenerovaná videa:",
      placeholder: "např. C:/moje-videa/vystup",
      validate: (value) => {
        if (!value) {
          return "Zadejte prosím cestu ke složce!"
        }
        const folderPath = path.resolve(value)
        if (!fs.existsSync(folderPath)) {
          return "Zadaná složka neexistuje. Zkontrolujte prosím cestu."
        }
        if (!fs.statSync(folderPath).isDirectory()) {
          return "Zadaná cesta není složka. Zadejte prosím platnou složku."
        }
        return
      },
    })

    if (isCancel(result)) {
      outro("Nastavení bylo zrušeno.")
      return undefined
    }

    outputFolderPath = result
  }

  if (outputFolderOption === "default") {
    outputFolderPath = path.join(rootFolderPath as string, "generated")
  }

  return {
    rootFolderPath: rootFolderPath as string,
    outputFolderPath: outputFolderPath as string,
    videos,
  }
}
