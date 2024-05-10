import { NextRequest } from "next/server";
import playwright from "playwright";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const url = body.url;
  const buffer = await takeScreenShot(url);
  const image = await resize(buffer);
  return new Response(image, { headers: { "Content-Type": "image/png" } });
}

export async function GET() {
  return new Response("get");
}
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
  return await newData.toBuffer();
}
