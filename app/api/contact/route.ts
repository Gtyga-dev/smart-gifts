import { NextResponse } from "next/server";
import { Resend } from "resend";
import ContactNotificationEmail from "@/emails/ContactNotification";
import ContactConfirmationEmail from "@/emails/ContactConfirmation";

// Add error checking for API key
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}

const resend = new Resend(resendApiKey);
const COMPANY_EMAIL = "contact@smartcards.store";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // Send email to company
    await resend.emails.send({
      from: "smartcards <contact@smartcards.store>",
      to: [COMPANY_EMAIL],
      replyTo: email,
      subject: `New Contact Inquiry from ${name}`,
      react: ContactNotificationEmail({ name, email, message }),
    });

    // Send confirmation email to the user
    await resend.emails.send({
      from: "smartcards Store <contact@smartcards.store>",
      to: [email],
      subject: "Thank you for contacting smartcards",
      react: ContactConfirmationEmail({ name, message }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
