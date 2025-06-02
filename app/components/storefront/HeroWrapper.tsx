import prisma from "@/app/lib/db"
import { ClientHero } from "./ClientHero"

async function getBannerData() {
  const data = await prisma.banner.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return data
}

export async function HeroWrapper() {
  const banners = await getBannerData()

  return <ClientHero banners={banners} />
}
