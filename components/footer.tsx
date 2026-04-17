"use client"

import { useState } from "react"
import Link from "next/link"
import { Facebook, Instagram, CreditCard } from "lucide-react"

import { API_BASE_URL } from "@/lib/api-config"

const API_BASE = API_BASE_URL

export function Footer() {
  const [emailFocused, setEmailFocused] = useState(false)
  const [email, setEmail] = useState("")
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      setSubscribeMessage({ type: "error", text: "Please enter your email." })
      return
    }
    setSubscribeMessage(null)
    setSubscribeLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubscribeMessage({ type: "error", text: data.error || "Subscription failed. Please try again." })
        return
      }
      setSubscribeMessage({ type: "success", text: "You're in! Check your inbox for 10% off." })
      setEmail("")
    } catch {
      setSubscribeMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setSubscribeLoading(false)
    }
  }

  const shopLinks = [
    { href: "/new-arrivals", label: "New Arrivals" },
    { href: "/best-sellers", label: "Best Sellers" },
    { href: "/everyday-slides", label: "Everyday Slides" },
    { href: "/wedges", label: "Wedges" },
    { href: "/collections", label: "Collections" },
  ]

  const supportLinks = [
    { href: "/size-guide", label: "Size Guide", highlight: true },
    { href: "/returns", label: "Returns & Exchanges" },
    { href: "/shipping", label: "Shipping Policy" },
    { href: "/track-order", label: "Track Order" },
    { href: "/faqs", label: "FAQs" },
  ]

  return (
    <footer className="relative bg-white/30 backdrop-blur-2xl border-t border-white/50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] text-stone-800 pt-16 overflow-hidden z-10">
      
      {/* Decorative Liquid Background Blobs for Glass Effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-pink-100/40 rounded-full blur-3xl opacity-60 animate-pulse mix-blend-multiply" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-[#F4E8E5]/50 rounded-full blur-3xl opacity-60 animate-pulse mix-blend-multiply" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid - Modified for Mobile 2-Column layout for middle items */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-12 gap-y-12 mb-16">
          
          {/* Column 1: Brand - Spans full width on mobile, half on tablet, quarter on desktop */}
          <div className="flex flex-col group col-span-2 md:col-span-1 lg:col-span-1">
            <Link href="/" className="inline-block mb-4 transition-transform duration-500 ease-out hover:scale-105 origin-left">
              {/* Changed text-3xl to text-4xl here */}
              <h2 className="text-4xl font-serif font-light tracking-widest text-stone-900 uppercase drop-shadow-sm">
                Evora
              </h2>
            </Link>
            <p className="text-stone-500 text-sm leading-relaxed max-w-xs transition-colors duration-500 group-hover:text-stone-700">
              Step into elegance with our handcrafted footwear.
            </p>
          </div>

          {/* Column 2: Shop Navigation - Takes 1 column on mobile (50%) */}
          <div className="col-span-1">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-6 drop-shadow-sm">Shop</h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group relative inline-flex items-center text-sm text-stone-500 transition-all duration-300 ease-out hover:text-[#c48d81] hover:translate-x-1"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#c48d81] transition-all duration-500 ease-out group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care - Takes 1 column on mobile (50%) */}
          <div className="col-span-1">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-6 drop-shadow-sm">Help & Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`group relative inline-flex items-center text-sm transition-all duration-300 ease-out hover:translate-x-1 ${
                      link.highlight 
                        ? "text-stone-800 font-medium hover:text-[#c48d81]" 
                        : "text-stone-500 hover:text-[#c48d81]"
                    }`}
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#c48d81] transition-all duration-500 ease-out group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Interactive / Newsletter - Spans full width on mobile, half on tablet, quarter on desktop */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-6 drop-shadow-sm">Join the Evora Tribe</h4>
            <form className="flex flex-col gap-4 mb-8" onSubmit={handleSubscribe}>
              <div className="relative w-full group">
                <input
                  type="email"
                  placeholder="Enter your email for 10% off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  disabled={subscribeLoading}
                  className={`w-full py-3 px-4 text-sm outline-none transition-all duration-500 rounded-xl shadow-sm ${
                    emailFocused 
                      ? 'bg-white border-[#86868b] text-[#1d1d1f] shadow-[0_0_15px_rgba(134,134,139,0.15)] ring-1 ring-[#86868b]' 
                      : 'bg-[#F5F5F7] border border-[#D2D2D7] text-[#1d1d1f] hover:border-[#86868b]'
                  } placeholder:text-[#86868b] disabled:opacity-70`}
                />
              </div>
              <button
                type="submit"
                disabled={subscribeLoading}
                className="w-full py-3 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-sm font-medium tracking-wide rounded-xl shadow-sm border border-[#D2D2D7] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                {subscribeLoading ? "Subscribing..." : "Subscribe"}
              </button>
              {subscribeMessage && (
                <p className={`text-xs ${subscribeMessage.type === "success" ? "text-stone-600" : "text-red-600"}`}>
                  {subscribeMessage.text}
                </p>
              )}
            </form>

            {/* Social Icons - Apple Style Light Ash */}
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="p-2 rounded-full bg-[#F5F5F7] border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#E8E8ED] hover:text-black transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
                <Instagram className="h-4 w-4 stroke-[1.5]" />
              </a>
              <a href="#" aria-label="TikTok" className="p-2 rounded-full bg-[#F5F5F7] border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#E8E8ED] hover:text-black transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.34-2.14.23-4.4 1.51-6.08 1.19-1.57 3.05-2.62 5.01-2.92.01 1.47 0 2.93.01 4.4-.87.16-1.74.55-2.38 1.19-.88.89-1.22 2.22-1.01 3.47.16 1.05.78 2.01 1.68 2.58.97.62 2.23.77 3.32.42 1.56-.47 2.66-1.92 2.78-3.53.07-5.95.03-11.89.03-17.84z"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="p-2 rounded-full bg-[#F5F5F7] border border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#E8E8ED] hover:text-black transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
                <Facebook className="h-4 w-4 stroke-[1.5]" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Strip - Glassy Version */}
      <div className="border-t border-white/40 bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Payment Icons (Apple Style Solid Ash Cards) */}
            <div className="flex items-center gap-3 text-stone-500">
              <CreditCard className="h-5 w-5 stroke-[1.5] transition-transform duration-500 hover:scale-110" />
              <div className="h-6 flex items-center bg-[#F5F5F7] border border-[#D2D2D7] text-[#1D1D1F] shadow-sm rounded-md px-2.5 text-[10px] font-bold tracking-wider hover:bg-[#E8E8ED] transition-colors duration-300 cursor-default">
                VISA
              </div>
              <div className="h-6 flex items-center bg-[#F5F5F7] border border-[#D2D2D7] text-[#1D1D1F] shadow-sm rounded-md px-2.5 text-[10px] font-bold tracking-wider hover:bg-[#E8E8ED] transition-colors duration-300 cursor-default">
                MC
              </div>
              <div className="h-6 flex items-center bg-[#F5F5F7] border border-[#D2D2D7] text-[#1D1D1F] shadow-sm rounded-md px-2.5 text-[10px] font-bold tracking-wider hover:bg-[#E8E8ED] transition-colors duration-300 cursor-default">
                KOKO
              </div>
            </div>

            {/* Copyright */}
            <p className="text-stone-400 text-xs tracking-wide">
              © {new Date().getFullYear()} Evora. Designed in Sri Lanka.
            </p>
          </div>
        </div>
      </div>
      
    </footer>
  )
}