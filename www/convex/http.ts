import { httpRouter } from "convex/server"
import { auth } from "./auth"
import { uploadHandler, validateApiKeyHandler } from "./api"

const http = httpRouter()

auth.addHttpRoutes(http)
http.route({
  path: "/api/upload",
  method: "POST",
  handler: uploadHandler,
})

http.route({
  path: "/api/validate-api-key",
  method: "GET",
  handler: validateApiKeyHandler,
})

export default http
