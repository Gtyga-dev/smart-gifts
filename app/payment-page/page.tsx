"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import {
  Loader2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
} from "lucide-react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function PaymentPageContent() {
  const [status, setStatus] = useState<"input" | "processing" | "success" | "failed">("input")
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "bank">("mobile_money")
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<"airtel" | "tnm">("airtel")
  const [bank, setBank] = useState<"national" | "fdh" | "standard" | "first_capital">("national")
  const [accountNumber, setAccountNumber] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const searchParams = useSearchParams()
  const depositId = searchParams.get("depositId")
  const { isLoading } = useKindeBrowserClient()

  const initiatePayment = async () => {
    if (!accountNumber || !depositId || !transactionId) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setStatus("processing")
      const response = await axios.post("/api/initiate-manual-payment", {
        depositId,
        paymentMethod,
        provider: paymentMethod === "mobile_money" ? mobileMoneyProvider : bank,
        accountNumber,
        transactionId,
      })

      if (response.data.success) {
        setStatus("success")
      } else {
        setStatus("failed")
      }
    } catch (error) {
      console.error("Payment initiation error:", error)
      setStatus("failed")
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 cyber-grid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full space-y-10"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <Zap className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold neon-text tracking-tight text-white">
            Complete Your <span className="gradient-text">Payment</span>
          </h1>
          <p className="text-lg text-white max-w-md mx-auto">
            Securely finalize your purchase with our easy payment process. Your transaction is protected.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-black to-[#121212] shadow-xl rounded-xl border border-primary/20 relative overflow-hidden">
                {/* Glow overlay: ignore pointer events so inputs remain clickable */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-30 pointer-events-none"></div>

                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10 animate-glow">
                      <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-white">Payment Details</CardTitle>
                  <CardDescription className="text-gray-300">
                    Please provide your payment information to complete your order
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod" className="block text-sm font-medium text-white">
                      Payment Method <span className="text-primary">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={paymentMethod === "mobile_money" ? "default" : "outline"}
                        className={`flex items-center justify-center gap-2 ${paymentMethod === "mobile_money"
                            ? "bg-primary text-white"
                            : "border-primary/20 hover:bg-primary/10 text-white"
                          }`}
                        onClick={() => setPaymentMethod("mobile_money")}
                      >
                        <Smartphone className="h-4 w-4" />
                        <span>Mobile Money</span>
                      </Button>
                      <Button
                        type="button"
                        variant={paymentMethod === "bank" ? "default" : "outline"}
                        className={`flex items-center justify-center gap-2 ${paymentMethod === "bank"
                            ? "bg-primary text-white"
                            : "border-primary/20 hover:bg-primary/10 text-white"
                          }`}
                        onClick={() => setPaymentMethod("bank")}
                      >
                        <Building className="h-4 w-4" />
                        <span>Bank Transfer</span>
                      </Button>
                    </div>
                  </div>

                  {paymentMethod === "mobile_money" && (
                    <div className="space-y-2">
                      <Label htmlFor="mobileMoneyProvider" className="block text-sm font-medium text-white">
                        Mobile Money Provider <span className="text-primary">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={mobileMoneyProvider === "airtel" ? "default" : "outline"}
                          className={`flex items-center justify-center ${mobileMoneyProvider === "airtel"
                              ? "bg-primary text-white"
                              : "border-primary/20 hover:bg-primary/10 text-white"
                            }`}
                          onClick={() => setMobileMoneyProvider("airtel")}
                        >
                          Airtel Money
                        </Button>
                        <Button
                          type="button"
                          variant={mobileMoneyProvider === "tnm" ? "default" : "outline"}
                          className={`flex items-center justify-center ${mobileMoneyProvider === "tnm"
                              ? "bg-primary text-white"
                              : "border-primary/20 hover:bg-primary/10 text-white"
                            }`}
                          onClick={() => setMobileMoneyProvider("tnm")}
                        >
                          TNM Mpamba
                        </Button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "bank" && (
                    <div className="space-y-2">
                      <Label htmlFor="bank" className="block text-sm font-medium text-white">
                        Bank <span className="text-primary">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={bank === "national" ? "default" : "outline"}
                          className={`flex items-center justify-center ${bank === "national"
                              ? "bg-primary text-white"
                              : "border-primary/20 hover:bg-primary/10 text-white"
                            }`}
                          onClick={() => setBank("national")}
                        >
                          National Bank
                        </Button>
                        <Button
                          type="button"
                          variant={bank === "fdh" ? "default" : "outline"}
                          className={`flex items-center justify-center ${bank === "fdh"
                              ? "bg-primary text-white"
                              : "border-primary/20 hover:bg-primary/10 text-white"
                            }`}
                          onClick={() => setBank("fdh")}
                        >
                          FDH Bank
                        </Button>
                        <Button
                          type="button"
                          variant={bank === "standard" ? "default" : "outline"}
                          className={`flex items-center justify-center ${bank === "standard"
                              ? "bg-primary text-white"
                              : "border-primary/20 hover:bg-primary/10 text-white"
                            }`}
                          onClick={() => setBank("standard")}
                        >
                          Standard Bank
                        </Button>
                        <Button
                          type="button"
                          variant={bank === "first_capital" ? "default" : "outline"}
                          className={`flex items-center justify-center ${bank === "first_capital"
                              ? "bg-primary text-white"
                              : "border-primary/20 hover:bg-primary/10 text-white"
                            }`}
                          onClick={() => setBank("first_capital")}
                        >
                          First Capital
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="block text-sm font-medium text-white">
                      {paymentMethod === "mobile_money" ? (
                        <>
                          Phone Number <span className="text-primary">*</span>
                        </>
                      ) : (
                        <>
                          Account Number <span className="text-primary">*</span>
                        </>
                      )}
                    </Label>
                    <Input
                      id="accountNumber"
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={paymentMethod === "mobile_money" ? "265888123456" : "Enter account number"}
                      className="mt-1 block w-full p-3 border border-primary/20 bg-black text-white focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transactionId" className="block text-sm font-medium text-white">
                      Transaction ID <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="transactionId"
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID"
                      className="mt-1 block w-full p-3 border border-primary/20 bg-black text-white focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-colors"
                    />
                  </div>

                  <Button
                    onClick={initiatePayment}
                    className="w-full py-4 px-4 text-white font-medium rounded-md bg-primary hover:bg-primary/90 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md border border-primary/50 animate-pulse-border group"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Submit Payment</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-black to-[#121212] shadow-xl rounded-xl border border-primary/20 relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-30 pointer-events-none"></div>
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-primary/10 animate-pulse">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-4 neon-text text-white">Processing Your Payment</h2>
                  <p className="text-white mb-6">Your payment is being processed. Please wait for admin approval.</p>
                  <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">
                      You will receive an email confirmation once your payment is approved.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-black to-[#121212] shadow-xl rounded-xl border border-green-500/30 relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-primary/20 rounded-xl blur opacity-30 pointer-events-none"></div>
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-green-500/10 animate-pulse">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold mb-4 text-green-500 neon-text">
                    Payment Submitted Successfully!
                  </h2>
                  <p className="text-white mb-6">
                    Your payment has been submitted for approval. You will receive an email confirmation once it&apos;s
                    processed.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/orders")}
                    className="w-full py-4 px-4 text-white font-medium rounded-md bg-primary hover:bg-primary/90 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md border border-primary/50 animate-pulse-border group"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowRight className="h-5 w-5" />
                      <span>View Order Details</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-black to-[#121212] shadow-xl rounded-xl border border-red-500/30 relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-primary/20 rounded-xl blur opacity-30 pointer-events-none"></div>
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-red-500/10 animate-pulse">
                      <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-4 text-red-500 neon-text">Payment Submission Failed</h2>
                  <p className="text-white mb-6">
                    We couldn&apos;t process your payment submission. Please try again or contact support if the problem
                    persists.
                  </p>
                  <Button
                    onClick={() => setStatus("input")}
                    className="w-full py-4 px-4 text-white font-medium rounded-md bg-primary hover:bg-primary/90 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md border border-primary/50 animate-pulse-border group"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowRight className="h-5 w-5" />
                      <span>Try Again</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment instructions */}
        {status === "input" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-black to-[#121212] shadow-lg rounded-xl border border-primary/20 relative overflow-hidden">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-30 pointer-events-none"></div>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Payment Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-white space-y-2">
                <p>1. Make your payment using your selected payment method to our account.</p>
                <p>2. Enter the transaction ID or reference number from your payment.</p>
                <p>3. Submit your payment details for verification.</p>
                <p>4. Once verified, your order will be processed and delivered.</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  )
}
