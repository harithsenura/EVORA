import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { Open_Sans } from "next/font/google"
import { CartProvider } from "@/contexts/CartContext"
import { PageTransition } from "@/components/page-transition"
import { SmoothScroll } from "@/components/smooth-scroll"
import { Navigation } from "@/components/navigation"
import { CartPopup } from "@/components/CartPopup"
import { ChatWidget } from "@/components/chat/ChatWidget"
import { ChatProvider } from "@/contexts/ChatContext"
import { Footer } from "@/components/footer"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "EVORA - Luxury Ladies Slippers",
  description: "Step into luxury with EVORA - Premium ladies slippers designed for comfort and crafted for elegance",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} antialiased`}>
      <body className="font-sans">
        <SmoothScroll>
          <div className="relative z-10">
            <ChatProvider>
              <CartProvider>
                <Navigation />
                <PageTransition>
                  {children}
                </PageTransition>
                <Footer />
                <CartPopup />
              </CartProvider>
              <ChatWidget />
            </ChatProvider>
          </div>
        </SmoothScroll>
      </body>
    </html>
  )
}
