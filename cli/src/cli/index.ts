import {
  intro,
  isCancel,
  outro,
  select,
  text,
  multiselect,
  spinner,
} from "@clack/prompts"
import path from "path"
import fs from "fs"
import color from "picocolors"
import { extractNameAndTags, getSupportedVideos } from "@/utils/cli.js"
import { CONVEX_HTTP_URL } from "@/constants.js"
import axios from "axios"
import { CliResults, VideoInfo } from "@/types.js"

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

  const shouldUpload = await select<boolean>({
    message: "Chcete vygenerovaná videa automaticky nahrát na server?",
    options: [
      {
        value: true,
        label: "Ano, nahrát videa na server",
      },
      { value: false, label: "Ne, pouze vygenerovat videa" },
    ],
  })

  if (isCancel(shouldUpload)) {
    outro("Nastavení bylo zrušeno.")
    return undefined
  }

  let actualAuthToken: string | undefined = undefined
  let r2AccountId: string | undefined = undefined
  let r2BucketName: string | undefined = undefined
  let r2Region: string | undefined = undefined
  let r2AccessKeyId: string | undefined = undefined
  let r2SecretAccessKey: string | undefined = undefined
  if (shouldUpload) {
    let isValid = false
    while (!isValid) {
      const authToken: string | symbol = await text({
        message: "Zadejte váš API klíč:",
        placeholder: "např. ak_csCQeSFwEsneb9ZenhbP49jwtcZnMbQq",
        validate: (value) => {
          if (!value) {
            return "Prosím zadejte API klíč."
          }
          return
        },
      })
      if (isCancel(authToken)) {
        outro("Nastavení bylo zrušeno.")
        return undefined
      }
      const s = await spinner()
      s.start("Ověřuji API klíč...")
      try {
        const response = await axios.get(
          CONVEX_HTTP_URL + "/api/validate-api-key",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        )
        if (response.status === 200) {
          isValid = true
          actualAuthToken = authToken as string
          s.stop(color.green("API klíč je platný."))
        } else {
          s.stop(color.red("Neplatný API klíč. Zkuste to znovu."))
        }
      } catch (error) {
        s.stop(color.red("Chyba při ověřování API klíče. Zkuste to znovu."))
      }
    }
    r2AccountId = String(
      await text({
        message: "Zadejte Cloudflare R2 Account ID:",
        validate: (v) => (v ? undefined : "Account ID je povinný"),
      }),
    )
    if (isCancel(r2AccountId)) return undefined
    r2BucketName = String(
      await text({
        message: "Zadejte Cloudflare R2 Bucket Name:",
        validate: (v) => (v ? undefined : "Bucket Name je povinný"),
      }),
    )
    if (isCancel(r2BucketName)) return undefined
    r2Region = String(
      await text({
        message: "Zadejte Cloudflare R2 Region (např. auto):",
        validate: (v) => (v ? undefined : "Region je povinný"),
      }),
    )
    if (isCancel(r2Region)) return undefined
    r2AccessKeyId = String(
      await text({
        message: "Zadejte Cloudflare R2 Access Key ID:",
        validate: (v) => (v ? undefined : "Access Key ID je povinný"),
      }),
    )
    if (isCancel(r2AccessKeyId)) return undefined
    r2SecretAccessKey = String(
      await text({
        message: "Zadejte Cloudflare R2 Secret Access Key:",
        validate: (v) => (v ? undefined : "Secret Access Key je povinný"),
      }),
    )
    if (isCancel(r2SecretAccessKey)) return undefined
  }
  return {
    rootFolderPath: rootFolderPath as string,
    outputFolderPath: outputFolderPath as string,
    videos,
    shouldUpload,
    authToken: actualAuthToken,
    r2AccountId,
    r2BucketName,
    r2Region,
    r2AccessKeyId,
    r2SecretAccessKey,
  }
}
