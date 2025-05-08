import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  try {
    // Create a response object
    const res = NextResponse.next()

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req: request, res })

    // Get the pathname
    const { pathname } = request.nextUrl

    // Check authentication for protected routes
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/files") ||
      pathname.startsWith("/activity") ||
      pathname.startsWith("/notifications") ||
      pathname.startsWith("/analytics")
    ) {
      // Get the user's session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // If there's no session, redirect to login
      if (!session) {
        // Create a URL for the login page with a redirect back to the current page
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirect", pathname)

        // Redirect to the login page
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Check for corporate-only routes
    if (pathname.startsWith("/corporate")) {
      // Get the user's session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // If there's no session, redirect to login
      if (!session) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Get the user's profile to check if they're a corporate user
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status")
        .eq("id", session.user.id)
        .single()

      // If not a corporate user, redirect to dashboard
      if (!profile || profile.subscription_tier !== "corporate" || profile.subscription_status !== "active") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Check for admin-only routes
    if (pathname.startsWith("/admin")) {
      // Get the user's session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // If there's no session, redirect to login
      if (!session) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Get the user's profile to check if they're an admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", session.user.id)
        .single()

      // If not an admin, redirect to dashboard
      if (!profile || profile.subscription_tier !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
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
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/corporate/:path*",
    "/files/:path*",
    "/activity/:path*",
    "/notifications/:path*",
    "/analytics/:path*",
    "/api/:path*",
  ],
}
