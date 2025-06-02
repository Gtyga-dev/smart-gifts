import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileX } from "lucide-react"

export default function NotFound() {
  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border border-primary/20 shadow-lg">
      <CardHeader className="px-7">
        <div className="flex flex-col items-center text-center">
          <FileX className="h-16 w-16 text-primary/60 mb-4" />
          <CardTitle className="neon-text text-2xl">Order Not Found</CardTitle>
          <CardDescription className="mt-2">
            The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center px-7 pb-7">
        <Button asChild>
          <Link href="/my-orders" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
