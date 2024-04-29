import { v } from "convex/values"
import {mutation, query} from "./_generated/server"
export const getFiles = query({
    args:{
        orgId:v.string()
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity()
        if(!identity) return [];
        return ctx.db.query("files").withIndex("by_orgId",q=>q.eq("orgId",args.orgId)).collect()
    },
})