"use client"

import React, { useState, useEffect, useRef } from "react"
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingCart, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const leftImages = ["/r1.jpg", "/HR.jpg"]
const topImages = ["/tt12.jpg"]
const rightImages = ["/rt1.jpeg", "/HLL.jpg"]

// --- AnimatedImageSlot ---
const AnimatedImageSlot = ({
  images,
  className,
  slotId,
  onImageChange,
}: {
  images: string[]
  className?: string
  slotId: string
  onImageChange: (slotId: string, index: number) => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const prevIndexRef = useRef(0)

  useEffect(() => {
    const handleImageChange = (event: CustomEvent) => {
      const { slotId: eventSlotId, index } = event.detail
      if (eventSlotId === slotId) {
        const prevIndex = currentIndex
        prevIndexRef.current = prevIndex
        setCurrentIndex(index)
      }
    }

    window.addEventListener("imageChange", handleImageChange as EventListener)
    return () => window.removeEventListener("imageChange", handleImageChange as EventListener)
  }, [slotId, currentIndex])

  useEffect(() => {
    if (slotId === "top") return
    const currentImage = imagesRef.current[currentIndex]
    if (currentImage) {
      gsap.set(currentImage, {
        opacity: 0,
        scale: 1.02,
      })

      gsap.to(currentImage, {
        opacity: 1,
        scale: 1,
        duration: 4.5,
        ease: "power2.inOut",
      })
    }

    const prevImage = imagesRef.current[prevIndexRef.current]
    if (prevImage && prevIndexRef.current !== currentIndex) {
      gsap.to(prevImage, {
        opacity: 0,
        scale: 0.99,
        duration: 4.5,
        ease: "power2.inOut",
      })
    }
  }, [currentIndex, slotId])

  useEffect(() => {
    if (slotId === "top") return
    const currentImage = imagesRef.current[currentIndex]
    if (currentImage) {
      const timeline = gsap.timeline({ repeat: -1, yoyo: true })

      timeline.to(
        currentImage,
        {
          x: 4,
          duration: 12,
          ease: "sine.inOut",
        },
        0,
      )

      timeline.to(
        currentImage,
        {
          y: -2,
          duration: 14,
          ease: "sine.inOut",
        },
        0,
      )

      return () => {
        timeline.kill()
      }
    }
  }, [currentIndex, slotId])

  return (
    <div className={`relative overflow-hidden group ${className}`} ref={containerRef}>
      {slotId === "top" ? (
        <img
          ref={(el) => {
            imagesRef.current[0] = el
          }}
          src={images[0] || "/placeholder.svg"}
          alt="Top"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        images.map((src, index) => (
          <img
            key={index}
            ref={(el) => {
              imagesRef.current[index] = el
            }}
            src={src || "/placeholder.svg"}
            alt={`Slide ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ))
      )}

      <div
        className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-15 transition-opacity duration-700"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
        }}
      />
    </div>
  )
}

// --- Reborn section ---
const AnimatedReborn = () => {
  const tips = [
    { text: "Walk in Everyday Luxury", highlight: "Luxury" },
    { text: "Handcrafted for Perfect Fit", highlight: "Perfect" },
    { text: "Ergonomic Soles for Comfort", highlight: "Comfort" },
    { text: "Step into Timeless Elegance", highlight: "Elegance" },
    { text: "Premium Materials & Craftsmanship", highlight: "Premium" }
  ]
  const marqueeItems = [...tips, ...tips, ...tips, ...tips]

  return (
    <div 
      className="w-screen ml-[calc(-50vw+50%)] overflow-hidden relative mt-auto lg:mt-0 animate-fade-in py-5 md:py-4 bg-white/40 backdrop-blur-[24px] border-t border-white/60 shadow-[inset_0_2px_5px_rgba(255,255,255,0.8)]" 
      style={{ animationDelay: "0.5s" }}
    >
      {/* Luxury White Shadow Fades on Left & Right */}
      <div className="absolute inset-y-0 left-0 w-24 md:w-64 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-64 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
      
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        className="flex whitespace-nowrap items-center w-max"
      >
        {marqueeItems.map((item, i) => (
          <div key={i} className="flex items-center">
            <span className="text-xs md:text-sm tracking-[0.25em] uppercase text-stone-600 font-semibold px-10 flex items-center drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              {item.text.split(item.highlight).map((part, idx, arr) => (
                <React.Fragment key={idx}>
                  {part}
                  {idx < arr.length - 1 && (
                    <span className="font-serif italic text-[#D4AF37] lowercase text-lg md:text-xl mx-2.5 tracking-normal drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                      {item.highlight}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </span>
            <Sparkles className="w-4 h-4 text-stone-400 drop-shadow-[0_1px_1px_rgba(255,255,255,1)]" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// --- HeroSection ---
export function HeroSection() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const leftImageRef = useRef<HTMLDivElement>(null)
  const rightImageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (leftImageRef.current) {
      const leftTimeline = gsap.timeline({ repeat: -1, yoyo: true })
      const img = leftImageRef.current.querySelector("img")
      if (img) {
        leftTimeline.to(img, { scale: 1.02, filter: "blur(0.2px)", duration: 7, ease: "sine.inOut" }, 0)
        leftTimeline.to(img, { y: -4, duration: 9, ease: "sine.inOut" }, 0)
      }
    }

    if (rightImageRef.current) {
      const rightTimeline = gsap.timeline({ repeat: -1, yoyo: true })
      const img = rightImageRef.current.querySelector("img")
      if (img) {
        rightTimeline.to(img, { scale: 1.02, filter: "blur(0.2px)", duration: 7.5, ease: "sine.inOut" }, 0)
        rightTimeline.to(img, { y: 4, duration: 10, ease: "sine.inOut" }, 0)
      }
    }
  }, [])

  return (
    <section className="relative min-h-[90vh] lg:min-h-[85vh] bg-white lg:bg-transparent pt-0 lg:pt-25 pb-0 lg:pb-16 px-0 lg:px-20 2xl:px-32 overflow-hidden flex flex-col lg:justify-center">

      {/* ========================================= */}
      {/* --- NEW $500k LUXURY MOBILE VIEW ONLY --- */}
      {/* ========================================= */}
      <div className="absolute inset-0 z-0 lg:hidden flex flex-col justify-end overflow-hidden bg-white">
        
        {/* Background Image Container with Paddings - Added bg-stone-200 to match desktop */}
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-[90px] left-4 right-4 bottom-[76px] rounded-2xl overflow-hidden z-0 bg-stone-200"
        >
          <img
            src="/rt1.jpeg"
            alt="Evora Luxury"
            className="w-full h-full object-cover object-top"
          />
          {/* High-end White Fade Shadow at the bottom (Inside the padded area) */}
          <div className="absolute inset-x-0 bottom-0 h-[65vh] bg-gradient-to-t from-white via-white/85 to-transparent pointer-events-none" />
          
          {/* Mobile Luxury Content (Floating inside the padded image area) */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-12 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* Elegant vertical line divider */}
              <div className="w-[1px] h-10 bg-stone-800/60 mb-6"></div>
              
              {/* Tiny, widely spaced luxury text */}
              <p className="text-[10px] font-medium tracking-[0.4em] uppercase text-stone-800 mb-8 text-center drop-shadow-sm">
                The Essence of Elegance
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              className="w-full max-w-[280px]"
            >
              {/* Minimalist sharp-edge luxury button - Now with slightly curved edges (rounded-xl) */}
              <Button
                size="lg"
                onClick={() => (window.location.href = "/products")}
                className="w-full relative overflow-hidden bg-[#111] text-white py-7 rounded-xl transition-all duration-700 hover:bg-black active:scale-[0.98] shadow-2xl group border border-transparent"
              >
                <span className="relative z-10 text-[10px] tracking-[0.35em] font-light uppercase">Shop Collection</span>
                {/* Sleek light sweep animation on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
        
        {/* --- MOBILE ANIMATED REBORN --- */}
        <div className="absolute bottom-1 left-0 right-0 z-20 block lg:hidden">
          <AnimatedReborn />
        </div>

      </div>
      {/* ========================================= */}


      {/* --- BACKGROUND BLOBS (Desktop Only) --- */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
        <div
          className="blob absolute w-48 h-48 bg-[#F8E4A8] rounded-full mix-blend-multiply filter blur-[95px] opacity-80 bottom-50 left-1/2 -translate-x-1/2"
        />
      </div>

      {/* --- DESKTOP CONTENT CONTAINER --- */}
      <div className="relative z-10 w-full max-w-[1250px] 2xl:max-w-[1600px] mx-auto h-full hidden lg:block">

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] 2xl:grid-cols-[400px_1fr_400px] gap-5 2xl:gap-8 mb-12">
          {/* Left Image */}
          <div
            ref={leftImageRef}
            className="hidden lg:block h-[420px] lg:h-[570px] 2xl:h-[680px] rounded-2xl bg-stone-200 animate-fade-in overflow-hidden group relative will-change-transform"
          >
            <div
              className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-500"
              style={{ backdropFilter: "blur(4px)", background: "rgba(255, 255, 255, 0.15)" }}
            />
            <img src={leftImages[0] || "/placeholder.svg"} alt="Hero left" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)" }}
            />
          </div>

          {/* Center Content Column */}
          <div className="flex flex-col gap-5 2xl:gap-7 lg:pt-0 lg:min-h-auto lg:justify-center">
            {/* Top Image */}
            <AnimatedImageSlot
              images={topImages}
              className="hidden lg:block h-[240px] 2xl:h-[300px] rounded-2xl bg-stone-200 animate-fade-in will-change-transform"
              slotId="top"
              onImageChange={() => { }}
            />

            {/* Main Text Content */}
            <div
              className="flex-1 flex flex-col justify-start lg:justify-center items-center text-center animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <h1 className="text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold text-stone-900 mb-2 tracking-tight leading-none flex flex-col items-center">
                <span className="gold-shine-text whitespace-nowrap">START INTO</span>
                <span className="gold-shine-text">LUXURY</span>
              </h1>
              <p className="text-base 2xl:text-base text-stone-800 lg:text-stone-600 mb-8 2xl:mb-8 font-bold tracking-[0.2em] uppercase ">NEW COLLECTION</p>
              
              {/* Desktop Button - Updated to match Mobile Design */}
              <Button
                size="lg"
                onClick={() => (window.location.href = "/products")}
                className="relative overflow-hidden bg-[#111] text-white px-12 2xl:px-16 py-7 2xl:py-8 rounded-xl transition-all duration-700 hover:bg-black hover:scale-105 active:scale-[0.98] shadow-2xl group border border-transparent"
              >
                <span className="relative z-10 text-xs 2xl:text-sm tracking-[0.35em] font-light uppercase">SHOP COLLECTION</span>
                {/* Sleek light sweep animation on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
              </Button>

            </div>
          </div>

          {/* Right Image */}
          <div
            ref={rightImageRef}
            className="hidden lg:block h-[420px] lg:h-[570px] 2xl:h-[680px] rounded-2xl bg-stone-200 animate-fade-in overflow-hidden group relative will-change-transform"
          >
            <div
              className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-500"
              style={{ backdropFilter: "blur(4px)", background: "rgba(255, 255, 255, 0.15)" }}
            />
            <img src={rightImages[0] || "/placeholder.svg"} alt="Hero right" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)" }}
            />
          </div>
        </div>

        {/* Animated Reborn - Desktop */}
        <AnimatedReborn />
      </div>

      {/* Floating Action Buttons */}
      <div
        className="fixed bottom-8 right-8 flex flex-col gap-4 z-50 animate-fade-in hidden lg:flex"
        style={{ animationDelay: "0.6s" }}
      >
        <button className="w-14 h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110">
          <ShoppingCart className="h-5 w-5" />
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-14 h-14 bg-white hover:bg-stone-50 text-stone-900 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 border-2 border-stone-200"
        >
          <ArrowRight className="h-5 w-5 -rotate-90" />
        </button>
      </div>
    </section>
  )
}