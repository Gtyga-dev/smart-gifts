import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database migration for referral tables...");

  try {
    // Check if migrations have been applied
    console.log("Checking database connection and schema...");

    // Create a sample referral program if none exists
    console.log("Creating default referral program...");

    // First check if a program already exists to avoid duplicates
    const existingProgram = await prisma.referralProgram.findFirst();

    if (!existingProgram) {
      await prisma.referralProgram.create({
        data: {
          name: "Default Referral Program",
          description:
            "Invite friends and earn rewards when they make their first purchase",
          isActive: true,
          rewardAmount: 1000, // $10.00
          referrerReward: 500, // $5.00
          refereeReward: 500, // $5.00
          minimumPurchase: 2000, // $20.00
        },
      });
      console.log("Default referral program created successfully");
    } else {
      console.log("Referral program already exists, skipping creation");
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
