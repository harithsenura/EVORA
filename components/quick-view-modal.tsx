"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"
import { ShoppingCart } from "lucide-react"
import { getImageUrl } from "@/lib/api-config"

interface Product {
  id: number
  name: string
  price: string
  originalPrice?: string
  image: string
  badge: string
  category: string
  inStock: boolean
  rating: number
  isNew: boolean
  popularity: number
}

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const { addToCart } = useCart()

  if (!isOpen || !product) return null

  const handleAddToCart = () => {
    if (!product.inStock) return

    const cartItem = {
      productId: product.id.toString(),
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : Number(product.price),
      originalPrice: product.originalPrice ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice.replace(/[^\d.]/g, '')) : Number(product.originalPrice)) : undefined,
      image: product.image,
      quantity: 1,
      size: selectedSize || undefined,
      category: product.category || "Uncategorized"
    }

    addToCart(cartItem)
    
    // Trigger text vanish and icon swipe animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  const sizes = ["36", "37", "38", "39", "40", "41"]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-800">Quick View</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Badge */}
              <span className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {product.badge}
              </span>

              {/* Title */}
              <h1 className="text-3xl font-bold text-stone-800">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-yellow-500" : "text-yellow-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-stone-600 font-medium">({product.rating})</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-amber-700">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-stone-400 line-through">{product.originalPrice}</span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`font-medium ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Size Selection */}
              {product.inStock && (
                <div>
                  <h3 className="font-semibold text-stone-800 mb-3">Select Size</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                          selectedSize === size
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-stone-200 hover:border-amber-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  className={`w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3 add-to-cart-button flex items-center justify-center gap-2 ${
                    isAnimating ? 'animate-text-vanish-icon-swipe' : ''
                  }`}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{product.inStock ? "Add to Cart" : "Out of Stock"}</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-amber-600 text-amber-600 hover:bg-amber-50 bg-transparent"
                  onClick={() => {
                    window.location.href = `/products/${product.id}`
                  }}
                >
                  View Full Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
