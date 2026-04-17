"use client"

import { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"

interface Color {
  id: string
  name: string
  value: string
  available: boolean
}

interface Size {
  id: string
  size: string
  available: boolean
}

interface OrchidColor {
  id: string
  name: string
  value: string
  available: boolean
}

interface ProductSelectorsProps {
  colors: Color[]
  sizes: Size[]
  productId: number
  orchidEnabled?: boolean
  orchidColors?: OrchidColor[]
}

// Orchid flower colors for customization
const DEFAULT_ORCHID_COLORS = [
  { id: "default-purple", name: "Purple Orchid", value: "#8B5CF6", available: true },
  { id: "default-blue", name: "Blue Orchid", value: "#3B82F6", available: true },
  { id: "default-white", name: "White Orchid", value: "#F8FAFC", available: true },
  { id: "default-yellow", name: "Yellow Orchid", value: "#F59E0B", available: true },
  { id: "default-green", name: "Green Orchid", value: "#10B981", available: true },
  { id: "default-orange", name: "Orange Orchid", value: "#F97316", available: true },
]

export function ProductSelectors({ colors, sizes, productId, orchidEnabled, orchidColors }: ProductSelectorsProps) {
  const [selectedColorId, setSelectedColorId] = useState<string>("")
  const [selectedSizeId, setSelectedSizeId] = useState<string>("")
  const [selectedOrchidId, setSelectedOrchidId] = useState<string>("")
  const [showMagicPreview, setShowMagicPreview] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fallback slipper color when none provided by product
  const FALLBACK_COLOR = "#F5F5DC"

  useEffect(() => {
    setMounted(true)
  }, [])

  // Deduplicate colors by value
  const uniqueColors = useMemo(() => {
    if (!Array.isArray(colors)) return []
    const colorMap = new Map()
    colors.forEach(c => {
      if (c.value && !colorMap.has(c.value)) {
        const colorWithId = { ...c, id: `color-${c.value}` }
        colorMap.set(c.value, colorWithId)
      }
    })
    return Array.from(colorMap.values())
  }, [colors])

  // Deduplicate sizes by size
  const uniqueSizes = useMemo(() => {
    if (!Array.isArray(sizes)) return []
    const sizeMap = new Map()
    sizes.forEach(s => {
      if (s.size && !sizeMap.has(s.size)) {
        const sizeWithId = { ...s, id: `size-${s.size}` }
        sizeMap.set(s.size, sizeWithId)
      }
    })
    return Array.from(sizeMap.values())
  }, [sizes])

  // Resolve orchid palette: prefer backend-provided list when enabled; fallback to defaults
  const orchidPalette = useMemo(() => {
    if (orchidEnabled && Array.isArray(orchidColors) && orchidColors.length > 0) {
      const orchidMap = new Map()
      orchidColors.forEach(o => {
        if (o.value && !orchidMap.has(o.value)) {
          const orchidWithId = { ...o, id: `orchid-${o.value}` }
          orchidMap.set(o.value, orchidWithId)
        }
      })
      return Array.from(orchidMap.values())
    }
    return DEFAULT_ORCHID_COLORS
  }, [orchidEnabled, orchidColors])

  // No auto-select for color; user must choose
  useEffect(() => {
    setSelectedColorId("")
  }, [uniqueColors])

  // Find selected objects by id
  const selectedColorObj = useMemo(() => colors.find(c => c.id === selectedColorId), [colors, selectedColorId])
  const selectedSizeObj = useMemo(() => sizes.find(s => s.id === selectedSizeId), [sizes, selectedSizeId])
  const selectedOrchidObj = useMemo(() => orchidPalette.find(o => o.id === selectedOrchidId), [orchidPalette, selectedOrchidId])

  const handleMagicPreview = () => {
    setIsAnimating(true)
    setShowMagicPreview(true)

    // Animation duration: 3 seconds
    setTimeout(() => {
      setIsAnimating(false)
    }, 3000)
  }

  const closeMagicPreview = () => {
    setShowMagicPreview(false)
    setIsAnimating(false)
  }

  const MagicOverlay = () => {
    if (!mounted || !showMagicPreview) return null

    return createPortal(
      <div
        className="fixed inset-0 w-screen h-screen backdrop-blur-md bg-black/20"
        style={{
          zIndex: 2147483647, // Maximum z-index value
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
        }}
      >
        {isAnimating ? (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden w-full h-full">
            <div className="absolute inset-0 w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-indigo-500/30 animate-pulse" />
              <div
                className="absolute inset-0 bg-gradient-to-l from-pink-500/20 via-purple-500/20 to-blue-500/20 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-indigo-500/25 via-purple-500/25 to-pink-500/25 animate-pulse"
                style={{ animationDelay: "1s" }}
              />

              {[...Array(15)].map((_, i) => (
                <div
                  key={`color-particle-${i}`}
                  className="absolute rounded-full animate-float opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${20 + Math.random() * 40}px`,
                    height: `${20 + Math.random() * 40}px`,
                    background: `radial-gradient(circle, ${["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#F97316"][Math.floor(Math.random() * 5)]}40, transparent)`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${4 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="w-32 h-32 border-2 border-white/40 rounded-full animate-spin-slow">
                <div
                  className="absolute inset-4 border-2 border-white/20 rounded-full animate-spin"
                  style={{ animationDirection: "reverse" }}
                />
              </div>
            </div>

            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center z-10">
              <div className="text-2xl font-light text-white/80 animate-pulse">Creating your magic...</div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl p-12 max-w-2xl w-full shadow-2xl animate-[zoomIn_0.6s_ease-out]">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">Your Customized Slipper</h2>

                <div className="relative w-80 h-60 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-lg">
                <div
                className="w-64 h-40 rounded-full shadow-xl transform rotate-12 border-4 border-white"
                style={{
                background: `linear-gradient(135deg, ${selectedColorObj?.value || FALLBACK_COLOR}, ${(selectedColorObj?.value || FALLBACK_COLOR)}dd)`,
                }}
                />

                  <div className="absolute top-16 right-20 transform -rotate-12">
                    <div
                      className="w-12 h-12 rounded-full shadow-lg border-2 border-white flex items-center justify-center"
                      style={{ backgroundColor: selectedOrchidObj?.value }}
                    >
                      <span className="text-white text-xl">🌺</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-6 text-center">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600">Size</div>
                    <div className="text-xl font-bold text-gray-800">{selectedSizeObj?.size}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600">Slipper Color</div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: selectedColorObj?.value || FALLBACK_COLOR }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600">Orchid Color</div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: selectedOrchidObj?.value }}
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {selectedOrchidObj?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={closeMagicPreview}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>,
      document.body,
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl p-8 shadow-xl space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-stone-800 text-xl">Select Slipper Color</h3>
          {selectedColorId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedColorId("")}
              className="text-stone-600 hover:text-amber-600"
            >
              Clear
            </Button>
          )}
        </div>
        {uniqueColors.length > 0 ? (
          <RadioGroup value={selectedColorId} onValueChange={setSelectedColorId} className="grid grid-cols-4 gap-3">
            {uniqueColors.map((c) => (
              <div key={c.id} className="flex items-center">
                <RadioGroupItem value={c.id} id={`color-${c.id}`} disabled={!c.available} className="sr-only" />
                <label
                  htmlFor={`color-${c.id}`}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer w-full
                    ${selectedColorId === c.id
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : c.available
                        ? "border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50 text-stone-700"
                        : "border-stone-100 bg-stone-50 text-stone-400 cursor-not-allowed opacity-50"
                    }
                  `}
                >
                  <span
                    className="w-8 h-8 rounded-full border-2 border-white"
                    style={{ backgroundColor: c.value }}
                  />
                  <span className="text-sm font-medium text-stone-700 truncate">{c.name}</span>
                </label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full border-4 border-stone-300 shadow-lg"
              style={{ backgroundColor: FALLBACK_COLOR }}
            />
            <span className="text-stone-700 font-medium">Beige</span>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-stone-800 text-xl">Select Size</h3>
          {selectedSizeId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSizeId("")}
              className="text-stone-600 hover:text-amber-600"
            >
              Clear
            </Button>
          )}
        </div>
        <RadioGroup value={selectedSizeId} onValueChange={setSelectedSizeId} className="grid grid-cols-4 gap-2">
          {uniqueSizes.map((size) => (
            <div key={size.id} className="flex items-center">
              <RadioGroupItem value={size.id} id={`size-${size.id}`} disabled={!size.available} className="sr-only" />
              <label
                htmlFor={`size-${size.id}`}
                className={`
                  p-3 rounded-lg border-2 font-semibold transition-all duration-200 cursor-pointer w-full text-center
                  ${selectedSizeId === size.id
                    ? "border-amber-500 bg-amber-50 text-amber-700 scale-105"
                    : size.available
                      ? "border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50 text-stone-700"
                      : "border-stone-100 bg-stone-50 text-stone-400 cursor-not-allowed opacity-50"
                  }
                `}
              >
                {size.size}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {selectedSizeId && (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-stone-800 text-xl">Choose Orchid Flower Color</h3>
            {selectedOrchidId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrchidId("")}
                className="text-stone-600 hover:text-amber-600"
              >
                Clear
              </Button>
            )}
          </div>
          <RadioGroup value={selectedOrchidId} onValueChange={setSelectedOrchidId} className="grid grid-cols-3 gap-3">
            {orchidPalette.map((orchid) => (
              <div key={orchid.id} className="flex flex-col items-center">
                <RadioGroupItem value={orchid.id} id={`orchid-${orchid.id}`} disabled={!orchid.available} className="sr-only" />
                <label
                  htmlFor={`orchid-${orchid.id}`}
                  className={`
                    h-16 p-2 flex flex-col items-center gap-1 rounded-lg border-2 transition-all duration-200 cursor-pointer w-full
                    ${selectedOrchidId === orchid.id
                      ? "border-amber-500 bg-amber-50 scale-105"
                      : orchid.available
                        ? "border-stone-200 hover:border-amber-300 hover:bg-amber-50"
                        : "border-stone-100 bg-stone-50 cursor-not-allowed opacity-50"
                    }
                  `}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: orchid.value }}
                  />
                  <span className="text-xs font-medium text-stone-600 text-center">{orchid.name}</span>
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {selectedSizeId && selectedOrchidId && (
        <div className="animate-fadeIn">
          <Button
            onClick={handleMagicPreview}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-xl transform transition-all duration-200 hover:scale-105"
          >
            ✨ Magic Preview ✨
          </Button>
        </div>
      )}

      <MagicOverlay />

      {selectedSizeId && (
        <div className="pt-4 border-t border-stone-200">
          <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg">
            Add to Cart - Size {selectedSizeObj?.size}
            {selectedColorId && <span className="ml-2">• Color {selectedColorObj?.name}</span>}
            {selectedOrchidId && (
              <span className="ml-2">• Orchid {selectedOrchidObj?.name}</span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
