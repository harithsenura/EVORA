"use client"

import { useState } from "react"

export function FastMovingTrends() {
  const [activeTab, setActiveTab] = useState("fast-moving")

  const fastMovingItems = [
    { id: 1, name: "Classic Comfort Slippers", price: "Rs. 2,500", image: "/placeholder.svg?height=200&width=200" },
    { id: 2, name: "Premium Velvet Slides", price: "Rs. 3,200", image: "/placeholder.svg?height=200&width=200" },
    { id: 3, name: "Memory Foam Slippers", price: "Rs. 2,800", image: "/placeholder.svg?height=200&width=200" },
    { id: 4, name: "Silk Touch Mules", price: "Rs. 3,500", image: "/placeholder.svg?height=200&width=200" },
  ]

  const trendingItems = [
    { id: 1, name: "Minimalist Block Heels", price: "Rs. 4,200", image: "/placeholder.svg?height=200&width=200" },
    { id: 2, name: "Strappy Summer Sandals", price: "Rs. 3,800", image: "/placeholder.svg?height=200&width=200" },
    { id: 3, name: "Platform Comfort Wedges", price: "Rs. 4,500", image: "/placeholder.svg?height=200&width=200" },
    { id: 4, name: "Elegant Evening Heels", price: "Rs. 5,200", image: "/placeholder.svg?height=200&width=200" },
  ]

  const currentItems = activeTab === "fast-moving" ? fastMovingItems : trendingItems

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle gradient areas behind cards */}
        <div className="absolute top-32 left-4 right-4 h-96 bg-gradient-to-br from-stone-200/30 via-amber-100/20 to-stone-300/25 rounded-3xl blur-3xl opacity-40"></div>
        <div className="absolute bottom-20 left-8 right-8 h-80 bg-gradient-to-tr from-amber-200/25 via-stone-200/30 to-orange-100/20 rounded-3xl blur-2xl opacity-35"></div>
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
        <div className="absolute top-20 left-10 w-8 h-8 bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg rotate-12 opacity-10 animate-float"></div>
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
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black mb-4">
            <span className="text-stone-700">Fast Moving</span>
            <span className="text-orange-500"> & Trends</span>
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Explore our carefully curated selection of premium footwear
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="liquid-glass-subtle rounded-full p-1">
            <button
              onClick={() => setActiveTab("fast-moving")}
              className={`px-8 py-3 rounded-full transition-all duration-300 ${
                activeTab === "fast-moving"
                  ? "bg-amber-100/80 text-amber-800 shadow-sm"
                  : "text-stone-600 hover:text-stone-800"
              }`}
            >
              Fast Moving
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`px-8 py-3 rounded-full transition-all duration-300 ${
                activeTab === "trends"
                  ? "bg-amber-100/80 text-amber-800 shadow-sm"
                  : "text-stone-600 hover:text-stone-800"
              }`}
            >
              Trends
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {currentItems.map((item, index) => (
            <div key={item.id} className="group cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg shadow-stone-200/50 rounded-2xl p-3 md:p-6 hover:scale-105 hover:bg-white/70 hover:shadow-xl hover:shadow-stone-300/60 transition-all duration-500">
                <div className="aspect-square rounded-xl overflow-hidden mb-2 md:mb-4 bg-white/70">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-medium text-stone-800 mb-1 md:mb-2 group-hover:text-amber-700 transition-colors text-sm md:text-base">
                  {item.name}
                </h3>
                <p className="text-amber-600 font-semibold text-base md:text-lg">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
