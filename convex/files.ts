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
    fileType: v.union(v.literal("nondeleted"), v.literal("deleted")),
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
      .filter((q) =>
        q.eq(q.field("delete"), args.fileType === "deleted" ? true : false)
      )
      .order("desc")
      .collect();
  },
});

// we can make this more robust and predictable. Written in the readme
export const createFile = mutation({
  args: {
    name: v.string(),
    orgId: v.string(),
    file: v.bytes(),
    fileType: v.string(),
  },
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
      fileType: args.fileType,
    });

    await ctx.scheduler.runAfter(0, internal.files.uploadFile, {
      fileName: args.name,
      file: args.file,
      fileRecordId: fileRecordId,
      fileMime: args.fileType,
    });
  },
});

export const trash = mutation({
  args: {
    fileId: v.id("files"),
    orgId: v.string(),
    operation: v.union(v.literal("restoreFromTrash"), v.literal("putToTrash")),
  },
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

    const deleteMode = args.operation==="putToTrash"?true:false
    await ctx.db.patch(file._id, { delete: deleteMode });
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
    const deleteActions = [ctx.db.delete(args.fileId)];
    if (file.storageId) deleteActions.push(ctx.storage.delete(file.storageId));
    if (file.thumbnailId)
      deleteActions.push(ctx.storage.delete(file.thumbnailId));
    await Promise.all(deleteActions);
  },
});

export const uploadFile = internalAction({
  args: {
    fileName: v.string(),
    file: v.bytes(),
    fileRecordId: v.id("files"),
    fileMime: v.string(),
  },
  async handler(ctx, args) {
    const uploadURL = await ctx.storage.generateUploadUrl();

    const storageId = await uploadToStorage(
      uploadURL,
      args.fileMime,
      args.file
    );

    await ctx.runMutation(internal.files.updateFileURLInDB, {
      fileStorageId: storageId,
      fileRecordId: args.fileRecordId,
    });

    await ctx.scheduler.runAfter(0, internal.thumbnail.createThumbnail, {
      storageId: storageId,
      fileRecordId: args.fileRecordId,
    });
  },
});

export const updateFileURLInDB = internalMutation({
  args: { fileRecordId: v.id("files"), fileStorageId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileRecordId, {
      storageId: args.fileStorageId,
      storageURL: (await ctx.storage.getUrl(args.fileStorageId)) || "",
    });
  },
});

export const updateThumbnailURLInDB = internalMutation({
  args: { fileRecordId: v.id("files"), thumbnailId: v.string() },
  handler: async (ctx, args) => {
    const thumbnailURL = await ctx.storage.getUrl(args.thumbnailId);
    if (!thumbnailURL) {
      throw new ConvexError(
        `Thumbnail of id ${args.thumbnailId} does not exists`
      );
    }
    await ctx.db.patch(args.fileRecordId, {
      thumbnailURL: thumbnailURL,
      thumbnailId: args.thumbnailId,
    });
  },
});

export const uploadToStorage = async (
  uploadURL: string,
  fileMIME: string,
  file: ArrayBuffer
) => {
  const result = await fetch(uploadURL, {
    method: "POST",
    body: file,
    headers: { "Content-Type": fileMIME },
  });
  const data = await result.json();
  const { storageId } = data;
  if (!storageId) throw new ConvexError("Error while uploading the file");
  return storageId;
};
