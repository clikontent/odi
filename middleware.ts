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

    // Only check authentication for protected routes
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/corporate")
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
  matcher: ["/dashboard/:path*", "/settings/:path*", "/admin/:path*", "/corporate/:path*", "/api/:path*"],
}
