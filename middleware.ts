import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  try {
    // Check if there's a referral code in the URL
    const { searchParams } = new URL(request.url)
    const refCode = searchParams.get("ref")

    // Validate referral code format (basic validation)
    const isValidCode = refCode && /^[A-Z0-9]{6,12}$/i.test(refCode)

    // If there is a valid code, and we don't already have a referral code cookie, set one
    if (isValidCode && !request.cookies.has("referral_code")) {
      // Set cookie with appropriate security settings
      response.cookies.set("referral_code", refCode, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        httpOnly: true, // Not accessible via JavaScript
        sameSite: "lax", // Provides some CSRF protection
        secure: process.env.NODE_ENV === "production", // Secure in production
      })

      // Also set a cookie to track the referral source for analytics
      const referralSource = searchParams.get("source") || "direct"
      response.cookies.set("referral_source", referralSource, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
    }
  } catch (error) {
    console.error("Error in middleware:", error)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}