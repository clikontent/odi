import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check auth condition based on route
  const url = req.nextUrl.pathname

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/settings",
    "/files",
    "/activity",
    "/analytics",
    "/notifications",
    "/corporate",
  ]

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) => url.startsWith(route))

  // Auth routes that should redirect to dashboard if already logged in
  const authRoutes = ["/login", "/signup"]
  const isAuthRoute = authRoutes.some((route) => url === route)

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // If accessing auth routes with a session, redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Clone the response
  const response = NextResponse.next()

  // Add caching headers for static assets
  if (
    req.nextUrl.pathname.startsWith("/_next/static") ||
    req.nextUrl.pathname.startsWith("/images") ||
    req.nextUrl.pathname.includes(".svg") ||
    req.nextUrl.pathname.includes(".png") ||
    req.nextUrl.pathname.includes(".jpg")
  ) {
    // Cache static assets for 1 week
    response.headers.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400")
  }

  return response
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/dashboard/:path*",
    "/settings/:path*",
    "/files/:path*",
    "/activity/:path*",
    "/analytics/:path*",
    "/notifications/:path*",
    "/corporate/:path*",
    "/login",
    "/signup",
  ],
}
