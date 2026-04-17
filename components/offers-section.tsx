"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export function OffersSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30,
  })

  const [currentSlide, setCurrentSlide] = useState(0)
  const [showAllOffers, setShowAllOffers] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 4000)

    return () => clearInterval(slideTimer)
  }, [])

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert(`Promo code "${code}" copied to clipboard!`)
  }

  const banners = [
    {
      id: 1,
      title: "Premium Velvet Collection",
      subtitle: "Luxury comfort meets elegant design",
      description: "Experience unmatched comfort with our premium velvet slides featuring memory foam cushioning",
      originalPrice: "Rs. 4,500",
      salePrice: "Rs. 2,700",
      discount: "40%",
      image: "/premium-velvet-slippers-collection.png",
      bgGradient: "from-amber-100 to-stone-200",
    },
    {
      id: 2,
      title: "Designer Block Heels",
      subtitle: "Elevate your style with confidence",
      description: "Sophisticated block heels designed for all-day comfort without compromising on elegance",
      originalPrice: "Rs. 6,200",
      salePrice: "Rs. 4,340",
      discount: "30%",
      image: "/designer-block-heels-collection.png",
      bgGradient: "from-stone-100 to-amber-100",
    },
    {
      id: 3,
      title: "Memory Foam Comfort",
      subtitle: "Cloud-like comfort for your feet",
      description: "Revolutionary memory foam technology that adapts to your foot shape for ultimate comfort",
      originalPrice: "Rs. 3,800",
      salePrice: "Rs. 2,660",
      discount: "30%",
      image: "/memory-foam-comfort-slippers.png",
      bgGradient: "from-amber-50 to-stone-150",
    },
  ]

  const offerCards = [
    {
      id: 1,
      title: "Weekend Flash Sale",
      description: "Get 25% off on all comfort slippers",
      discount: "25%",
      promoCode: "WEEKEND25",
      validUntil: "Valid until Sunday",
      image: "/comfort-slippers-offer.png",
      category: "Comfort Slippers",
    },
    {
      id: 2,
      title: "Designer Collection",
      description: "Exclusive 35% off on designer heels",
      discount: "35%",
      promoCode: "DESIGNER35",
      validUntil: "Valid for 3 days",
      image: "/designer-heels-offer.png",
      category: "Designer Heels",
    },
    {
      id: 3,
      title: "Summer Special",
      description: "Buy 2 get 1 free on summer sandals",
      discount: "Buy 2 Get 1",
      promoCode: "SUMMER3FOR2",
      validUntil: "Valid this month",
      image: "/summer-sandals-offer.png",
      category: "Summer Sandals",
    },
    {
      id: 4,
      title: "New Customer Offer",
      description: "First purchase discount of 20%",
      discount: "20%",
      promoCode: "WELCOME20",
      validUntil: "Valid for new users",
      image: "/new-customer-offer.png",
      category: "All Categories",
    },
    {
      id: 5,
      title: "Bulk Purchase Deal",
      description: "Buy 3 or more and save 30%",
      discount: "30%",
      promoCode: "BULK30",
      validUntil: "No expiry",
      image: "/bulk-purchase-offer.png",
      category: "All Products",
    },
    {
      id: 6,
      title: "Premium Membership",
      description: "Exclusive 40% off for premium members",
      discount: "40%",
      promoCode: "PREMIUM40",
      validUntil: "Members only",
      image: "/premium-member-offer.png",
      category: "Premium Collection",
    },
  ]

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-4 right-4 h-96 bg-gradient-to-br from-stone-200/30 via-amber-100/20 to-stone-300/25 rounded-3xl blur-3xl opacity-40"></div>
        <div className="absolute bottom-20 left-8 right-8 h-80 bg-gradient-to-tr from-amber-200/25 via-stone-200/30 to-amber-100/20 rounded-3xl blur-2xl opacity-35"></div>
      </div>

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url('/images/colorful-geometric-pattern.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-8 h-8 bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg rotate-12 opacity-10 animate-float"></div>
        <div
          className="absolute top-40 right-20 w-6 h-6 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-8 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-10 h-10 bg-gradient-to-br from-green-200 to-green-300 rounded-xl rotate-45 opacity-6 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-7 h-7 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg opacity-10 animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black mb-4">
            <span className="text-stone-700">Special</span>
            <span className="text-amber-800"> Offers</span>
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto mb-6">
            Limited time deals on premium footwear collection
          </p>

          <div className="flex justify-center mb-8">
            <div>
              <p className="text-stone-600 text-sm mb-3 font-medium text-center">⚡ Sale Ends In:</p>
              <div className="flex gap-4 justify-center">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-amber-800 to-amber-900 text-white rounded-lg px-3 py-2 font-bold text-xl min-w-[50px]">
                    {timeLeft.hours.toString().padStart(2, "0")}
                  </div>
                  <p className="text-xs text-stone-500 mt-1">Hours</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-amber-800 to-amber-900 text-white rounded-lg px-3 py-2 font-bold text-xl min-w-[50px]">
                    {timeLeft.minutes.toString().padStart(2, "0")}
                  </div>
                  <p className="text-xs text-stone-500 mt-1">Minutes</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-amber-800 to-amber-900 text-white rounded-lg px-3 py-2 font-bold text-xl min-w-[50px]">
                    {timeLeft.seconds.toString().padStart(2, "0")}
                  </div>
                  <p className="text-xs text-stone-500 mt-1">Seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner.id} className="w-full flex-shrink-0">
                  <div className={`bg-gradient-to-r ${banner.bgGradient} rounded-3xl overflow-hidden shadow-2xl`}>
                    <div className="flex flex-col lg:flex-row items-center min-h-[400px]">
                      {/* Content Section */}
                      <div className="flex-1 p-8 lg:p-12 text-center lg:text-left">
                        <div className="inline-block bg-amber-800 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">
                          -{banner.discount} OFF
                        </div>

                        <h3 className="text-3xl lg:text-4xl font-serif font-bold text-stone-800 mb-2">
                          {banner.title}
                        </h3>

                        <p className="text-lg text-amber-700 font-medium mb-4">{banner.subtitle}</p>

                        <p className="text-stone-600 mb-6 max-w-md mx-auto lg:mx-0">{banner.description}</p>

                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                          <span className="text-3xl font-bold text-amber-800">{banner.salePrice}</span>
                          <span className="text-xl text-stone-400 line-through">{banner.originalPrice}</span>
                        </div>

                        <Link
                          href={`/product/${banner.id}`}
                          className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-yellow-900 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        >
                          Shop Now
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </Link>
                      </div>

                      {/* Image Section */}
                      <div className="flex-1 p-8">
                        <div className="relative">
                          <img
                            src={banner.image || "/placeholder.svg"}
                            alt={banner.title}
                            className="w-full h-80 object-cover rounded-2xl shadow-lg"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-6 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index ? "bg-amber-800 scale-125" : "bg-stone-300 hover:bg-stone-400"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => setShowAllOffers(!showAllOffers)}
            className="liquid-glass-subtle hover:bg-white/80 text-stone-700 hover:text-amber-700 font-medium py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center gap-3"
          >
            {showAllOffers ? "Hide Offers" : "View All Offers"}
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${showAllOffers ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div
          className={`transition-all duration-500 overflow-hidden ${showAllOffers ? "max-h-[2000px] opacity-100 mt-12" : "max-h-0 opacity-0"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerCards.map((offer) => (
              <div
                key={offer.id}
                className="liquid-glass-subtle rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                <div className="relative mb-4">
                  <img
                    src={offer.image || "/placeholder.svg"}
                    alt={offer.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute top-3 right-3 bg-amber-800 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {offer.discount} OFF
                  </div>
                </div>

                <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">{offer.title}</h3>
                <p className="text-stone-600 mb-3">{offer.description}</p>
                <p className="text-sm text-amber-700 font-medium mb-4">{offer.category}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-stone-500 mb-1">Promo Code:</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-stone-100 text-amber-800 font-mono text-sm px-2 py-1 rounded border-2 border-dashed border-amber-200">
                        {offer.promoCode}
                      </code>
                      <button
                        onClick={() => copyPromoCode(offer.promoCode)}
                        className="text-amber-800 hover:text-amber-900 transition-colors"
                        title="Copy promo code"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-500 mb-4">{offer.validUntil}</p>

                <button className="w-full bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-yellow-900 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg">
                  Use This Offer
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
