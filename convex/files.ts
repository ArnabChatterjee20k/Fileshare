import { ConvexError, v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  mutation,
  query,
  internalAction,
  internalMutation,
  action,
} from "./_generated/server";
import { getUser } from "./users";
import { api, internal } from "./_generated/api";

async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string
) {
  const user = await getUser(ctx, tokenIdentifier);
  // incase of personal account, the orgid will be in the token identifier that is the subject or the token or the user id
  const hasAccess =
    user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);
  return hasAccess;
}
export const getFiles = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const hasAccess = await hasAccessToOrg(
      ctx,
      identity?.tokenIdentifier!,
      args.orgId
    );
    if (!hasAccess) return [];
    return ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

// we can make this more robust and predictable. Written in the readme
export const createFile = mutation({
  args: { name: v.string(), orgId: v.string(), file: v.bytes() },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    console.log({ identity });
    if (!identity)
      throw new ConvexError("Yuo must be logged in to upload a file");

    const user = await getUser(ctx, identity.tokenIdentifier);
    const hasAccess = await hasAccessToOrg(
      ctx,
      user.tokenIdentifier,
      args.orgId
    );
    if (!hasAccess) throw new ConvexError("Yout dont have access to this org");

    const fileRecordId = await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
    });

    await ctx.scheduler.runAfter(0, internal.files.uploadFile, {
      fileName: args.name,
      file: args.file,
      fileRecordId: fileRecordId,
    });
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files"), orgId: v.string() },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("You dont have access to this org");

    const file = await ctx.db.get(args.fileId);

    if (!file) throw new ConvexError("The file does not exists");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );

    if (!hasAccess)
      throw new ConvexError("You dont have permission to delete this file");

    await ctx.db.delete(args.fileId);
  },
});

export const uploadFile = internalAction({
  args: { fileName: v.string(), file: v.bytes(), fileRecordId: v.id("files") },
  async handler(ctx, args) {
    const uploadURL = await ctx.storage.generateUploadUrl();
    const result = await fetch(uploadURL, {
      method: "POST",
      body: args.file,
    });
    const { storageId } = await result.json();
    await ctx.runMutation(internal.files.readData, {
      fileId: storageId,
      fileRecordId: args.fileRecordId,
    });
  },
});

export const readData = internalMutation({
  args: { fileRecordId: v.id("files"), fileId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileRecordId, {
      storageId: args.fileId,
    });
  },
});
