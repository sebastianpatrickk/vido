import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import path from "path"
import fs from "fs/promises"
import { logger } from "./logger.js"
import color from "picocolors"

export const uploadToR2 = async (
  accountId: string,
  bucketName: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  filePath: string,
  key?: string,
) => {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  const fileName = key || path.basename(filePath)
  const fileContent = await fs.readFile(filePath)

  logger.info(color.blue(`  Uploading ${fileName}...`))

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
  })

  await client.send(command)

  return `https://${bucketName}.${region}.r2.cloudflarestorage.com/${fileName}`
}

export const uploadDirectoryToR2 = async (
  accountId: string,
  bucketName: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  dirPath: string,
  r2Prefix = "",
) => {
  logger.info(color.blue(`Processing directory: ${dirPath}`))
  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    const r2Key = r2Prefix ? path.posix.join(r2Prefix, entry.name) : entry.name

    if (entry.isDirectory()) {
      await uploadDirectoryToR2(
        accountId,
        bucketName,
        region,
        accessKeyId,
        secretAccessKey,
        fullPath,
        r2Key,
      )
    } else {
      await uploadToR2(
        accountId,
        bucketName,
        region,
        accessKeyId,
        secretAccessKey,
        fullPath,
        r2Key,
      )
    }
  }
}
