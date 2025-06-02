import { Resend } from "resend";
import { NextResponse } from "next/server";
import { FaqQuestionEmail } from "@/emails/FaqQuestionEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    const data = await resend.emails.send({
      from: "SmartCards <support@smartcards.store>",
      to: ["support@smartcards.store"],
      subject: "New FAQ Question Submitted",
      react: FaqQuestionEmail({ question }),
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
