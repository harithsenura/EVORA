// limited-edition-section.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getImageUrl } from "@/lib/api-config"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image?: string
  badge?: string
  category: string
  inStock: boolean
  isLimitedEdition: boolean
  endDate?: string // Add endDate to Product interface
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// Target End Date - using a hypothetical date for the overall section.
// This should ideally be fetched from a dedicated API endpoint or derived from the products.
const TARGET_END_DATE_STRING = "2026-01-01T00:00:00Z"; // Example date: January 1, 2026

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const difference = +targetDate - +new Date()
  let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }

  return timeLeft
}

export function LimitedEditionSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [limitedEditionProducts, setLimitedEditionProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Initialize with calculated time left based on a target date, 
  // or use the product's first endDate if available
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(new Date(TARGET_END_DATE_STRING)))
  const [targetDate, setTargetDate] = useState<Date>(new Date(TARGET_END_DATE_STRING)) // Store the target Date object

  useEffect(() => {
    // Only run the timer if the targetDate is valid and in the future
    if (targetDate && +targetDate > +new Date()) {
      const timer = setInterval(() => {
        const newTimeLeft = calculateTimeLeft(targetDate)
        setTimeLeft(newTimeLeft)

        // Stop timer when all time is 0
        if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [targetDate])

  useEffect(() => {
    const fetchLimitedEditionProducts = async () => {
      try {
        const response = await fetch(`/api/limited-edition?limit=5`)
        if (!response.ok) {
          throw new Error(`Failed to fetch limited edition products: ${response.status}`)
        }
        const data = await response.json()
        const items = Array.isArray(data.products) ? data.products : []
        const mapped: Product[] = items.map((p: any) => ({
          id: p.id || p._id || "",
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          image: (p.images && p.images[0]) || p.image,
          category: p.category,
          inStock: p.stock > 0,
          isLimitedEdition: !!p.isLimitedEdition,
          badge: p.badge,
          endDate: p.endDate, // Fetch endDate
        }))
        setLimitedEditionProducts(mapped)

        // Set the section's overall countdown based on the first product's endDate
        // if it exists and is valid. If not, the initial TARGET_END_DATE_STRING will be used.
        if (mapped.length > 0 && mapped[0].endDate) {
            const firstProductEndDate = new Date(mapped[0].endDate);
            if (!isNaN(firstProductEndDate.getTime())) {
                setTargetDate(firstProductEndDate);
                setTimeLeft(calculateTimeLeft(firstProductEndDate));
            }
        }

      } catch (error: any) {
        console.error("Failed to fetch limited edition products:", error)
        setError(error.message || "Failed to load limited edition products")
      } finally {
        setLoading(false)
      }
    }

    fetchLimitedEditionProducts()
  }, [])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % limitedEditionProducts.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + limitedEditionProducts.length) % limitedEditionProducts.length)
  }

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return null
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100)
    return `${discount}% OFF`
  }

  const hasTimeLeft = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-600 text-lg">{error}. Please try again later.</p>
        </div>
      </section>
    )
  }

  if (limitedEditionProducts.length === 0) {
    return (
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 text-lg">No limited edition products available at the moment. Check back soon!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-gray-800 font-serif mb-2">
          Deals Of The Month
        </h2>
        <p className="text-gray-600 text-base max-w-lg mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content Section */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-800 leading-tight">
              Hurry, limited stock!
            </h3>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis ultrices sollicitudin aliquam
              sem. Scelerisque duis ultrices sollicitudin
            </p>

            {/* MODIFICATION: Change button to a Link component pointing to a new limited edition products page */}
            <Link href="/limited-edition-products" passHref legacyBehavior>
                <button className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors cursor-pointer">
                Buy Now
                </button>
            </Link>

            {/* Countdown Timer - Only display if there is time left */}
            {hasTimeLeft && (
                <div className="pt-4">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Time Left:</h3>

                <div className="flex gap-4">
                    <div className="text-center">
                    <div className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 min-w-[70px]">
                        <div className="text-3xl font-bold text-gray-800 font-mono">
                        {String(timeLeft.days).padStart(2, "0")}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Days</div>
                    </div>

                    <div className="text-center">
                    <div className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 min-w-[70px]">
                        <div className="text-3xl font-bold text-gray-800 font-mono">
                        {String(timeLeft.hours).padStart(2, "0")}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Hr</div>
                    </div>

                    <div className="text-center">
                    <div className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 min-w-[70px]">
                        <div className="text-3xl font-bold text-gray-800 font-mono">
                        {String(timeLeft.minutes).padStart(2, "0")}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Mins</div>
                    </div>

                    <div className="text-center">
                    <div className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 min-w-[70px]">
                        <div className="text-3xl font-bold text-gray-800 font-mono">
                        {String(timeLeft.seconds).padStart(2, "0")}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Sec</div>
                    </div>
                </div>
                </div>
            )}
          </div>

          {/* Right Carousel Section */}
          <div className="relative">
            {/* Navigation Arrows */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10">
              <button
                onClick={prevSlide}
                className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10">
              <button
                onClick={nextSlide}
                className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex gap-4 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 50}%)` }}
              >
                {limitedEditionProducts.map((product) => (
                  <div key={product.id} className="w-[calc(50%-8px)] flex-shrink-0">
                    <Link href={`/product/${product.id}`}>
                      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                        {/* Product Image */}
                        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />

                          {/* Product Info Overlay */}
                          <div className="absolute bottom-4 left-4 bg-white px-4 py-3 rounded-md shadow-md">
                            <div className="text-xs text-gray-600 mb-1">
                              {String(limitedEditionProducts.indexOf(product) + 1).padStart(2, "0")} —{" "}
                              {product.category}
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {calculateDiscount(product.price, product.originalPrice) || "Special Offer"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Dot Navigation */}
            <div className="flex justify-center mt-6 gap-2">
              {limitedEditionProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex ? "w-8 h-2 bg-gray-800" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}