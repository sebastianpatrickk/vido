#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import App from "./app.js";
import chalk from "chalk";
import { loadConfig } from "./utils/config";

const config = loadConfig();

if (!config.apiKey) {
  console.error(
    `\n${chalk.red(`Missing Cloudflare API key.`)}\n\n` +
      `Set the environment variable ${chalk.bold(`CLOUDFLARE_API_KEY`)} ` +
      `and re-run this command.\n` +
      `You can create a key here: ${chalk.bold(
        chalk.underline("https://dash.cloudflare.com/profile/api-tokens"),
      )}\n`,
  );
  process.exit(1);
}

render(<App />);
