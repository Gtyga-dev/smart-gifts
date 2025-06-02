import { Resend } from "resend"
import type React from "react"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, react: React.ReactNode) {
  try {
    const data = await resend.emails.send({
      from: "Smartcards <support@smartcards.store>",
      to: [to],
      subject: subject,
      react: react,
    })
    console.log("Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

