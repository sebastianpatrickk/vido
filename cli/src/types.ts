export interface VideoInfo {
  name: string
  tags: string[]
  fileType: string
  path: string
  id?: string
}

export interface VideoReference {
  id: string
  name: string
}

export interface CliResults {
  rootFolderPath: string
  outputFolderPath: string
  videos: VideoInfo[]
  shouldUpload: boolean
  authToken: string | undefined
  r2AccountId?: string
  r2BucketName?: string
  r2Region?: string
  r2AccessKeyId?: string
  r2SecretAccessKey?: string
}
