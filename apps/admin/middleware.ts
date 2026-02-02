import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/signin", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isStaticAsset =
    pathname.startsWith("/images") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico");

  if (isStaticAsset) {
    return NextResponse.next();
  }

  // Redirect to signin if accessing a protected route without a token
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Redirect to home if accessing signin while already authenticated
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
