import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import Link from "next/link"

const PaymentFailed: React.FC = () => {
  return (
    <section className="w-full min-h-[80vh] flex items-center justify-center">
      <Card className="w-[350px] shadow-lg hover:shadow-2xl">
        <div className="p-6">
          <div className="w-full flex justify-center">
            <XCircle className="w-12 h-12 rounded-full bg-red-500/30 text-red-500 p-2" />
          </div>

          <div className="mt-3 text-center sm:mt-5 w-full">
            <h3 className="text-lg leading-6 font-medium">Payment Failed</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment did not go through. You have not been billed. Kindly try again.
            </p>
            <Button asChild className="w-full mt-5 sm:mt-6">
              <Link href="/airtime">Try Again</Link>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  )
}

export default PaymentFailed
