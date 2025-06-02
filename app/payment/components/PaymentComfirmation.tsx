"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/app/components/Spinner";
import PaymentSuccess from "./PaymentSuccess";
import PaymentFailed from "./PaymentFailed";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

interface PaymentConfirmationProps {
  tx_ref: string;
}

const PaymentConfirmation = ({ tx_ref }: PaymentConfirmationProps) => {
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [orderId, setOrderId] = useState<string>("");
  const { user, isLoading } = useKindeBrowserClient();

  useEffect(() => {
    const handlePaymentCallBack = async () => {
      try {
        // Wait until user data is loaded
        if (isLoading) {
          return;
        }

        // Make sure we have both tx_ref and user email
        if (!tx_ref || !user?.email) {
          console.error("Missing tx_ref or user email", { tx_ref, userEmail: user?.email });
          setStatus("failed");
          return;
        }

        console.log("Verifying payment with:", { tx_ref, userEmail: user.email });

        const { data } = await axios.get(`/api/verify-payment`, {
          params: {
            tx_ref,
            email: user.email
          }
        });

        if (data.success) {
          setOrderId(data.orderId);
          setStatus("success");
        } else {
          console.error("Payment verification failed:", data.message);
          setStatus("failed");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("failed");
      }
    };

    handlePaymentCallBack();
  }, [tx_ref, user, isLoading]);

  if (isLoading || status === "loading") {
    return (
      <>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40"></div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Spinner size={40} color="white" />
        </div>
      </>
    );
  } else if (status === "success") {
    return (
      <div className="mt-4">
        <PaymentSuccess orderId={orderId} userEmail={user?.email || ''} />
      </div>
    );
  } else {
    return (
      <div className="mt-4">
        <PaymentFailed />
      </div>
    );
  }
};

export default PaymentConfirmation;