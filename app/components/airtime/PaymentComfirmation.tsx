"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Spinner from "@/app/components/Spinner"

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import PaymentSuccess from "./PaymentSuccess"
import PaymentFailed from "./PaymentFailed"

interface PaymentConfirmationProps {
  tx_ref: string
}

const PaymentConfirmation = ({ tx_ref }: PaymentConfirmationProps) => {
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [orderId, setOrderId] = useState<string>("")
  const { user, isLoading } = useKindeBrowserClient()

  useEffect(() => {
    const handlePaymentCallBack = async () => {
      try {
        // Wait until user data is loaded
        if (isLoading) {
          return
        }

        // Make sure we have both tx_ref and user email
        if (!tx_ref || !user?.email) {
          console.error("Missing tx_ref or user email", { tx_ref, userEmail: user?.email })
          setStatus("failed")
          return
        }

        console.log("Verifying payment with:", { tx_ref, userEmail: user.email })

        // First verify the payment with Paychangu
        const { data: verificationData } = await axios.get(`/api/verify-payment`, {
          params: {
            tx_ref,
            email: user.email,
          },
        })

        if (verificationData.success) {
          // If payment is verified, process the airtime topup
          const { data: processData } = await axios.post("/api/process-airtime", {
            txRef: tx_ref,
            operatorId: verificationData.transaction.operatorId,
            amount: verificationData.transaction.amount,
            recipientPhone: verificationData.transaction.recipientPhone,
            useLocalAmount: verificationData.transaction.useLocalAmount,
          })

          if (processData.success) {
            setOrderId(processData.transactionId)
            setStatus("success")
          } else {
            console.error("Airtime processing failed:", processData.message)
            setStatus("failed")
          }
        } else {
          console.error("Payment verification failed:", verificationData.message)
          setStatus("failed")
        }
      } catch (error) {
        console.error("Error in payment confirmation flow:", error)
        setStatus("failed")
      }
    }

    handlePaymentCallBack()
  }, [tx_ref, user, isLoading])

  if (isLoading || status === "loading") {
    return (
      <>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40"></div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Spinner size={40} color="white" />
        </div>
      </>
    )
  } else if (status === "success") {
    return (
      <div className="mt-4">
        <PaymentSuccess orderId={orderId} userEmail={user?.email || ""} />
      </div>
    )
  } else {
    return (
      <div className="mt-4">
        <PaymentFailed />
      </div>
    )
  }
}

export default PaymentConfirmation
