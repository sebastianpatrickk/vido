import { config } from "dotenv";

// Load environment variables from .env file
config();

const bucketCredentials = {
  accessKeyId: process.env["R2_ACCESS_KEY_ID"] || "",
  secretAccessKey: process.env["R2_SECRET_ACCESS_KEY"] || "",
};

export type AppConfig = {
  bucketCredentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
};

export function loadConfig(): AppConfig {
  return {
    bucketCredentials,
  };
}
