"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 150)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className="relative min-h-screen flex flex-col">
      <div
        className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-3"
        }`}
        style={{ transitionProperty: "opacity, transform" }}
      >
        {children}
      </div>
    </div>
  )
}
