/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as api_ from "../api.js";
import type * as apiKeys from "../apiKeys.js";
import type * as auth from "../auth.js";
import type * as functions from "../functions.js";
import type * as generateApiKey from "../generateApiKey.js";
import type * as http from "../http.js";
import type * as video from "../video.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  api: typeof api_;
  apiKeys: typeof apiKeys;
  auth: typeof auth;
  functions: typeof functions;
  generateApiKey: typeof generateApiKey;
  http: typeof http;
  video: typeof video;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
