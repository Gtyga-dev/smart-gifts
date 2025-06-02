"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ResendGiftCardButtonProps {
    orderId: string
    isAdmin?: boolean
}

export default function ResendGiftCardButton({ orderId, isAdmin = false }: ResendGiftCardButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleResend = async () => {
        setIsLoading(true)
        try {
            const endpoint = isAdmin ? `/api/admin/resend-giftcard/${orderId}` : `/api/send-giftcard-email`

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId }),
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Gift card email has been resent.",
                    variant: "default",
                })
            } else {
                throw new Error(data.message || "Failed to resend gift card email")
            }
        } catch (error) {
            console.error("Error resending gift card:", error)
            toast({
                title: "Error",
                description: "Failed to resend gift card email. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleResend} disabled={isLoading} className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            {isLoading ? "Sending..." : "Resend Gift Card Email"}
        </Button>
    )
}
