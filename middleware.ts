import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    // Get the pathname
    const { pathname } = request.nextUrl

    // Check if the pathname starts with /dashboard or /settings
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/settings")) {
      // Get the user's session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      // If there's an error or no session, redirect to login
      if (error || !session) {
        // Create a URL for the login page with a redirect back to the current page
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirect", pathname)

        // Redirect to the login page
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Continue with the request
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)

    // If there's an error, allow the request to continue
    // This prevents the middleware from blocking access in case of errors
    return NextResponse.next()
  }
}

// Specify which paths the middleware should run on
export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/api/:path*"],
}
