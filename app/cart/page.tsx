"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { getImageUrl } from "@/lib/api-config"

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    setIsLoggedIn(!!userData)
  }, [])

  const normalizePrice = (price: number): number => {
    // If price is less than 1, it's likely stored incorrectly (e.g., 0.109 instead of 1090)
    // Multiply by 10000 to get the correct price
    if (price < 1) {
      return price * 10000
    }
    return price
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    console.log("Quantity change clicked:", { id, newQuantity })
    // Validate quantity
    const validQuantity = Math.max(1, Math.min(100, newQuantity))

    if (validQuantity < 1) {
      removeFromCart(id)
    } else {
      updateQuantity(id, validQuantity)
    }
  }

  const handleCheckout = () => {
    setIsLoading(true)
    // Redirect to checkout page
    window.location.href = "/checkout"
  }

  const getCorrectedTotalPrice = (): number => {
    return cartItems.reduce((total, item) => {
      const correctedPrice = normalizePrice(item.price)
      return total + correctedPrice * item.quantity
    }, 0)
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <ShoppingBag className="w-24 h-24 text-stone-300 mx-auto mb-6" />
              <h1 className="text-3xl font-serif font-bold text-stone-800 mb-4">
                {isLoggedIn ? "Your Cart is Empty" : "Please Login to View Cart"}
              </h1>
              <p className="text-stone-600 mb-8 max-w-md mx-auto">
                {isLoggedIn
                  ? "Looks like you haven't added any items to your cart yet. Start shopping to fill it up!"
                  : "You need to be logged in to view and manage your cart items."}
              </p>
              {isLoggedIn ? (
                <Link href="/products">
                  <Button className="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all">
                    Start Shopping
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all">
                    Login to Continue
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/products"
              className="liquid-glass-subtle p-3 rounded-full hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-stone-700" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-800">
                Shopping <span className="text-amber-800">Cart</span>
              </h1>
              <p className="text-stone-600 mt-1">{getTotalItems()} items in your cart</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const displayPrice = normalizePrice(item.price)
                const displayOriginalPrice = item.originalPrice ? normalizePrice(item.originalPrice) : null

                return (
                  <div key={item.id} className="liquid-glass-subtle p-6 rounded-2xl">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-stone-800 mb-1 line-clamp-2">{item.name}</h3>
                        <p className="text-stone-600 text-sm mb-2">{item.category}</p>

                        {(item.sizeLabel ?? item.size) && (
                          <p className="text-stone-600 text-sm mb-1 font-medium">Size: {item.sizeLabel ?? item.size}</p>
                        )}
                        {(item.colorLabel ?? item.color) && (
                          <p className="text-stone-600 text-sm mb-1 font-medium">Color: {item.colorLabel ?? item.color}</p>
                        )}
                        {item.orchidColor && <p className="text-stone-600 text-sm mb-2">Orchid: {item.orchidColor}</p>}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-stone-900">Rs. {displayPrice.toFixed(2)}</span>
                            {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                              <span className="text-sm text-stone-400 line-through">
                                Rs. {displayOriginalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md"
                              >
                                <Minus className="w-4 h-4 text-stone-600 transition-transform duration-200" />
                              </button>
                              <span className="w-8 text-center font-medium text-stone-800 transition-all duration-200">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md"
                              >
                                <Plus className="w-4 h-4 text-stone-600 transition-transform duration-200" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => {
                                console.log("Delete button clicked:", item.id)
                                removeFromCart(item.id)
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md group"
                            >
                              <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="liquid-glass-subtle p-6 rounded-2xl sticky top-32">
                <h2 className="text-xl font-serif font-bold text-stone-800 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-medium text-stone-800">Rs. {getCorrectedTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-amber-800 to-amber-900 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Proceed to Checkout"}
                  </Button>

                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="w-full border-stone-300 text-stone-700 hover:bg-stone-50 bg-transparent"
                  >
                    Clear Cart
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-stone-200">
                  <p className="text-sm text-stone-600 text-center">Secure checkout with SSL encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
