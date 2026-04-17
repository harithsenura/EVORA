"use client"

import Link from "next/link"
import { getImageUrl } from "@/lib/api-config"

interface SimilarProductsProps {
  currentProductId: number
}

export function SimilarProducts({ currentProductId }: SimilarProductsProps) {
  // Sample similar products data - in a real app this would come from a database
  const allProducts = [
    {
      id: 1,
      name: "Signature Slippers",
      price: "Rs. 3,800",
      originalPrice: "Rs. 4,500",
      image: "/placeholder.svg?height=300&width=300",
      badge: "Best Seller",
    },
    {
      id: 2,
      name: "Designer Heel Sandals",
      price: "Rs. 5,200",
      originalPrice: "Rs. 6,000",
      image: "/placeholder.svg?height=300&width=300",
      badge: "New Arrival",
    },
    {
      id: 3,
      name: "Comfort Plus Slides",
      price: "Rs. 2,900",
      originalPrice: "Rs. 3,400",
      image: "/placeholder.svg?height=300&width=300",
      badge: "Limited",
    },
    {
      id: 4,
      name: "Evening Elegance Heels",
      price: "Rs. 6,500",
      originalPrice: "Rs. 7,200",
      image: "/placeholder.svg?height=300&width=300",
      badge: "Premium",
    },
    {
      id: 5,
      name: "Casual Comfort Mules",
      price: "Rs. 3,200",
      originalPrice: "Rs. 3,800",
      image: "/placeholder.svg?height=300&width=300",
      badge: "Popular",
    },
    {
      id: 6,
      name: "Luxury Velvet Collection",
      price: "Rs. 4,800",
      originalPrice: "Rs. 5,500",
      image: "/placeholder.svg?height=300&width=300",
      badge: "Exclusive",
    },
    {
      id: 7,
      name: "Classic Leather Loafers",
      price: "Rs. 4,200",
      originalPrice: "Rs. 4,800",
      image: "/placeholder.svg?height=300&width=300",
      badge: "Classic",
    },
    {
      id: 8,
      name: "Strappy Summer Sandals",
      price: "Rs. 3,600",
      originalPrice: "Rs. 4,200",
      image: "/placeholder.svg?height=300&width=300",
      badge: "Summer",
    },
  ]

  // Filter out current product and get 4 similar products
  const similarProducts = allProducts.filter((product) => product.id !== currentProductId).slice(0, 4)

  return (
    <section className="relative">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-6 h-6 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full opacity-8 animate-float" />
        <div
          className="absolute top-20 right-20 w-8 h-8 bg-gradient-to-br from-purple-300 to-purple-400 rounded-lg opacity-6 animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-7 h-7 bg-gradient-to-br from-blue-300 to-blue-400 rounded-xl opacity-8 animate-float"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute bottom-10 right-10 w-5 h-5 bg-gradient-to-br from-green-300 to-green-400 rounded-full opacity-10 animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-black mb-4">
            <span className="text-stone-700">Similar</span>
            <span className="text-orange-500"> Products</span>
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover more elegant footwear from our curated collection
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {similarProducts.map((product, index) => (
            <div key={product.id} className="group cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>
              <Link href={`/product/${product.id}`}>
                <div className="bg-white/65 backdrop-blur-lg border border-white/50 shadow-xl shadow-stone-200/60 rounded-3xl p-4 md:p-6 hover:scale-105 hover:bg-white/75 hover:shadow-2xl hover:shadow-stone-300/70 transition-all duration-700 relative overflow-hidden">
                  {/* Badge */}
                  <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10">
                    <span className="bg-amber-500/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                      {product.badge}
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="aspect-square rounded-2xl overflow-hidden mb-3 md:mb-4 bg-white/30 relative">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-stone-800 text-sm md:text-base group-hover:text-amber-700 transition-colors duration-300 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 font-bold text-base md:text-lg">{product.price}</span>
                      <span className="text-stone-400 line-through text-xs md:text-sm">{product.originalPrice}</span>
                    </div>

                    {/* View Button */}
                    <div className="pt-2">
                      <button className="w-full bg-white/70 backdrop-blur-md border border-white/50 shadow-lg shadow-stone-200/50 px-3 py-2 rounded-full text-stone-700 font-medium text-sm hover:scale-105 hover:bg-white/80 hover:shadow-xl hover:shadow-stone-300/60 transition-all duration-500 group/btn">
                        <span className="flex items-center justify-center gap-2">
                          View Details
                          <svg
                            className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl" />
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-12">
          <Link href="/#shop">
            <button className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg shadow-stone-200/50 px-8 py-3 rounded-full text-stone-700 font-medium text-lg hover:scale-105 hover:bg-white/80 hover:shadow-xl hover:shadow-stone-300/60 transition-all duration-500 group">
              <span className="flex items-center gap-3">
                View All Products
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
