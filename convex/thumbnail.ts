"use node";

import { ConvexError, v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  mutation,
} from "./_generated/server";
import sharp from "sharp";
import { uploadToStorage } from "./files";
import { internal } from "./_generated/api";

export const createThumbnail = internalAction({
  args: { storageId: v.id("_storage"), fileRecordId: v.id("files") },
  async handler(ctx, args) {
    const file = await ctx.storage.get(args.storageId);
    const contentType = file?.type || "";
    const fileURL = await ctx.storage.getUrl(args.storageId);
    if (!fileURL)
      throw new ConvexError(
        `URL does not exist for storage-id ${args.storageId}`
      );
    const thumbnail = await getThumbnail(fileURL, contentType);
    const uploadURL = await ctx.storage.generateUploadUrl();
    const thumbnailStorageId = await uploadToStorage(
      uploadURL,
      "image/png",
      thumbnail
    );
    const thumbnailURL = await ctx.storage.getUrl(thumbnailStorageId);
    if (!thumbnailURL) {
      console.log(`Thumbnail ${thumbnailStorageId} no longer exists`);
      return;
    }
    await ctx.runMutation(internal.files.updateThumbnailURLInDB, {
      thumbnailURL: thumbnailURL,
      fileRecordId: args.fileRecordId,
    });
  },
});

async function getThumbnail(url: string, contentType: string) {
  if (contentType?.includes("pdf")) {
    return await getPDFThumbnail(url);
  } else if (contentType?.includes("image")) {
    return await getImageThumbnail(url);
  } else {
    throw new ConvexError(`Unsupported content type: ${contentType}`);
  }
}

const getPDFThumbnail = async (pdfURL: string) => {
  const body = JSON.stringify({ url: pdfURL });
  const result = await fetch(process.env.PDF_THUMBNAIL_SERVICE as string, {
    method: "POST",
    body: body,
    headers: { "Content-Type": "application/json" },
  });
  const buffer = await result.arrayBuffer();
  return Buffer.from(buffer);
};

const getImageThumbnail = async (imageURL: string) => {
  const result = await fetch(imageURL);
  const buffer = await result.arrayBuffer();
  const cropOptions = {
    left: 0,
    top: 0,
    width: 600,
    height: 100,
  };

  const croppedBuffer = await sharp(buffer).extract(cropOptions).toBuffer();

  return croppedBuffer;
};
