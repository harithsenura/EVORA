"use client"

import { useState } from "react"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="bg-white/60 backdrop-blur-md border border-white/50 shadow-xl shadow-stone-200/60 rounded-3xl p-6 overflow-hidden">
        <div className="aspect-square rounded-2xl overflow-hidden bg-white/30 relative group">
          <img
            src={images[selectedImage] || "/placeholder.svg"}
            alt={`${productName} - View ${selectedImage + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Image Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md border border-white/50 shadow-lg shadow-stone-200/50 p-3 rounded-full hover:scale-110 hover:bg-white/80 transition-all duration-300 group/btn"
              >
                <svg
                  className="w-5 h-5 text-stone-700 group-hover/btn:-translate-x-0.5 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md border border-white/50 shadow-lg shadow-stone-200/50 p-3 rounded-full hover:scale-110 hover:bg-white/80 transition-all duration-300 group/btn"
              >
                <svg
                  className="w-5 h-5 text-stone-700 group-hover/btn:translate-x-0.5 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                selectedImage === index
                  ? "border-amber-500 shadow-lg shadow-amber-200/50 scale-105"
                  : "border-white/50 hover:border-amber-300 hover:scale-105"
              }`}
            >
              <div className="bg-white/60 backdrop-blur-md h-full relative group">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${productName} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Selected Overlay */}
                {selectedImage === index && (
                  <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                    <div className="bg-amber-500 text-white p-1 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Zoom Hint */}
      <div className="text-center">
        <p className="text-stone-500 text-sm flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
          Hover to zoom
        </p>
      </div>
    </div>
  )
}
