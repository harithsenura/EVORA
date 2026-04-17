"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Grid3X3, List, Search, Heart, Share2, Download, ZoomIn, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const galleryImages = [
  {
    id: 1,
    title: "Elegant Comfort Slippers",
    category: "comfort",
    image: "/elegant-beige-comfort-house-slippers-with-soft-pad.png",
    description: "Luxurious comfort slippers with premium materials",
  },
  {
    id: 2,
    title: "Designer Heel Sandals",
    category: "heels",
    image: "/sophisticated-black-high-heel-sandals-with-ankle-s.png",
    description: "Sophisticated heel sandals for special occasions",
  },
  {
    id: 3,
    title: "Casual Slide Collection",
    category: "slides",
    image: "/modern-white-leather-slide-sandals-with-gold-accen.png",
    description: "Modern slides perfect for everyday elegance",
  },
  {
    id: 4,
    title: "Premium Mule Designs",
    category: "mules",
    image: "/luxury-brown-leather-mule-slippers-with-decorative.png",
    description: "Premium mules combining style and comfort",
  },
  {
    id: 5,
    title: "Fashion Forward Flats",
    category: "flats",
    image: "/trendy-pointed-toe-ballet-flats-in-nude-color.png",
    description: "Contemporary flats for the modern woman",
  },
  {
    id: 6,
    title: "Evening Elegance",
    category: "heels",
    image: "/glamorous-silver-evening-heels-with-crystal-embell.png",
    description: "Glamorous heels for evening occasions",
  },
  {
    id: 7,
    title: "Cozy House Slippers",
    category: "comfort",
    image: "/plush-pink-house-slippers-with-faux-fur-lining.png",
    description: "Ultimate comfort for relaxing at home",
  },
  {
    id: 8,
    title: "Minimalist Slides",
    category: "slides",
    image: "/clean-minimalist-black-leather-slides-with-subtle-.png",
    description: "Clean, minimalist design for effortless style",
  },
  {
    id: 9,
    title: "Vintage Inspired Mules",
    category: "mules",
    image: "/vintage-style-burgundy-velvet-mules-with-low-heel.png",
    description: "Vintage-inspired mules with modern comfort",
  },
  {
    id: 10,
    title: "Athletic Comfort Slides",
    category: "slides",
    image: "/sporty-white-slides-with-cushioned-footbed-and-log.png",
    description: "Athletic-inspired slides for active lifestyles",
  },
  {
    id: 11,
    title: "Luxury Embellished Flats",
    category: "flats",
    image: "/luxury-black-flats-with-pearl-and-crystal-embellis.png",
    description: "Embellished flats for sophisticated occasions",
  },
  {
    id: 12,
    title: "Platform Comfort Sandals",
    category: "heels",
    image: "/comfortable-platform-sandals-in-tan-leather-with-a.png",
    description: "Platform sandals combining height with comfort",
  },
]

const categories = [
  { id: "all", name: "All", count: galleryImages.length },
  { id: "comfort", name: "Comfort", count: galleryImages.filter((img) => img.category === "comfort").length },
  { id: "heels", name: "Heels", count: galleryImages.filter((img) => img.category === "heels").length },
  { id: "slides", name: "Slides", count: galleryImages.filter((img) => img.category === "slides").length },
  { id: "mules", name: "Mules", count: galleryImages.filter((img) => img.category === "mules").length },
  { id: "flats", name: "Flats", count: galleryImages.filter((img) => img.category === "flats").length },
]

export function GallerySection() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [favorites, setFavorites] = useState<number[]>([])
  const [selectedImage, setSelectedImage] = useState<(typeof galleryImages)[0] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredImages = galleryImages.filter((image) => {
    const matchesCategory = selectedCategory === "all" || image.category === selectedCategory
    const matchesSearch =
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFavorite = (imageId: number) => {
    setFavorites((prev) => (prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]))
  }

  return (
    <div className="min-h-screen">
      {/* Floating geometric background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-16 h-16 bg-orange-200/20 rounded-full animate-float"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-12 h-12 bg-purple-200/20 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-40 left-20 w-20 h-20 bg-blue-200/20 rounded-full animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-14 h-14 bg-green-200/20 rounded-full animate-float"
          style={{ animationDelay: "6s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="liquid-glass-subtle">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black mb-4 text-center">
            <span className="text-stone-700">EVORA</span>
            <span className="block text-orange-500">Gallery</span>
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Explore our stunning collection of premium ladies footwear designs
          </p>
        </div>

        {/* Controls */}
        <div className="liquid-glass-subtle rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="liquid-glass-subtle"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "masonry" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("masonry")}
                className="liquid-glass-subtle"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="liquid-glass-subtle"
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white/30 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative liquid-glass-subtle rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className={`${viewMode === "grid" ? "aspect-square" : "aspect-[4/3]"} relative overflow-hidden`}>
                  <Image
                    src={image.image || "/placeholder.svg"}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-sm mb-1">{image.title}</h3>
                      <p className="text-white/80 text-xs">{image.description}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(image.id)
                      }}
                    >
                      <Heart
                        className={`h-4 w-4 ${favorites.includes(image.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ZoomIn className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No images found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="liquid-glass-subtle rounded-2xl overflow-hidden">
              <div className="aspect-square md:aspect-[4/3] relative">
                <Image
                  src={selectedImage.image || "/placeholder.svg"}
                  alt={selectedImage.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-stone-700 mb-2">{selectedImage.title}</h2>
                <p className="text-muted-foreground mb-4">{selectedImage.description}</p>

                <div className="flex gap-2">
                  <Button size="sm" className="liquid-glass-subtle">
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </Button>
                  <Button size="sm" variant="ghost" className="liquid-glass-subtle">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm" variant="ghost" className="liquid-glass-subtle">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
