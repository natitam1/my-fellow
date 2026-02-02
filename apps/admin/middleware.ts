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

  // Always redirect to signin for protected routes and clear any existing token
  if (!isPublicRoute) {
    const response = NextResponse.redirect(new URL("/signin", request.url));
    // Clear the admin token cookie to ensure fresh sign-in every time
    response.cookies.delete("admin_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
