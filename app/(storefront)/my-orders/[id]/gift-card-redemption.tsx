"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Gift, Printer, QrCode } from 'lucide-react'
import { QRCodeSVG } from "qrcode.react" 

type GiftCardRedemptionProps = {
  code: string
  instructions?: string
  productName: string
}

export default function GiftCardRedemption({ code, instructions, productName }: GiftCardRedemptionProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const printGiftCard = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <html>
        <head>
          <title>Gift Card: ${productName}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
            .container { border: 1px solid #ddd; border-radius: 8px; padding: 2rem; }
            .header { text-align: center; margin-bottom: 2rem; }
            .code { font-family: monospace; font-size: 1.5rem; letter-spacing: 0.1em; 
                    background: #f5f5f5; padding: 1rem; border-radius: 4px; text-align: center; }
            .instructions { white-space: pre-line; margin-top: 2rem; padding: 1rem; background: #f9f9f9; border-radius: 4px; }
            .footer { margin-top: 2rem; text-align: center; font-size: 0.875rem; color: #666; }
            @media print {
              body { padding: 0; }
              .container { border: none; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${productName}</h1>
              <p>Gift Card Redemption Details</p>
            </div>
            
            <div class="code-section">
              <h2>Redemption Code:</h2>
              <div class="code">${code}</div>
            </div>
            
            ${
              instructions
                ? `
              <div class="instructions">
                <h2>Redemption Instructions:</h2>
                <p>${instructions}</p>
              </div>
            `
                : ""
            }
            
            <div class="footer">
              <p>Please keep this code secure. It can only be redeemed once.</p>
              <p>Printed on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="print-button" style="text-align: center; margin-top: 2rem;">
              <button onclick="window.print()">Print Gift Card</button>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()

    // Auto print
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  return (
    <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-primary flex items-center">
          <Gift className="mr-2 h-5 w-5" />
          {productName} - Redemption Code
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)} className="h-8 px-2 border-primary/20">
            <QrCode className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">{showQR ? "Hide QR" : "Show QR"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={printGiftCard} className="h-8 px-2 border-primary/20">
            <Printer className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Print</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Redemption Code:</h4>
          <div className="bg-background p-3 rounded-md border border-primary/20 font-mono text-lg tracking-wider flex justify-between items-center">
            <span className="select-all">{code}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="ml-2 h-8 px-2"
              aria-label={copied ? "Copied" : "Copy to clipboard"}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {showQR && (
          <div className="flex justify-center py-4">
            <div className="bg-white p-4 rounded-md">
              <QRCodeSVG value={code} size={180} />
            </div>
          </div>
        )}

        {instructions && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Redemption Instructions:</h4>
            <div className="bg-background p-3 rounded-md border border-primary/20 whitespace-pre-line">
              {instructions}
            </div>
          </div>
        )}

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Please keep this code secure. It can only be redeemed once.
          </p>
        </div>
      </div>
    </div>
  )
}