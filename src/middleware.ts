import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// Lightweight initialization for Edge Runtime
const { auth: nextAuthMiddleware } = NextAuth(authConfig);

const middleware = nextAuthMiddleware((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/login", "/register", "/asistan-fav.png", "/manifest.json"].includes(nextUrl.pathname);

  if (isApiAuthRoute) return NextResponse.next();

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

// Supporting both Next.js 15 (middleware) and Next.js 16 (proxy) conventions
export default middleware;
export { middleware, middleware as proxy };

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
