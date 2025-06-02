"use client"

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface PaymentSuccessProps {
  orderId: string;
  userEmail: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ orderId, userEmail }) => {
  const { toast } = useToast();

  // Send email on component mount
  useEffect(() => {
    const sendEmail = async () => {
      try {
        const response = await axios.post("/api/send-giftcard-email", {
          orderId,
          userEmail,
        });

        if (response.data.success) {
          toast({
            title: "Success",
            description: "Order confirmation email sent.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: response.data.message || "Failed to send confirmation email.",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while sending the email.",
        });
        console.error("Email error:", error);
      }
    };

    if (userEmail) {
      sendEmail();
    }
  }, [orderId, userEmail, toast]);

  return (
    <section className="w-full min-h-[80vh] flex items-center justify-center">
      <Card className="w-[350px] shadow-lg hover:shadow-2xl">
        <div className="p-6">
          <div className="w-full flex justify-center">
            <Check className="w-12 h-12 rounded-full bg-green-500/30 text-green-500 p-2" />
          </div>

          <div className="mt-3 text-center sm:mt-5 w-full">
            <h3 className="text-lg leading-6 font-medium">
              Payment Successful
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Congrats on your purchase. Your payment was successfully processed. We hope
              you enjoy the product.
            </p>
            <Button asChild className="w-full mt-5 sm:mt-6">
              <Link href="/my-orders">View Your Order</Link>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default PaymentSuccess;

