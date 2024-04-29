import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { getUser } from "./users";
async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string
) {
  const user = await getUser(ctx, tokenIdentifier);
  const hasAccess = user.orgIds.includes(orgId);
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

export const createFile = mutation({
  args: { name: v.string(), orgId: v.string() },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      throw new ConvexError("Yuo must be logged in to upload a file");

    const user = await getUser(ctx, identity.tokenIdentifier);
    const hasAccess = await hasAccessToOrg(
      ctx,
      user.tokenIdentifier,
      args.orgId
    );
    if (!hasAccess) throw new ConvexError("Yout dont have access to this org");
    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
    });
  },
});
