import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Get the pathname
    const { pathname } = request.nextUrl

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/settings", "/activity"]

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    // If it's a protected route and there's no session, redirect to login
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is logged in and trying to access login/signup pages, redirect to dashboard
    if (session && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Continue with the request
    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error, allow the request to continue
    return NextResponse.next()
  }
}

// Specify which paths the middleware should run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
