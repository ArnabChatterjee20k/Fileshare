"use node";

import { ConvexError, v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import sharp from "sharp";
import { uploadToStorage } from "./files";

export const createThumbnail = internalAction({
  args: { storageId: v.id("_storage") },
  async handler(ctx, args) {
    const file = await ctx.storage.get(args.storageId);
    const contentType = file?.type;
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url)
      throw new ConvexError(
        `URL does not exist for storage-id ${args.storageId}`
      );
    const uploadURL = await ctx.storage.generateUploadUrl();
    if (contentType?.includes("pdf")) {
      const thumbnail = await getPDFThumbnail(url);
      const storageId = await uploadToStorage(
        uploadURL,
        "image/png",
        // @ts-ignore
        thumbnail
      );
      console.log({ storageId });
    } else if (contentType?.includes("image")) {
      const thumbnail = await getImageThumbnail(url);
      const storageId = await uploadToStorage(
        uploadURL,
        "image/png",
        thumbnail
      );
      console.log({ storageId });
    }
  },
});

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
