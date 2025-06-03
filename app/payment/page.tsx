"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import axios from "axios"
import { UploadDropzone } from "@/app/lib/uploadthing"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

function PaymentPageContent() {
  const [status, setStatus] = useState<"input" | "processing" | "success" | "failed">("input")
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "bank">("mobile_money")
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<"airtel" | "tnm">("airtel")
  const [bank, setBank] = useState<"national" | "fdh" | "standard" | "first_capital">("national")
  const [accountNumber, setAccountNumber] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [screenshot, setScreenshot] = useState<string | undefined>(undefined)
  const searchParams = useSearchParams()
  const depositId = searchParams.get("depositId")
  const { isLoading } = useKindeBrowserClient()
  const { toast } = useToast()

  const agentCodes = {
    airtel: "1234567- Currently not working",
    tnm: "7654321- Currently not working",
  }

  const bankAccounts = {
    national: "xxxxxxxxx - Currently not working",
    fdh: "1170000140895 - Geoffrey",
    standard: "xxxxxxxxx - Currently not working",
    first_capital: "xxxxxxxxx - Currently not working",
  }

  const initiatePayment = async () => {
    if (!accountNumber || !depositId || (!transactionId && !screenshot)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and provide either a transaction ID or a screenshot",
        variant: "destructive",
      })
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
        screenshot,
      })

      if (response.data.success) {
        setStatus("success")
      } else {
        setStatus("failed")
        toast({
          title: "Payment Failed",
          description: response.data.message || "Something went wrong with your payment submission",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Payment initiation error:", error)
      setStatus("failed")
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading payment gateway...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl opacity-20 animate-float-delay"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full mx-auto relative z-10"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-6"
          >
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
            Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Payment</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            Complete your transaction with our secure payment gateway
          </p>
        </motion.div>

        {/* Status cards */}
        <AnimatePresence mode="wait">
          {status === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Instructions card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center gap-2 text-white">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Payment Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-300 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs text-primary">1</span>
                        </div>
                      </div>
                      <p>Make your payment using your selected payment method to our account.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs text-primary">2</span>
                        </div>
                      </div>
                      <p>Enter the transaction ID or reference number from your payment.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs text-primary">3</span>
                        </div>
                      </div>
                      <p>Optionally upload a screenshot of your payment confirmation.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs text-primary">4</span>
                        </div>
                      </div>
                      <p>Submit your payment details for verification.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs text-primary">5</span>
                        </div>
                      </div>
                      <p>Once verified, your order will be processed and delivered.</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment form */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white">Payment Details</CardTitle>
                    <CardDescription className="text-gray-400">
                      Provide your payment information to complete the transaction
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment method selection */}
                    <div className="space-y-3">
                      <Label className="block text-sm font-medium text-white">
                        Payment Method <span className="text-primary">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="button"
                            variant={paymentMethod === "mobile_money" ? "default" : "secondary"}
                            className={`w-full h-12 flex items-center justify-center gap-2 ${
                              paymentMethod === "mobile_money" ? "" : "bg-gray-800 hover:bg-gray-700"
                            }`}
                            onClick={() => setPaymentMethod("mobile_money")}
                          >
                            <Smartphone className="h-5 w-5" />
                            <span>Mobile Money</span>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="button"
                            variant={paymentMethod === "bank" ? "default" : "secondary"}
                            className={`w-full h-12 flex items-center justify-center gap-2 ${
                              paymentMethod === "bank" ? "" : "bg-gray-800 hover:bg-gray-700"
                            }`}
                            onClick={() => setPaymentMethod("bank")}
                          >
                            <Building className="h-5 w-5" />
                            <span>Bank Transfer</span>
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Mobile Money options */}
                    {paymentMethod === "mobile_money" && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          <Label className="block text-sm font-medium text-white">
                            Mobile Money Provider <span className="text-primary">*</span>
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="button"
                                variant={mobileMoneyProvider === "airtel" ? "default" : "secondary"}
                                className={`w-full ${mobileMoneyProvider === "airtel" ? "" : "bg-gray-800 hover:bg-gray-700"}`}
                                onClick={() => setMobileMoneyProvider("airtel")}
                              >
                                Airtel Money
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="button"
                                variant={mobileMoneyProvider === "tnm" ? "default" : "secondary"}
                                className={`w-full ${mobileMoneyProvider === "tnm" ? "" : "bg-gray-800 hover:bg-gray-700"}`}
                                onClick={() => setMobileMoneyProvider("tnm")}
                              >
                                TNM Mpamba
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="space-y-2"
                        >
                          <Label className="block text-sm font-medium text-white">
                            Agent Code
                          </Label>
                          <div className="relative">
                            <Input
                              type="text"
                              value={agentCodes[mobileMoneyProvider]}
                              readOnly
                              className="bg-gray-800/50 border-gray-700 text-gray-300 pl-10"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-gray-400">#</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">Send payment to this agent code</p>
                        </motion.div>
                      </>
                    )}

                    {/* Bank options */}
                    {paymentMethod === "bank" && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          <Label className="block text-sm font-medium text-white">
                            Bank <span className="text-primary">*</span>
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="button"
                                variant={bank === "national" ? "default" : "secondary"}
                                className={`w-full ${bank === "national" ? "" : "bg-gray-800 hover:bg-gray-700"}`}
                                onClick={() => setBank("national")}
                              >
                                National Bank
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="button"
                                variant={bank === "fdh" ? "default" : "secondary"}
                                className={`w-full ${bank === "fdh" ? "" : "bg-gray-800 hover:bg-gray-700"}`}
                                onClick={() => setBank("fdh")}
                              >
                                FDH Bank
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="button"
                                variant={bank === "standard" ? "default" : "secondary"}
                                className={`w-full ${bank === "standard" ? "" : "bg-gray-800 hover:bg-gray-700"}`}
                                onClick={() => setBank("standard")}
                              >
                                Standard Bank
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="button"
                                variant={bank === "first_capital" ? "default" : "secondary"}
                                className={`w-full ${bank === "first_capital" ? "" : "bg-gray-800 hover:bg-gray-700"}`}
                                onClick={() => setBank("first_capital")}
                              >
                                First Capital
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="space-y-2"
                        >
                          <Label className="block text-sm font-medium text-white">
                            Account Number
                          </Label>
                          <div className="relative">
                            <Input
                              type="text"
                              value={bankAccounts[bank]}
                              readOnly
                              className="bg-gray-800/50 border-gray-700 text-gray-300 pl-10"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-gray-400">#</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">Send payment to this account number</p>
                        </motion.div>
                      </>
                    )}

                    {/* Account number input */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-2"
                    >
                      <Label className="block text-sm font-medium text-white">
                        {paymentMethod === "mobile_money" ? (
                          <>
                            Your Phone Number <span className="text-primary">*</span>
                          </>
                        ) : (
                          <>
                            Your Account Number <span className="text-primary">*</span>
                          </>
                        )}
                      </Label>
                      <Input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder={paymentMethod === "mobile_money" ? "265888123456" : "Enter your account number"}
                        className="bg-gray-800/50 border-gray-700 text-white focus:ring-1 focus:ring-primary/50"
                      />
                    </motion.div>

                    {/* Transaction ID */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="space-y-2"
                    >
                      <Label className="block text-sm font-medium text-white">
                        Transaction ID <span className="text-gray-400 text-xs">(Optional if providing screenshot)</span>
                      </Label>
                      <Input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter transaction ID"
                        className="bg-gray-800/50 border-gray-700 text-white focus:ring-1 focus:ring-primary/50"
                      />
                    </motion.div>

                    {/* Screenshot upload */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="space-y-3"
                    >
                      <Label className="block text-sm font-medium text-white">
                        Payment Screenshot <span className="text-gray-400 text-xs">(Optional if providing transaction ID)</span>
                      </Label>
                      {screenshot ? (
                        <div className="space-y-3">
                          <div className="relative rounded-lg overflow-hidden border border-gray-700">
                            <Image
                              src={screenshot}
                              alt="Payment Screenshot"
                              width={600}
                              height={400}
                              className="w-full h-auto object-contain"
                              onError={(e) => {
                                console.error("Image loading error")
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                            <button
                              onClick={() => setScreenshot(undefined)}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-900/80 hover:bg-gray-800 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <UploadDropzone
                          endpoint="paymentScreenshotRoute"
                          onClientUploadComplete={(res) => {
                            if (res && res[0] && res[0].url) {
                              setScreenshot(res[0].url)
                              toast({
                                title: "Upload Complete",
                                description: "Your payment screenshot has been uploaded successfully",
                              })
                            }
                          }}
                          onUploadError={(error) => {
                            console.error("Upload error:", error)
                            toast({
                              title: "Upload Failed",
                              description: "There was a problem uploading your screenshot. Please try again or use a different image.",
                              variant: "destructive",
                            })
                          }}
                          appearance={{
                            container: {
                              borderColor: 'rgba(55, 65, 81, 0.5)',
                              backgroundColor: 'rgba(17, 24, 39, 0.3)',
                              backdropFilter: 'blur(8px)',
                            },
                            uploadIcon: {
                              color: 'rgba(99, 102, 241, 0.7)',
                            },
                            label: {
                              color: '#E5E7EB',
                            },
                            allowedContent: {
                              color: '#9CA3AF',
                            },
                            button: {
                              backgroundColor: 'rgba(99, 102, 241, 0.8)',
                              color: '#FFFFFF',
                            }
                          }}
                        />
                      )}
                    </motion.div>

                    {/* Submit button */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="pt-2"
                    >
                      <Button
                        onClick={initiatePayment}
                        className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                      >
                        <motion.span
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <CreditCard className="h-5 w-5" />
                          <span>Submit Payment</span>
                        </motion.span>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {status === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <motion.div
                    animate={{
                      rotate: 360,
                      transition: { duration: 2, repeat: Infinity, ease: "linear" }
                    }}
                    className="flex justify-center mb-6"
                  >
                    <div className="p-4 rounded-full bg-primary/10">
                      <Loader2 className="h-12 w-12 text-primary" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-semibold mb-4 text-white">Processing Your Payment</h2>
                  <p className="text-gray-300 mb-6">Your payment is being processed. Please wait for admin approval.</p>
                  <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gray-900/50 border border-green-800/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="p-4 rounded-full bg-green-900/20 animate-pulse">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-semibold mb-4 text-green-500">
                    Payment Submitted Successfully!
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Your payment has been submitted for approval. You will receive an email confirmation once it&apos;s processed.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => (window.location.href = "/my-orders")}
                      className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ArrowRight className="h-5 w-5" />
                        <span>View Order Details</span>
                      </div>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gray-900/50 border border-red-800/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="p-4 rounded-full bg-red-900/20 animate-pulse">
                      <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-semibold mb-4 text-red-500">Payment Submission Failed</h2>
                  <p className="text-gray-300 mb-6">
                    We couldn&apos;t process your payment submission. Please try again or contact support if the problem persists.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => setStatus("input")}
                      className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ArrowRight className="h-5 w-5" />
                        <span>Try Again</span>
                      </div>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
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