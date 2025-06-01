"use node"
import { action } from "./_generated/server"
import crypto from "crypto"

export const generateApiKey = action({
  args: {},
  handler: async () => {
    const result = crypto.randomBytes(32).toString("hex")
    return result
  },
})
