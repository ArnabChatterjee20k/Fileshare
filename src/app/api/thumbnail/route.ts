import { NextRequest } from "next/server";
import sharp from "sharp";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const url = body.url;
  const buffer = await takeScreenshot(url);
  const image = await resize(buffer);
  return new Response(image, {
    headers: {
      "Content-Type": "image/png",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET() {
  return new Response("get");
}
async function takeScreenshot(url: string) {
  // Launch Puppeteer
  const browser = await getBrowser();

  // Create a new page
  const page = await browser.newPage();

  // Navigate to the URL
  await page.goto(url);

  // Wait for the page to load (adjust timing if needed)

  // Take a screenshot and get the buffer
  const screenshotBuffer = (await page.screenshot({ path: "test.png" })).buffer;

  // Close Puppeteer
  await browser.close();

  return screenshotBuffer;
}

async function getBrowser() {
  return puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(
      `https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar`
    ),
    // headless: chromium.headless,
    headless:false,
    ignoreHTTPSErrors: true,
  });
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
