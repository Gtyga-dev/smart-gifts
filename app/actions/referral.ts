"use server"

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/app/lib/db"
import { Resend } from "resend"
import ReferralInviteEmail from "@/emails/ReferralInvite"
import ReferralRewardEmail from "@/emails/ReferralReward"
import { nanoid } from "nanoid"
import React from "react"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { cache } from "react"

// Check if RESEND_API_KEY is defined
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://smartcards.store"

// Input validation schemas
const emailSchema = z.string().email("Invalid email address")
const referralCodeSchema = z.string().min(4, "Invalid referral code")
const userIdSchema = z.string().min(1, "Invalid user ID")
const orderIdSchema = z.string().min(1, "Invalid order ID")
const amountSchema = z.number().min(0, "Amount must be positive")
const programSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  description: z.string(),
  isActive: z.boolean(),
  referrerReward: z.number().min(0, "Referrer reward must be positive"),
  refereeReward: z.number().min(0, "Referee reward must be positive"),
  minimumPurchase: z.number().optional().nullable(),
  maxRewardsPerUser: z.number().int().optional().nullable(),
})

// Type definitions for better type safety
type ReferralProgram = {
  id: string
  name: string
  description: string
  isActive: boolean
  rewardAmount: number
  referrerReward: number
  refereeReward: number
  minimumPurchase: number | null
  maxRewardsPerUser: number | null
  createdAt: Date
  updatedAt: Date
}

type SaveReferralProgramResult = {
  success: boolean
  message: string
  error?: string
}

type SendInvitationResult = {
  success: boolean
  message: string
}

type ReferralStats = {
  totalReferrals: number
  completedReferrals: number
  conversionRate: number
  totalRewardsAmount: number
  topReferrers: Array<{
    userId: string
    userName: string
    email: string
    referralCode: string
    totalReferrals: number
    successfulReferrals: number
  }>
}

type UserReferralsResult = {
  referrals: Array<{
    id: string
    status: string
    rewardAmount: number
    rewardPaid: boolean
    createdAt: Date
    programName: string
  }>
  totalCount: number
}

