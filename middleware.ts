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

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
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
