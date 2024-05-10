import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
const isProtectedRoute = createRouteMatcher([]);
export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});
// removed the ./api pattern
export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/"],
};
