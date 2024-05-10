"use node";

import { ConvexError, v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import playwright from "playwright";
import sharp from "sharp";

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
    const screenShotBuffer = await takeScreenShot(url);
    const uploadURL = await ctx.storage.generateUploadUrl();
    // const storageId = await uploadToStorage(
    //   uploadURL,
    //   "image/png",
    //   screenShotBuffer
    // );
    // console.log({ storageId });
  },
});

async function takeScreenShot(url: string) {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the URL and wait for the PDF to load
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);
  //   await page.waitForResponse(url, { waitUntil: "networkidle" });
  // Adjust viewport size if needed

  const buffer = await page.screenshot({ path: "test.png" });

  // Close Playwright
  await browser.close();

  return buffer;
}
async function resize(buffer: ArrayBuffer) {
  const newData = sharp(buffer).extract({
    top: 70,
    left: 330,
    width: 400,
    height: 150,
  });
  newData.toFile("output.png");
}
