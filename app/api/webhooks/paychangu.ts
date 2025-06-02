import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

interface WebhookPayload {
  first_name: string;
  last_name: string;
  email: string;
  currency: string;
  amount: string;
  status: string;
  reference: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as WebhookPayload;

    if (payload.status !== "successful") {
      return NextResponse.json({
        success: false,
        message: "Payment not successful",
      });
    }

    const user = await prisma.user.findFirst({
      where: { email: payload.email },
    });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    // Add logic to handle successful payments here
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error processing webhook",
    });
  }
}
