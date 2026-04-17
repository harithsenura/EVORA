import type { Metadata } from "next"
import { GallerySection } from "@/components/gallery-section"

export const metadata: Metadata = {
  title: "Gallery - EVORA",
  description: "Explore our stunning collection of ladies slippers and footwear designs",
}

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      <GallerySection />
    </main>
  )
}
