import { NextResponse, NextRequest } from "next/server";
import {
  REFRESH_TOKEN_NAME,
  TOKEN_NAME,
  USER_DETAILS,
} from "./constants/app.constant";
import { IUser } from "./interfaces/user.interface";

// Define routes that don't require authentication
const publicRoutes = ["/"];

// Define routes that require authentication
const authRoutes = ["/auth/*"];

// Define admin/dashboard routes that require authentication
const protectedRoutes = ["/dashboard", "/dashboard/*"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for unauthorized page to prevent redirect loops
  if (pathname.startsWith("/dashboard/unauthorized")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(TOKEN_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_NAME)?.value;

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // User is authenticated (has tokens)
  if (accessToken && refreshToken) {
    // If user is authenticated and tries to access auth routes, redirect to dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Allow access to protected routes
    if (isProtectedRoute) {
      return NextResponse.next();
    }

    // For other authenticated routes, allow access
    return NextResponse.next();
  }

  // User is not authenticated
  if (!accessToken || !refreshToken) {
    // If trying to access protected routes, redirect to login
    if (isProtectedRoute) {
      const loginUrl = new URL("/auth/login", request.url);
      // Add redirect URL for after login
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow access to public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // For any other route, redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
