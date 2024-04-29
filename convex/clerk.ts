"use node";
import type { WebhookEvent } from "@clerk/clerk-sdk-node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Webhook } from "svix";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

export const fulfill = internalAction({
  args: { headers: v.any(), payload: v.string() },
  handler: async (ctx, args) => {
    const wh = new Webhook(webhookSecret);
    const payload = wh.verify(args.payload, args.headers) as WebhookEvent;
    return payload;
  },
});
