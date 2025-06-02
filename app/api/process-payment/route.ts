import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";

interface PaymentDetails {
  userId: string;
  amount: number;
  cartKey: string;
}

// PawaPay API configuration based on environment
const PAWAPAY_CONFIG = {
  sandbox: {
    apiUrl: "https://api.sandbox.pawapay.io/deposits",
    callbackUrl: "http://localhost:3000/api/payment-callback",
  },
  production: {
    apiUrl: "https://api.pawapay.io/deposits",
    callbackUrl: "https://www.smartcards.store/api/payment-callback",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { depositId, phoneNumber, provider } = await req.json();
    const isProduction = process.env.NEXT_PUBLIC_PAWAPAY_ENV === "production";
    const config = isProduction
      ? PAWAPAY_CONFIG.production
      : PAWAPAY_CONFIG.sandbox;

    // Get the appropriate token based on environment
    const apiToken = isProduction
      ? process.env.PAWAPAY_LIVE_TOKEN
      : process.env.PAWAPAY_SANDBOX_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { success: false, message: "Payment service configuration error" },
        { status: 500 }
      );
    }


    // Validate required fields
    if (!depositId || !phoneNumber || !provider) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^265[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Get payment details from Redis with proper typing
    const paymentDetails = await redis.get<PaymentDetails>(
      `payment-${depositId}`
    );
    if (!paymentDetails) {
      return NextResponse.json(
        { success: false, message: "Invalid payment session" },
        { status: 400 }
      );
    }

    // Ensure amount is properly formatted with 2 decimal places
    const amount = Number(paymentDetails.amount).toFixed(2);

    const paymentRequest = {
      depositId,
      amount,
      currency: "MWK",
      correspondent: provider,
      payer: {
        type: "MSISDN",
        address: {
          value: phoneNumber,
        },
      },
      customerTimestamp: new Date().toISOString(),
      statementDescription: "Smart Cards Purchase",
      callbackUrl: config.callbackUrl,
    };

    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(paymentRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          message: "Payment service error",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (result.status === "ACCEPTED") {
      // Log successful acceptance
      console.log("Payment accepted successfully:", {
        depositId,
        status: result.status,
        environment: isProduction ? "production" : "sandbox",
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({
        success: true,
        message: "Payment initiated successfully",
        status: result.status,
        environment: isProduction ? "production" : "sandbox",
      });
    } else {
      console.error("Unexpected payment status:", result.status);
      return NextResponse.json(
        {
          success: false,
          message: "Payment initiation failed",
          details: result,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Process payment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
