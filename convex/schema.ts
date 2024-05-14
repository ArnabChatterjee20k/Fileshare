import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  files: defineTable({
    name: v.string(),
    orgId: v.optional(v.string()),
    storageId: v.optional(v.string()),
    storageURL:v.optional(v.string()),
    fileType: v.optional(v.string()),
    thumbnailURL:v.optional(v.string()),
    thumbnailId:v.optional(v.string()),
    delete:v.optional(v.boolean())
  }).index("by_orgId", ["orgId"]),
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.string()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
});