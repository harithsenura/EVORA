"use client"

import { useState } from "react"
import Link from "next/link"

interface Product {
  id: number
  name: string
  price: string
  originalPrice: string
  image: string
  badge?: string
  rating: number
  reviews: number
}

interface CategoryData {
  name: string
  description: string
  heroImage: string
  products: Product[]
}

const categoryData: Record<string, CategoryData> = {
  slippers: {
    name: "Comfort Slippers",
    description: "Luxurious comfort for everyday wear with premium materials and ergonomic design",
    heroImage: "/elegant-comfort-slippers-collection.png",
    products: [
      {
        id: 1,
        name: "Signature Collection Slippers",
        price: "Rs. 3,800",
        originalPrice: "Rs. 4,500",
        image: "/elegant-beige-comfort-slippers.png",
        badge: "Best Seller",
        rating: 4.8,
        reviews: 124,
      },
      {
        id: 5,
        name: "Casual Comfort Mules",
        price: "Rs. 3,200",
        originalPrice: "Rs. 3,800",
        image: "/casual-comfort-mule-slippers.png",
        badge: "Popular",
        rating: 4.6,
        reviews: 89,
      },
      {
        id: 7,
        name: "Plush Memory Foam Slippers",
        price: "Rs. 4,200",
        originalPrice: "Rs. 4,800",
        image: "/plush-memory-foam-slippers.png",
        rating: 4.9,
        reviews: 156,
      },
      {
        id: 8,
        name: "Velvet Touch House Slippers",
        price: "Rs. 2,900",
        originalPrice: "Rs. 3,400",
        image: "/velvet-house-slippers.png",
        rating: 4.5,
        reviews: 67,
      },
    ],
  },
  heels: {
    name: "Designer Heels",
    description: "Sophisticated elegance for special occasions with premium craftsmanship",
    heroImage: "/designer-high-heel-sandals-collection.png",
    products: [
      {
        id: 2,
        name: "Designer Heel Sandals",
        price: "Rs. 5,200",
        originalPrice: "Rs. 6,000",
        image: "/designer-heel-sandals.png",
        badge: "New Arrival",
        rating: 4.7,
        reviews: 98,
      },
      {
        id: 4,
        name: "Evening Elegance Heels",
        price: "Rs. 6,500",
        originalPrice: "Rs. 7,200",
        image: "/evening-elegance-heels.png",
        badge: "Premium",
        rating: 4.9,
        reviews: 142,
      },
      {
        id: 9,
        name: "Crystal Embellished Heels",
        price: "Rs. 7,800",
        originalPrice: "Rs. 8,500",
        image: "/crystal-embellished-heels.png",
        rating: 4.8,
        reviews: 76,
      },
    ],
  },
  sandals: {
    name: "Summer Sandals",
    description: "Breathable style for warm weather with comfortable straps and cushioned soles",
    heroImage: "/summer-sandals-collection.png",
    products: [
      {
        id: 10,
        name: "Strappy Summer Sandals",
        price: "Rs. 3,600",
        originalPrice: "Rs. 4,200",
        image: "/strappy-summer-sandals.png",
        rating: 4.4,
        reviews: 112,
      },
      {
        id: 11,
        name: "Bohemian Style Sandals",
        price: "Rs. 4,100",
        originalPrice: "Rs. 4,700",
        image: "/bohemian-style-sandals.png",
        badge: "Trending",
        rating: 4.6,
        reviews: 89,
      },
      {
        id: 12,
        name: "Minimalist Flat Sandals",
        price: "Rs. 2,800",
        originalPrice: "Rs. 3,300",
        image: "/minimalist-flat-sandals.png",
        rating: 4.3,
        reviews: 134,
      },
    ],
  },
  slides: {
    name: "Casual Slides",
    description: "Easy slip-on convenience with modern design and all-day comfort",
    heroImage: "/casual-slide-sandals-collection.png",
    products: [
      {
        id: 3,
        name: "Comfort Plus Slides",
        price: "Rs. 2,900",
        originalPrice: "Rs. 3,400",
        image: "/comfort-plus-slides.png",
        badge: "Limited",
        rating: 4.5,
        reviews: 156,
      },
      {
        id: 13,
        name: "Athletic Style Slides",
        price: "Rs. 3,200",
        originalPrice: "Rs. 3,800",
        image: "/athletic-style-slides.png",
        rating: 4.4,
        reviews: 98,
      },
    ],
  },
  mules: {
    name: "Fashion Mules",
    description: "Trendy backless sophistication with contemporary styling",
    heroImage: "/fashion-mule-shoes-collection.png",
    products: [
      {
        id: 14,
        name: "Pointed Toe Mules",
        price: "Rs. 4,500",
        originalPrice: "Rs. 5,200",
        image: "/pointed-toe-mules.png",
        rating: 4.7,
        reviews: 87,
      },
      {
        id: 15,
        name: "Block Heel Mules",
        price: "Rs. 3,900",
        originalPrice: "Rs. 4,500",
        image: "/block-heel-mules.png",
        badge: "Popular",
        rating: 4.6,
        reviews: 123,
      },
    ],
  },
  flats: {
    name: "Ballet Flats",
    description: "Classic comfort meets timeless style with flexible soles and elegant silhouettes",
    heroImage: "/ballet-flats-shoes-collection.png",
    products: [
      {
        id: 16,
        name: "Classic Ballet Flats",
        price: "Rs. 3,400",
        originalPrice: "Rs. 3,900",
        image: "/classic-ballet-flats.png",
        rating: 4.5,
        reviews: 167,
      },
      {
        id: 17,
        name: "Pointed Toe Flats",
        price: "Rs. 3,800",
        originalPrice: "Rs. 4,300",
        image: "/pointed-toe-flats.png",
        badge: "Elegant",
        rating: 4.7,
        reviews: 94,
      },
    ],
  },
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [sortBy, setSortBy] = useState("featured")
  const category = categoryData[params.id]

  if (!category) {
    return <div>Category not found</div>
  }

  const sortedProducts = [...category.products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return Number.parseInt(a.price.replace(/[^\d]/g, "")) - Number.parseInt(b.price.replace(/[^\d]/g, ""))
      case "price-high":
        return Number.parseInt(b.price.replace(/[^\d]/g, "")) - Number.parseInt(a.price.replace(/[^\d]/g, ""))
      case "rating":
        return b.rating - a.rating
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50 to-stone-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={category.heroImage || "/placeholder.svg"}
            alt={category.name}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-50/80 via-amber-50/60 to-stone-100/80" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black mb-6">
            <span className="text-stone-700">{category.name.split(" ")[0]}</span>
            <span className="text-amber-800"> {category.name.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="text-stone-600 text-xl max-w-3xl mx-auto leading-relaxed mb-8">{category.description}</p>
          <div className="text-amber-800 font-medium">{category.products.length} Products Available</div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Sort Controls */}
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-bold text-stone-800">All Products</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/70 backdrop-blur-md border border-white/50 rounded-full px-4 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-800/50"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="bg-white/65 backdrop-blur-lg border border-white/50 shadow-xl shadow-stone-200/60 rounded-3xl p-6 hover:scale-105 hover:bg-white/75 hover:shadow-2xl hover:shadow-stone-300/70 transition-all duration-700 relative overflow-hidden">
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-amber-800/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-white/30 relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-stone-800 text-lg group-hover:text-amber-800 transition-colors duration-300 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-current" : "fill-gray-300"}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-stone-500 text-sm">({product.reviews})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-amber-800 font-bold text-xl">{product.price}</span>
                      <span className="text-stone-400 line-through text-sm">{product.originalPrice}</span>
                    </div>

                    <div className="pt-4">
                      <Link href={`/product/${product.id}`}>
                        <button className="w-full bg-white/70 backdrop-blur-md border border-white/50 shadow-lg shadow-stone-200/50 px-6 py-3 rounded-full text-stone-700 font-medium hover:scale-105 hover:bg-white/80 hover:shadow-xl hover:shadow-stone-300/60 transition-all duration-500 group/btn">
                          <span className="flex items-center justify-center gap-2">
                            View Details
                            <svg
                              className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Back to Categories */}
          <div className="text-center mt-16">
            <Link href="/">
              <button className="bg-white/70 backdrop-blur-md border border-white/50 shadow-lg shadow-stone-200/50 px-12 py-4 rounded-full text-stone-700 font-medium text-lg hover:scale-105 hover:bg-white/80 hover:shadow-xl hover:shadow-stone-300/60 transition-all duration-500 group">
                <span className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Back to Categories
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
