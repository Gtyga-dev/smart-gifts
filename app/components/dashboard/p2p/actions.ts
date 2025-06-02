"use server"

import prisma from "@/app/lib/db"
import { Resend } from "resend"

// Import the email templates
import ListingApprovedEmail from "@/emails/ListingApprovedEmail"
import ListingRejectedEmail from "@/emails/ListingRejectedEmail"
import ListingSubmittedEmail from "@/emails/ListingSubmittedEmail"

// Initialize Resend with a null check to prevent runtime errors
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function getPendingListings() {
    try {
        return await prisma.p2PListing.findMany({
            where: { status: "pending" },
            select: {
                id: true,
                type: true,
                assetType: true,
                assetName: true,
                price: true,
                createdAt: true,
                status: true,
                user: { select: { firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        })
    } catch (error) {
        console.error("Error fetching pending listings:", error)
        return []
    }
}

export async function approveListing(listingId: string) {
    try {
        // First update the listing status without any complex operations
        const listing = await prisma.p2PListing.update({
            where: { id: listingId },
            data: { status: "active" },
            include: {
                user: { select: { email: true, firstName: true, lastName: true } },
            },
        })

        // Then handle email sending separately
        if (listing.user?.email) {
            // Don't await the email sending to prevent blocking the update
            sendEmail(listing.user.email, "P2P Listing Approved", {
                react: ListingApprovedEmail({
                    listingId: listing.id,
                    assetName: listing.assetName,
                    firstName: listing.user.firstName,
                }),
            }).catch((error) => {
                console.error("Failed to send approval email:", error)
            })
        }

        return { success: true, listing }
    } catch (error) {
        console.error("Error approving listing:", error)
        return { success: false, error: "Failed to approve listing" }
    }
}

export async function rejectListing(listingId: string) {
    try {
        // First update the listing status without any complex operations
        const listing = await prisma.p2PListing.update({
            where: { id: listingId },
            data: { status: "rejected" },
            include: {
                user: { select: { email: true, firstName: true } },
            },
        })

        // Then handle email sending separately
        if (listing.user?.email) {
            // Don't await the email sending to prevent blocking the update
            sendEmail(listing.user.email, "P2P Listing Rejected", {
                react: ListingRejectedEmail({
                    listingId: listing.id,
                    assetName: listing.assetName,
                    firstName: listing.user.firstName,
                }),
            }).catch((error) => {
                console.error("Failed to send rejection email:", error)
            })
        }

        return { success: true, listing }
    } catch (error) {
        console.error("Error rejecting listing:", error)
        return { success: false, error: "Failed to reject listing" }
    }
}

export async function notifyListingSubmission(
    listingId: string,
    userEmail: string,
    userName: string,
    assetName: string,
) {
    if (!userEmail) return { success: false, error: "No email provided" }

    try {
        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
            console.warn("Resend API key not configured. Email notification skipped.")
            return { success: true, warning: "Email service not configured, but listing was created successfully" }
        }

        await sendEmail(userEmail, "P2P Listing Submitted", {
            react: ListingSubmittedEmail({
                listingId,
                assetName,
                firstName: userName,
            }),
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to send listing submission email:", error)
        // Return success true because the listing was created even if email failed
        return {
            success: true,
            warning: "Listing created successfully, but email notification failed",
        }
    }
}

async function sendEmail(to: string, subject: string, content: { react: React.ReactElement }) {
    // If Resend is not initialized, log and return early
    if (!resend) {
        console.warn("Resend API key is not configured")
        return { success: false, error: "Email service not configured" }
    }

    try {
        const data = await resend.emails.send({
            from: "Smartcards <support@smartcards.store>",
            to: [to],
            subject: subject,
            react: content.react,
        })

        return { success: true, data }
    } catch (error) {
        console.error("Failed to send email:", error)
        // Don't throw the error, just return failure status
        return { success: false, error: "Failed to send email" }
    }
}
