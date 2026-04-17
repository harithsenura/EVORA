"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getImageUrl } from "@/lib/api-config"

interface Product {
  id: number
  name: string
  price: string
  originalPrice: string
  numericPrice: number
  image: string
  badge: string
  category: string
  inStock: boolean
  rating: number
  isNew: boolean
  popularity: number
}

interface RecentlyViewedProps {
  currentProductId?: number
}

export function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])

  // Sample products for demonstration
  const sampleProducts: Product[] = [
    {
      id: 1,
      name: "Signature Collection Slippers",
      price: "Rs. 3,800",
      originalPrice: "Rs. 4,500",
      numericPrice: 3800,
      image: "/placeholder.svg?height=300&width=300",
      badge: "Best Seller",
      category: "Slippers",
      inStock: true,
      rating: 4.8,
      isNew: false,
      popularity: 95,
    },
    {
      id: 2,
      name: "Designer Heel Sandals",
      price: "Rs. 5,200",
      originalPrice: "Rs. 6,000",
      numericPrice: 5200,
      image: "/placeholder.svg?height=300&width=300",
      badge: "New Arrival",
      category: "Heels",
      inStock: true,
      rating: 4.7,
      isNew: true,
      popularity: 85,
    },
    {
      id: 3,
      name: "Comfort Plus Slides",
      price: "Rs. 2,900",
      originalPrice: "Rs. 3,400",
      numericPrice: 2900,
      image: "/placeholder.svg?height=300&width=300",
      badge: "Limited",
      category: "Slides",
      inStock: true,
      rating: 4.7,
      isNew: false,
      popularity: 93,
    },
    {
      id: 4,
      name: "Evening Elegance Heels",
      price: "Rs. 6,500",
      originalPrice: "Rs. 7,200",
      numericPrice: 6500,
      image: "/placeholder.svg?height=300&width=300",
      badge: "Premium",
      category: "Heels",
      inStock: true,
      rating: 4.9,
      isNew: false,
      popularity: 78,
    },
  ]

  useEffect(() => {
    // Load recently viewed from localStorage
    const stored = localStorage.getItem("recentlyViewed")
    if (stored) {
      const viewedIds = JSON.parse(stored)
      const viewedProducts = sampleProducts.filter((p) => viewedIds.includes(p.id))
      setRecentlyViewed(viewedProducts)
    }
  }, [])

  useEffect(() => {
    // Add current product to recently viewed
    if (currentProductId) {
      const product = sampleProducts.find((p) => p.id === currentProductId)
      if (product) {
        setRecentlyViewed((prev) => {
          const filtered = prev.filter((p) => p.id !== currentProductId)
          const updated = [product, ...filtered].slice(0, 4) // Keep only 4 items

          // Save to localStorage
          const ids = updated.map((p) => p.id)
          localStorage.setItem("recentlyViewed", JSON.stringify(ids))

          return updated
        })
      }
    }
  }, [currentProductId])

  if (recentlyViewed.length === 0) return null

  return (
    <div className="bg-white/70 backdrop-blur-lg border border-white/50 shadow-xl shadow-stone-200/60 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold text-stone-800">Recently Viewed</h2>
        <button
          onClick={() => {
            setRecentlyViewed([])
            localStorage.removeItem("recentlyViewed")
          }}
          className="text-stone-500 hover:text-stone-700 text-sm transition-colors duration-300"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentlyViewed.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <div className="group cursor-pointer">
              <div className="bg-white/65 backdrop-blur-lg border border-white/50 shadow-lg rounded-2xl p-4 hover:scale-105 hover:bg-white/75 hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                {/* Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-amber-500/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    {product.badge}
                  </span>
                </div>

                {/* Product Image */}
                <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-white/30 relative">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-stone-800 text-sm group-hover:text-amber-700 transition-colors duration-300 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-amber-400" : "text-stone-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 font-bold text-sm">{product.price}</span>
                    <span className="text-stone-400 line-through text-xs">{product.originalPrice}</span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
