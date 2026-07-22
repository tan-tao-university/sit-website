import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isAllowedAuthToken = (token: string): boolean => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return false;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(normalized)) as {
      exp?: number;
      type?: string;
    };

    return (
      !!decoded.exp &&
      decoded.exp * 1000 > Date.now() &&
      decoded.type === "access"
    );
  } catch {
    return false;
  }
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const hasValidToken = token ? isAllowedAuthToken(token) : false;
  const hasRefreshToken = !!request.cookies.get("refresh_token")?.value;
  const hasSession = hasValidToken || hasRefreshToken;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const isPublicRoute =
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon.ico");

  // If accessing a protected route without a token, redirect to login
  if (!hasSession && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.delete("token");
    }
    return response;
  }

  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
