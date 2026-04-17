import { HeroSection } from "@/components/hero-section"
import { NewestCollectionSlippersSection, PlatformsSection } from "@/components/newest-collection-slippers-section"
import AutoImageStrip from "@/components/AutoImageStrip"
import { BrowseRangeSection } from "@/components/browse-range-section"
import { ShopNowSection } from "@/components/shop-now-section"
import { LimitedEditionSection } from "@/components/limited-edition-section"
import { CustomerFeedbackSection } from "@/components/customer-feedback-section"

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen relative">

        <div className="relative z-10">
          <HeroSection />
          <NewestCollectionSlippersSection />
          <div>
            <AutoImageStrip
              images={[
                "/modern-white-leather-slide-sandals-with-gold-accen.png",
                "/comfortable-platform-sandals-in-tan-leather-with-a.png",
                "/sporty-white-slides-with-cushioned-footbed-and-log.png",
                "/elegant-beige-comfort-house-slippers-with-soft-pad.png",
                "/athletic-style-slides.png",
                "/luxury-brown-leather-mule-slippers-with-decorative.png",
              ]}
              speedMs={25000}
            />
            <div className="mt-16 md:mt-24 lg:mt-30">
              <PlatformsSection />
            </div>
            <BrowseRangeSection />
            <LimitedEditionSection />
            <ShopNowSection />
            <NewestCollectionSlippersSection collectionMode="mostPopular" titleMain="Most" titleSuffix="Popular" />
            <CustomerFeedbackSection />
          </div>
        </div>
      </main>
    </>
  )
}