// Helper function to check if a table exists in the database
export async function checkIfTableExists(tableName: string): Promise<boolean> {
  try {
    // Use Prisma's $queryRaw to execute a raw SQL query
    // This checks if the table exists in the PostgreSQL database
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName.toLowerCase()}
      );
    `

    // The result will be an array with one object containing the EXISTS result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result as any)[0]?.exists || false
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

// Helper function to ensure required tables exist
export async function ensureReferralTablesExist(): Promise<boolean> {
  try {
    // Check if the required tables exist
    const referralProgramExists = await checkIfTableExists("ReferralProgram")
    const referralCodeExists = await checkIfTableExists("ReferralCode")
    const referralExists = await checkIfTableExists("Referral")

    return referralProgramExists && referralCodeExists && referralExists
  } catch (error) {
    console.error("Error checking referral tables:", error)
    return false
  }
}

// Cache the active referral program to reduce database queries
export const getActiveReferralProgram = cache(async () => {
  try {
    // Check if the ReferralProgram table exists before querying
    const tableExists = await checkIfTableExists("ReferralProgram")
    if (!tableExists) {
      console.warn("ReferralProgram table does not exist in the database")
      return null
    }

    return await prisma.referralProgram.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Error fetching active referral program:", error)
    return null
  }
})

// Get user's referral code
export async function getUserReferralCode() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return null
    }

    // Check if ReferralProgram table exists
    const referralProgramTableExists = await checkIfTableExists("ReferralProgram")
    if (!referralProgramTableExists) {
      console.warn("ReferralProgram table does not exist in the database")
      return null
    }

    // Check if ReferralCode table exists
    const referralCodeTableExists = await checkIfTableExists("ReferralCode")
    if (!referralCodeTableExists) {
      console.warn("ReferralCode table does not exist in the database")
      return null
    }

    // Find active program
    const program = await getActiveReferralProgram()
    if (!program) {
      return null
    }

    // Check if user already has a referral code for this program
    let referralCode = await prisma.referralCode.findFirst({
      where: {
        userId: user.id,
        programId: program.id,
      },
    })

    // If not, create one
    if (!referralCode) {
      // Generate a unique code with user's name prefix
      // Safely access firstName using optional chaining and fallbacks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstName = user.given_name || (user as any).firstName || ""
      const prefix = firstName.substring(0, 3).toUpperCase() || "REF"
      const uniqueId = nanoid(6).toUpperCase()
      const code = `${prefix}${uniqueId}`

      // Check if code already exists to avoid duplicates
      const existingCode = await prisma.referralCode.findUnique({
        where: { code },
      })

      if (existingCode) {
        // If code already exists, generate a new one
        const newUniqueId = nanoid(8).toUpperCase()
        const newCode = `${prefix}${newUniqueId}`

        referralCode = await prisma.referralCode.create({
          data: {
            code: newCode,
            userId: user.id,
            programId: program.id,
          },
        })
      } else {
        referralCode = await prisma.referralCode.create({
          data: {
            code,
            userId: user.id,
            programId: program.id,
          },
        })
      }
    }

    return {
      code: referralCode.code,
      timesUsed: referralCode.timesUsed,
      referralUrl: `${BASE_URL}?ref=${referralCode.code}`,
      program,
    }
  } catch (error) {
    console.error("Error getting user referral code:", error)
    return null
  }
}

// Send referral invitation
export async function sendReferralInvitation(formData: FormData): Promise<SendInvitationResult> {
  try {
    // Check if required tables exist
    const referralProgramTableExists = await checkIfTableExists("ReferralProgram")
    const referralCodeTableExists = await checkIfTableExists("ReferralCode")

    if (!referralProgramTableExists || !referralCodeTableExists) {
      return {
        success: false,
        message: "The referral program feature is not available. Database tables have not been set up.",
      }
    }

    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return { success: false, message: "You must be logged in" }
    }

    // Validate email
    const emailInput = formData.get("email") as string
    const emailResult = emailSchema.safeParse(emailInput)
    if (!emailResult.success) {
      return { success: false, message: "Invalid email address" }
    }

    const email = emailResult.data

    const referralData = await getUserReferralCode()
    if (!referralData) {
      return { success: false, message: "Referral program not available" }
    }

    if (!resend) {
      return { success: false, message: "Email service not configured" }
    }

    // Safely access firstName using optional chaining and fallbacks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstName = user.given_name || (user as any).firstName || "Someone"

    try {
      await resend.emails.send({
        from: "SmartCards <support@smartcards.store>",
        to: [email],
        subject: `${firstName} invited you to SmartCards Gift Cards`,
        react: React.createElement(ReferralInviteEmail, {
          referrerName: firstName || "Your friend",
          referralCode: referralData.code,
          referralUrl: referralData.referralUrl,
          refereeReward: referralData.program.refereeReward / 100, // Convert cents to dollars
        }),
      })

      // Log successful invitation for analytics
      console.log(`Referral invitation sent from ${user.id} to ${email}`)

      return { success: true, message: "Invitation sent successfully" }
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      return { success: false, message: "Failed to send email. Please try again later." }
    }
  } catch (error) {
    console.error("Failed to send referral email:", error)
    return { success: false, message: "Failed to send invitation" }
  }
}

// Process referral when a new user signs up
export async function processReferral(referralCode: string, newUserId: string) {
  try {
    // Check if required tables exist
    const referralCodeTableExists = await checkIfTableExists("ReferralCode")
    const referralTableExists = await checkIfTableExists("Referral")

    if (!referralCodeTableExists || !referralTableExists) {
      console.warn("Required tables do not exist in the database")
      return null
    }

    // Validate inputs
    const codeResult = referralCodeSchema.safeParse(referralCode)
    const userIdResult = userIdSchema.safeParse(newUserId)

    if (!codeResult.success || !userIdResult.success) {
      console.error("Invalid referral code or user ID")
      return null
    }

    // Find the referral code
    const code = await prisma.referralCode.findUnique({
      where: { code: referralCode },
      include: { program: true },
    })

    if (!code || !code.program.isActive) {
      console.log("Referral code not found or program inactive")
      return null
    }

    // Prevent self-referrals
    if (code.userId === newUserId) {
      console.log("Self-referral attempted")
      return null
    }

    // Check if user has already been referred
    const existingReferral = await prisma.referral.findFirst({
      where: {
        refereeId: newUserId,
      },
    })

    if (existingReferral) {
      console.log("User already has a referral")
      return existingReferral
    }

    // Use a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Create a pending referral
      const referral = await tx.referral.create({
        data: {
          referralCodeId: code.id,
          referrerId: code.userId,
          refereeId: newUserId,
          status: "pending",
        },
      })

      // Update the user with referredBy
      await tx.user.update({
        where: { id: newUserId },
        data: { referredBy: code.userId },
      })

      // Increment the times used counter
      await tx.referralCode.update({
        where: { id: code.id },
        data: { timesUsed: { increment: 1 } },
      })

      return referral
    })
  } catch (error) {
    console.error("Error processing referral:", error)
    return null
  }
}

// Complete a referral after qualifying purchase
export async function completeReferral(refereeId: string, orderId: string, orderAmount: number) {
  try {
    // Check if required tables exist
    const referralTableExists = await checkIfTableExists("Referral")
    if (!referralTableExists) {
      console.warn("Referral table does not exist in the database")
      return null
    }

    // Validate inputs
    const userIdResult = userIdSchema.safeParse(refereeId)
    const orderIdResult = orderIdSchema.safeParse(orderId)
    const amountResult = amountSchema.safeParse(orderAmount)

    if (!userIdResult.success || !orderIdResult.success || !amountResult.success) {
      console.error("Invalid input parameters for completing referral")
      return null
    }

    // Find pending referral for this user
    const referral = await prisma.referral.findFirst({
      where: {
        refereeId,
        status: "pending",
        rewardPaid: false,
      },
      include: {
        referralCode: {
          include: {
            program: true,
            user: true,
          },
        },
      },
    })

    if (!referral) {
      console.log("No pending referral found for user", refereeId)
      return null
    }

    const program = referral.referralCode.program

    // Check if order meets minimum purchase requirement
    if (program.minimumPurchase && orderAmount < program.minimumPurchase) {
      console.log("Order amount does not meet minimum purchase requirement")
      return null
    }

    // Check if referrer has reached maximum rewards (if set)
    if (program.maxRewardsPerUser) {
      const referrerCompletedReferrals = await prisma.referral.count({
        where: {
          referrerId: referral.referralCode.userId,
          status: "completed",
          rewardPaid: true,
        },
      })

      if (referrerCompletedReferrals >= program.maxRewardsPerUser) {
        console.log("Referrer has reached maximum rewards limit")
        return null
      }
    }

    // Use a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Update referral to completed
      const updatedReferral = await tx.referral.update({
        where: { id: referral.id },
        data: {
          status: "completed",
          rewardPaid: true,
          rewardAmount: program.rewardAmount,
          qualifyingOrderId: orderId,
        },
      })

      // Award referrer their reward
      await tx.user.update({
        where: { id: referral.referralCode.userId },
        data: {
          referralRewards: { increment: program.referrerReward },
        },
      })

      // Send email to referrer if email service is configured
      if (resend && referral.referralCode.user.email) {
        try {
          await resend.emails.send({
            from: "SmartCards <support@smartcards.store>",
            to: [referral.referralCode.user.email],
            subject: "You earned a referral reward!",
            react: React.createElement(ReferralRewardEmail, {
              userName: referral.referralCode.user.firstName || "Friend",
              rewardAmount: program.referrerReward / 100, // Convert cents to dollars
            }),
          })
        } catch (emailError) {
          // Log but don't fail the transaction if email fails
          console.error("Failed to send reward email:", emailError)
        }
      }

      // Revalidate paths to update UI
      revalidatePath("/dashboard/referrals")
      revalidatePath("/dashboard/admin/referrals")

      return updatedReferral
    })
  } catch (error) {
    console.error("Error completing referral:", error)
    return null
  }
}

// Admin: Create or update referral program
export async function saveReferralProgram(formData: FormData): Promise<SaveReferralProgramResult> {
  try {
    console.log("Starting saveReferralProgram function")

    // Check if ReferralProgram table exists
    const tableExists = await checkIfTableExists("ReferralProgram")
    if (!tableExists) {
      console.error("ReferralProgram table does not exist")
      return {
        success: false,
        message: "The referral program feature is not available. Database tables have not been set up.",
      }
    }

    // Parse and validate form data
    const programId = formData.get("id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "true"

    console.log("Form data parsed:", { programId, name, description, isActive })

    // Parse numeric values safely
    const referrerRewardStr = formData.get("referrerReward") as string
    const refereeRewardStr = formData.get("refereeReward") as string

    // Validate required fields
    if (!name || !referrerRewardStr || !refereeRewardStr) {
      console.error("Missing required fields:", { name, referrerRewardStr, refereeRewardStr })
      return { success: false, message: "Missing required fields" }
    }

    // Safely parse numbers with fallbacks
    const referrerReward = Number.isNaN(Number.parseFloat(referrerRewardStr))
      ? 0
      : Number.parseFloat(referrerRewardStr) * 100
    const refereeReward = Number.isNaN(Number.parseFloat(refereeRewardStr))
      ? 0
      : Number.parseFloat(refereeRewardStr) * 100

    const minimumPurchaseStr = formData.get("minimumPurchase") as string
    const minimumPurchase =
      minimumPurchaseStr && !Number.isNaN(Number.parseFloat(minimumPurchaseStr))
        ? Number.parseFloat(minimumPurchaseStr) * 100
        : null

    const maxRewardsPerUserStr = formData.get("maxRewardsPerUser") as string
    const maxRewardsPerUser =
      maxRewardsPerUserStr && !Number.isNaN(Number.parseInt(maxRewardsPerUserStr))
        ? Number.parseInt(maxRewardsPerUserStr)
        : null

    console.log("Numeric values parsed:", {
      referrerReward,
      refereeReward,
      minimumPurchase,
      maxRewardsPerUser,
    })

    // Validate program data
    const programData = {
      name,
      description,
      isActive,
      referrerReward,
      refereeReward,
      minimumPurchase,
      maxRewardsPerUser,
    }

    const validationResult = programSchema.safeParse(programData)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(", ")
      console.error("Validation failed:", errorMessage)
      return {
        success: false,
        message: "Invalid program data: " + errorMessage,
      }
    }

    try {
      console.log("Starting database transaction")
      // Use a transaction for data consistency
      await prisma.$transaction(async (tx) => {
        // If setting a program to active, deactivate all other programs
        if (isActive) {
          console.log("Deactivating other programs")
          await tx.referralProgram.updateMany({
            where: {
              id: { not: programId || "" },
              isActive: true,
            },
            data: { isActive: false },
          })
        }

        if (programId) {
          // Check if program exists before updating
          const existingProgram = await tx.referralProgram.findUnique({
            where: { id: programId },
          })

          if (!existingProgram) {
            throw new Error("Program not found")
          }

          console.log("Updating existing program:", programId)
          // Update existing program
          await tx.referralProgram.update({
            where: { id: programId },
            data: {
              name,
              description,
              isActive,
              rewardAmount: referrerReward + refereeReward,
              referrerReward,
              refereeReward,
              minimumPurchase,
              maxRewardsPerUser,
            },
          })
        } else {
          console.log("Creating new program")
          // Create new program
          await tx.referralProgram.create({
            data: {
              name,
              description,
              isActive,
              rewardAmount: referrerReward + refereeReward,
              referrerReward,
              refereeReward,
              minimumPurchase,
              maxRewardsPerUser,
            },
          })
        }
      })

      console.log("Database transaction completed successfully")
    } catch (error) {
      console.error("Database operation failed:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Database operation failed",
        error: error instanceof Error ? error.stack : undefined,
      }
    }

    // Revalidate paths to update UI
    revalidatePath("/dashboard/admin/referrals")
    revalidatePath("/dashboard/referrals")

    console.log("Referral program saved successfully")
    return {
      success: true,
      message: programId ? "Referral program updated successfully" : "Referral program created successfully",
    }
  } catch (error) {
    console.error("Failed to save referral program:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save referral program",
      error: error instanceof Error ? error.stack : undefined,
    }
  }
}

// Admin: Get all referral programs
export async function getReferralPrograms(): Promise<ReferralProgram[]> {
  try {
    // Check if table exists
    const tableExists = await checkIfTableExists("ReferralProgram")
    if (!tableExists) {
      console.warn("ReferralProgram table does not exist in the database")
      return []
    }

    return await prisma.referralProgram.findMany({
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Error fetching referral programs:", error)
    return []
  }
}

// Admin: Get referral statistics
export async function getReferralStats(): Promise<ReferralStats> {
  try {
    // Check if required tables exist
    const referralTableExists = await checkIfTableExists("Referral")
    const referralCodeTableExists = await checkIfTableExists("ReferralCode")

    if (!referralTableExists || !referralCodeTableExists) {
      console.warn("Required tables do not exist in the database")
      return {
        totalReferrals: 0,
        completedReferrals: 0,
        conversionRate: 0,
        totalRewardsAmount: 0,
        topReferrers: [],
      }
    }

    // Get basic stats
    const totalReferrals = await prisma.referral.count()
    const completedReferrals = await prisma.referral.count({
      where: { status: "completed" },
    })
    const totalRewardsAmount = await prisma.referral.aggregate({
      where: { status: "completed", rewardPaid: true },
      _sum: { rewardAmount: true },
    })

    // Get top referrers with efficient query
    const topReferrers = await prisma.referralCode.findMany({
      where: {
        timesUsed: { gt: 0 },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            referrals: {
              where: { status: "completed" },
            },
          },
        },
      },
      orderBy: { timesUsed: "desc" },
      take: 10,
    })

    return {
      totalReferrals,
      completedReferrals,
      conversionRate: totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0,
      totalRewardsAmount: totalRewardsAmount._sum.rewardAmount || 0,
      topReferrers: topReferrers.map((ref) => ({
        userId: ref.userId,
        userName: `${ref.user.firstName} ${ref.user.lastName}`,
        email: ref.user.email,
        referralCode: ref.code,
        totalReferrals: ref.timesUsed,
        successfulReferrals: ref._count.referrals,
      })),
    }
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return {
      totalReferrals: 0,
      completedReferrals: 0,
      conversionRate: 0,
      totalRewardsAmount: 0,
      topReferrers: [],
    }
  }
}

// Get user's referrals with pagination
export async function getUserReferrals(page = 1, limit = 10): Promise<UserReferralsResult> {
  try {
    // Check if required tables exist
    const referralTableExists = await checkIfTableExists("Referral")
    const referralCodeTableExists = await checkIfTableExists("ReferralCode")

    if (!referralTableExists || !referralCodeTableExists) {
      console.warn("Required tables do not exist in the database")
      return { referrals: [], totalCount: 0 }
    }

    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return { referrals: [], totalCount: 0 }
    }

    // Ensure page and limit are valid numbers
    const validPage = Math.max(1, Number.isInteger(page) ? page : 1)
    const validLimit = Math.max(1, Math.min(50, Number.isInteger(limit) ? limit : 10))

    // Get total count for pagination
    const totalCount = await prisma.referral.count({
      where: {
        referralCode: {
          userId: user.id,
        },
      },
    })

    // Get referrals with pagination
    const referrals = await prisma.referral.findMany({
      where: {
        referralCode: {
          userId: user.id,
        },
      },
      include: {
        referralCode: {
          include: {
            program: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (validPage - 1) * validLimit,
      take: validLimit,
    })

    return {
      referrals: referrals.map((referral) => ({
        id: referral.id,
        status: referral.status,
        rewardAmount: referral.rewardAmount || 0,
        rewardPaid: referral.rewardPaid,
        createdAt: referral.createdAt,
        programName: referral.referralCode.program.name,
      })),
      totalCount,
    }
  } catch (error) {
    console.error("Error fetching user referrals:", error)
    return { referrals: [], totalCount: 0 }
  }
}

// Get program by ID
export async function getProgramById(id: string): Promise<ReferralProgram | null> {
  try {
    if (!id) return null

    // Check if table exists first
    const tableExists = await checkIfTableExists("ReferralProgram")
    if (!tableExists) {
      return null
    }

    return await prisma.referralProgram.findUnique({
      where: { id },
    })
  } catch (error) {
    console.error("Error fetching program by ID:", error)
    return null
  }
}

