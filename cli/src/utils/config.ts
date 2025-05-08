import { config } from "dotenv";

// Load environment variables from .env file
config();

export const CLOUDFLARE_API_KEY = process.env["CLOUDFLARE_API_KEY"] || "";

export type AppConfig = {
  apiKey: string;
};

export function loadConfig(): AppConfig {
  return {
    apiKey: CLOUDFLARE_API_KEY,
  };
}
