"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GiftCardPurchaseFormProps {
    productId: string
    productName: string
    minAmount?: number
    maxAmount?: number
    fixedAmounts?: number[]
}

export default function GiftCardPurchaseForm({
    productId,
    productName,
    minAmount = 5,
    maxAmount = 500,
    fixedAmounts,
}: GiftCardPurchaseFormProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            amount: fixedAmounts ? fixedAmounts[0] : minAmount,
            recipientEmail: "",
        },
    })
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: any) => {
        setIsLoading(true)
        setError(null)

        try {
            // Generate a deposit ID for the payment flow
            const depositId = crypto.randomUUID()

            // Store payment details in Redis for verification
            await fetch("/api/process-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    depositId,
                    productType: "giftcard",
                    productId,
                    quantity: 1,
                    recipientInfo: {
                        email: data.recipientEmail,
                    },
                }),
            }).then(async (res) => {
                const responseData = await res.json()

                if (!res.ok) {
                    throw new Error(responseData.message || "Failed to process payment")
                }

                // Redirect to PayChangu checkout
                window.location.href = responseData.payment_url
            })
        } catch (error) {
            console.error("Payment error:", error)
            setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.")

            toast({
                variant: "destructive",
                title: "Payment Error",
                description: error instanceof Error ? error.message : "Failed to process payment",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Purchase {productName}</CardTitle>
                <CardDescription>Enter details to purchase this gift card</CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {fixedAmounts && fixedAmounts.length > 0 ? (
                        <div className="space-y-2">
                            <Label htmlFor="amount">Select Amount (USD)</Label>
                            <Select
                                onValueChange={(value) => setValue("amount", Number.parseFloat(value))}
                                defaultValue={fixedAmounts[0].toString()}
                            >
                                <SelectTrigger id="amount">
                                    <SelectValue placeholder="Select amount" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fixedAmounts.map((amount) => (
                                        <SelectItem key={amount} value={amount.toString()}>
                                            ${amount.toFixed(2)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (USD)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                {...register("amount", {
                                    required: "Amount is required",
                                    min: {
                                        value: minAmount,
                                        message: `Minimum amount is $${minAmount.toLocaleString()}`,
                                    },
                                    max: {
                                        value: maxAmount,
                                        message: `Maximum amount is $${maxAmount.toLocaleString()}`,
                                    },
                                })}
                                defaultValue={minAmount}
                                disabled={isLoading}
                            />
                            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message as string}</p>}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="recipientEmail">Recipient Email</Label>
                        <Input
                            id="recipientEmail"
                            type="email"
                            {...register("recipientEmail", {
                                required: "Email is required for gift card delivery",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address",
                                },
                            })}
                            placeholder="Enter recipient email"
                            disabled={isLoading}
                        />
                        {errors.recipientEmail && <p className="text-sm text-red-500">{errors.recipientEmail.message as string}</p>}
                        <p className="text-xs text-muted-foreground">
                            The gift card redemption code will be sent to this email address
                        </p>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <span className="animate-spin mr-2">
                                    <CreditCard className="h-4 w-4" />
                                </span>
                                Processing...
                            </span>
                        ) : (
                            <span>Purchase Gift Card</span>
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
                <p>
                    Your payment will be processed securely through PayChangu. The gift card will be delivered to the provided
                    email address immediately after successful payment.
                </p>
            </CardFooter>
        </Card>
    )
}
