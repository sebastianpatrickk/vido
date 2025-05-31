import { intro, isCancel, outro, select, text } from "@clack/prompts"
import path from "path"
import fs from "fs"
import color from "picocolors"

export interface CliResults {
  rootFolderPath: string
  outputFolderPath: string
}

export async function runCli(): Promise<CliResults | undefined> {
  console.clear()

  // Parse command line arguments manually
  const args = process.argv.slice(2)
  const cliProvidedName = args[0]?.startsWith("--") ? undefined : args[0]

  intro(color.bgMagenta(" vido CLI "))

  const rootFolderPath =
    cliProvidedName ||
    (await text({
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
    }))

  if (isCancel(rootFolderPath)) {
    outro("Nastavení bylo zrušeno.")
    return undefined
  }

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

  let outputFolderPath = undefined

  if (outputFolderOption === "custom") {
    outputFolderPath = await text({
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

    if (isCancel(outputFolderPath)) {
      outro("Nastavení bylo zrušeno.")
      return undefined
    }
  }

  if (outputFolderOption === "default") {
    outputFolderPath = path.join(rootFolderPath, "generated")
    if (!fs.existsSync(outputFolderPath)) {
      fs.mkdirSync(outputFolderPath, { recursive: true })
    }
  }

  return {
    rootFolderPath: rootFolderPath as string,
    outputFolderPath: outputFolderPath as string,
  }
}
