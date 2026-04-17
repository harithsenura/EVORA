"use client"

import { useEffect, useRef } from "react"
import Script from "next/script"

declare global {
  interface Window {
    VANTA: any
    THREE: any
  }
}

export function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)
  const scriptsLoaded = useRef({ three: false, vanta: false })

  useEffect(() => {
    console.log("[v0] VantaBackground mounted")
    return () => {
      console.log("[v0] VantaBackground unmounting, destroying effect")
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
      }
    }
  }, [])

  const checkAndInitVanta = () => {
    console.log("[v0] Checking Vanta initialization", {
      hasRef: !!vantaRef.current,
      hasVANTA: !!window.VANTA,
      hasTHREE: !!window.THREE,
      hasEffect: !!vantaEffect.current,
      scriptsLoaded: scriptsLoaded.current,
    })

    if (
      vantaRef.current &&
      window.VANTA &&
      window.THREE &&
      !vantaEffect.current &&
      scriptsLoaded.current.three &&
      scriptsLoaded.current.vanta
    ) {
      console.log("[v0] Initializing Vanta Birds effect")
      try {
        vantaEffect.current = window.VANTA.BIRDS({
          el: vantaRef.current,
          THREE: window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          backgroundColor: 0xfaf9f7,
          colorMode: "variance",
          wingSpan: 32.0,
          quantity: 2.0, // Reduced from 3.0
          birdSize: 1.5,
          speedLimit: 4.0,
          separation: 50.0,
          alignment: 50.0,
          cohesion: 50.0,
        })
        console.log("[v0] Vanta Birds effect initialized successfully", vantaEffect.current)
      } catch (error) {
        console.error("[v0] Error initializing Vanta:", error)
      }
    }
  }

  const handleThreeLoad = () => {
    console.log("[v0] THREE.js loaded")
    scriptsLoaded.current.three = true
    checkAndInitVanta()
  }

  const handleVantaLoad = () => {
    console.log("[v0] Vanta.js loaded")
    scriptsLoaded.current.vanta = true
    checkAndInitVanta()
  }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
        onLoad={handleThreeLoad}
        onError={(e) => console.error("[v0] Error loading THREE.js:", e)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
        strategy="afterInteractive"
        onLoad={handleVantaLoad}
        onError={(e) => console.error("[v0] Error loading Vanta.js:", e)}
      />
      <div
        ref={vantaRef}
        className="fixed inset-0 z-0 pointer-events-none blur-[4px]" // Reduced blur from 7px
        style={{ width: "100vw", height: "100vh", willChange: "transform, filter" }}
      />
    </>
  )
}
