"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

export function DealsOfTheMonthSection() {
  const [scrollY, setScrollY] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        
        // Calculate scroll progress (0 to 1)
        // When section enters viewport, start scaling
        const scrollProgress = Math.max(0, Math.min(1, 
          (windowHeight - rect.top) / (windowHeight + rect.height)
        ))
        
        setScrollY(scrollProgress)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate scale based on scroll progress
  // Scale from 0.8 to 1.2 as user scrolls down
  const scale = 0.8 + (scrollY * 0.4)
  
  // Calculate opacity based on scroll progress
  const opacity = Math.min(1, scrollY * 2)

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 md:py-32 px-4 overflow-hidden bg-gradient-to-b from-stone-100 via-amber-50 to-stone-100"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-amber-400/15 via-amber-600/10 to-transparent rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-stone-400/15 via-stone-600/10 to-transparent rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-stone-800 via-amber-700 to-stone-800 bg-clip-text text-transparent">
              Deals Of The Month
            </span>
          </h2>
          <p className="text-stone-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover our exclusive monthly offers and limited-time deals on premium footwear
          </p>
        </div>

        {/* Main Image Container with Scroll Animation */}
        <div className="relative">
          <div 
            className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-white/90 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] mx-auto max-w-5xl"
            style={{
              transform: `scale(${scale})`,
              opacity: opacity,
              transition: 'transform 0.1s ease-out, opacity 0.3s ease-out'
            }}
          >
            {/* Main Deal Image */}
            <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50">
              <Image
                src="/designer-heels-offer.png"
                alt="Deals of the Month - Premium Footwear Collection"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-end p-8 md:p-12">
                <div className="text-white">
                  <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse">
                    🔥 Limited Time Offer
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
                    Up to 50% Off
                  </h3>
                  <p className="text-lg md:text-xl opacity-90 mb-6 max-w-2xl">
                    Premium footwear collection with exclusive discounts. Don't miss out on these amazing deals!
                  </p>
                  <button className="bg-white text-stone-800 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform">
                    Shop Now
                  </button>
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 hover:translate-x-full transition-all duration-1000 ease-out"></div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-amber-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-stone-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 -right-12 w-8 h-8 bg-red-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚚</span>
            </div>
            <h4 className="text-xl font-semibold text-stone-800 mb-2">Free Shipping</h4>
            <p className="text-stone-600">On orders over $100</p>
          </div>
          
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">↩️</span>
            </div>
            <h4 className="text-xl font-semibold text-stone-800 mb-2">Easy Returns</h4>
            <p className="text-stone-600">30-day return policy</p>
          </div>
          
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h4 className="text-xl font-semibold text-stone-800 mb-2">Premium Quality</h4>
            <p className="text-stone-600">Handcrafted excellence</p>
          </div>
        </div>
      </div>
    </section>
  )
}
