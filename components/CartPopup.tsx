"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/contexts/CartContext"
import { X } from "lucide-react"

export function CartPopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState<any>(null)
  const [popupExiting, setPopupExiting] = useState(false)

  useEffect(() => {
    // Listen for custom events from cart context
    const handleCartAdd = (event: CustomEvent) => {
      setPopupData(event.detail)
      setShowPopup(true)
      setPopupExiting(false)
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        handleClosePopup()
      }, 5000)
    }

    window.addEventListener('cartItemAdded', handleCartAdd as EventListener)
    
    return () => {
      window.removeEventListener('cartItemAdded', handleCartAdd as EventListener)
    }
  }, [])

  const handleClosePopup = () => {
    setPopupExiting(true)
    setTimeout(() => {
      setShowPopup(false)
      setPopupData(null)
      setPopupExiting(false)
    }, 400)
  }

  if (!showPopup || !popupData) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-sm">
      <div className={`add-to-cart-popup ${popupExiting ? 'exit' : ''} liquid-glass-subtle border border-white/30 rounded-2xl shadow-2xl transform`}>
        {/* Header */}
        <div className="popup-content flex items-start gap-4 p-6 pb-4">
          {/* Success Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-green-200/50">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  className="checkmark-path" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-stone-900 mb-1">
              Added to Cart!
            </h3>
            <div className="flex items-center gap-3 mb-2">
              <img 
                src={popupData.image || "/placeholder.svg"} 
                alt={popupData.name}
                className="w-12 h-12 rounded-lg object-cover border border-stone-200/50 backdrop-blur-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-900 truncate">
                  {popupData.name}
                </p>
                <p className="text-sm text-stone-600">
                  {(popupData.sizeLabel ?? popupData.size) && `Size: ${popupData.sizeLabel ?? popupData.size}`}
                  {(popupData.sizeLabel ?? popupData.size) && (popupData.colorLabel ?? popupData.color) && ` • `}
                  {(popupData.colorLabel ?? popupData.color) && `Color: ${popupData.colorLabel ?? popupData.color}`}
                  {(popupData.sizeLabel ?? popupData.size || popupData.colorLabel ?? popupData.color) && popupData.orchidColor && ` • `}
                  {popupData.orchidColor && `Orchid: ${popupData.orchidColor}`}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-stone-900">
                Rs. {popupData.price?.toLocaleString() || popupData.price}
              </span>
              <span className="text-sm text-stone-500">
                Qty: {popupData.quantity}
              </span>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleClosePopup}
            className="flex-shrink-0 text-stone-400 hover:text-stone-600 transition-colors bg-white/20 backdrop-blur-sm rounded-full p-1 hover:bg-white/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Bottom Section with Go to Cart Button */}
        <div className="px-6 pb-6 pt-2 border-t border-white/20">
          <div className="flex gap-3">
            <button
              onClick={handleClosePopup}
              className="flex-1 px-4 py-2.5 text-stone-700 hover:text-stone-900 font-medium transition-colors duration-200 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                // Dispatch custom event to open cart side panel
                window.dispatchEvent(new CustomEvent('openCartPanel'))
                handleClosePopup()
              }}
              className="flex-1 px-4 py-2.5 bg-stone-900/90 backdrop-blur-sm hover:bg-stone-800 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl border border-stone-800/50"
            >
              Go to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}