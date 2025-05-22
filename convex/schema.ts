import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  tasks: defineTable({
    name: v.string(),
    completed: v.boolean(),
  }),
});

export default schema;
