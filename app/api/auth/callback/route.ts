import { type NextRequest, NextResponse } from "next/server";
import { processReferral } from "@/app/actions/referral";

export async function GET(request: NextRequest) {
  try {
    // Get the referral code from the cookie if it exists
    const referralCode = request.cookies.get("referral_code")?.value;
    const userId = request.cookies.get("user_id")?.value;

    // Log for debugging
    console.log(
      "Auth callback - Referral code:",
      referralCode,
      "User ID:",
      userId
    );

    // If we have both a referral code and user ID, process the referral
    if (referralCode && userId) {
      try {
        const result = await processReferral(referralCode, userId);
        console.log(
          "Referral processing result:",
          result ? "Success" : "Failed"
        );

        // Clear the referral code cookie
        const response = NextResponse.redirect(
          new URL("/dashboard", request.url)
        );
        response.cookies.delete("referral_code");

        // Set a success message cookie if the referral was processed
        if (result) {
          response.cookies.set("referral_processed", "true", {
            maxAge: 60 * 60, // 1 hour
            path: "/",
            httpOnly: false, // Allow JavaScript access for toast notifications
          });
        }

        return response;
      } catch (processingError) {
        console.error("Error processing referral:", processingError);
        // Continue with redirect even if processing fails
      }
    }

    // Otherwise, just redirect to the home page
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error in auth callback:", error);
    // In case of error, still redirect to home but log the error
    return NextResponse.redirect(new URL("/", request.url));
  }
}
