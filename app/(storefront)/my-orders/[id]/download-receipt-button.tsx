"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { formatCurrency } from "@/app/lib/currency"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

// Define the types based on your Prisma schema
type OrderWithItems = {
  id: string
  status: string
  amount: number
  createdAt: Date
  transactionId?: string | null
  paymentMethod?: string | null
  currency?: string | null
  exchangeRate?: number | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any
  User?: {
    firstName: string | null
    lastName: string | null
    email: string | null
  } | null
  items: {
    id: string
    name: string
    quantity: number
    priceAtTime: number
    imageUrl: string
  }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReloadlyTransaction?: any[]
}

export default function DownloadReceiptButton({ order }: { order: OrderWithItems }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateReceipt = async () => {
    setIsGenerating(true)

    try {
      // Create a new PDF document
      const doc = new jsPDF()

      // Add company logo/header
      doc.setFontSize(20)
      doc.setTextColor(44, 62, 80)
      doc.text("RECEIPT", 105, 20, { align: "center" })

      // Add order information
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)

      // Order details
      doc.text(`Order #: ${order.id}`, 14, 40)
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 45)
      doc.text(`Status: ${order.status}`, 14, 50)

      // Customer information
      doc.text("Customer Information:", 14, 60)
      doc.text(`Name: ${order.User?.firstName} ${order.User?.lastName}`, 14, 65)
      doc.text(`Email: ${order.User?.email}`, 14, 70)

      // Payment information
      doc.text("Payment Information:", 14, 80)
      doc.text(`Method: ${order.paymentMethod || "Not specified"}`, 14, 85)
      if (order.transactionId) {
        doc.text(`Transaction ID: ${order.transactionId}`, 14, 90)
      }
      if (order.currency) {
        doc.text(`Currency: ${order.currency}`, 14, 95)
        if (order.exchangeRate) {
          doc.text(`Exchange Rate: ${order.exchangeRate}`, 14, 100)
        }
      }

      // Order items table
      const tableColumn = ["Item", "Quantity", "Price", "Total"]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tableRows: any[] = []

      // Calculate subtotal
      let subtotal = 0

      // Add items to table
      order.items.forEach((item) => {
        const itemTotal = item.priceAtTime * item.quantity
        subtotal += itemTotal

        const formattedPrice = order.currency
          ? formatCurrency(item.priceAtTime / 100, order.currency)
          : `$${(item.priceAtTime / 100).toFixed(2)}`

        const formattedTotal = order.currency
          ? formatCurrency(itemTotal / 100, order.currency)
          : `$${(itemTotal / 100).toFixed(2)}`

        tableRows.push([item.name, item.quantity.toString(), formattedPrice, formattedTotal])
      })

      // Add the table to the PDF
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 110,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      })

      // Get the final Y position after the table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (doc as any).lastAutoTable.finalY + 10

      // Add total
      doc.text("Subtotal:", 140, finalY)
      doc.text(
        order.currency ? formatCurrency(subtotal / 100, order.currency) : `$${(subtotal / 100).toFixed(2)}`,
        170,
        finalY,
        { align: "right" },
      )

      doc.text("Total:", 140, finalY + 5)
      doc.setFont("helvetica", "bold")
      doc.text(
        order.currency ? formatCurrency(order.amount / 100, order.currency) : `$${(order.amount / 100).toFixed(2)}`,
        170,
        finalY + 5,
        { align: "right" },
      )

      // Add gift card redemption code if available
      const redemptionCode =
        order.metadata?.redemptionCode ||
        (order.ReloadlyTransaction?.length && order.ReloadlyTransaction.length > 0
          ? order.ReloadlyTransaction[0]?.metadata?.redemptionCode
          : null)

      if (redemptionCode) {
        doc.setFont("helvetica", "normal")
        doc.text("Gift Card Redemption Code:", 14, finalY + 15)
        doc.setFont("courier", "bold")
        doc.text(redemptionCode, 14, finalY + 20)
        doc.setFont("helvetica", "normal")
        doc.text("Please keep this code secure. It can only be redeemed once.", 14, finalY + 25)
      }

      // Add footer
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.text("Thank you for your purchase!", 105, finalY + 35, { align: "center" })

      // Save the PDF
      doc.save(`receipt-${order.id.slice(0, 8)}.pdf`)
    } catch (error) {
      console.error("Error generating receipt:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1 border-primary/20 hover:bg-primary/10"
      onClick={generateReceipt}
      disabled={isGenerating}
    >
      <Download className="h-4 w-4 mr-1" />
      {isGenerating ? "Generating..." : "Download Receipt"}
    </Button>
  )
}
