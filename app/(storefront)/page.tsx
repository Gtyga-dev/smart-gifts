export const dynamic = "force-dynamic"

import { CategoriesSelection } from "../components/storefront/CategorySelection"
import { HeroWrapper } from "../components/storefront/HeroWrapper"
import { FeaturedProducts } from "../components/storefront/FeaturedProducts"


export default function IndexPage() {
  return (
    <div className="flex flex-col gap-12 md:gap-20">
      <HeroWrapper />
      <CategoriesSelection />
      <FeaturedProducts />
    </div>
  )
}
