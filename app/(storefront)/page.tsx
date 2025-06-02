export const dynamic = "force-dynamic"

import { CategoriesSelection } from "../components/storefront/CategorySelection"
import { HowItWorks } from "../components/storefront/HowItWorks"
import { HeroWrapper } from "../components/storefront/HeroWrapper"

import { TrendingGiftCardsWrapper } from "../components/storefront/TrendingGiftCardsWrapper"
import { FeaturedProducts } from "../components/storefront/FeaturedProducts"


export default function IndexPage() {
  return (
    <div className="flex flex-col gap-12 md:gap-20">
      <HeroWrapper />
      <CategoriesSelection />
      <FeaturedProducts />
      <TrendingGiftCardsWrapper />
      <HowItWorks />
     
    </div>
  )
}
