"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, X, Trash2, Minus, Plus, Heart, CheckCircle2, XCircle, MessageSquare } from "lucide-react"
import { getImageUrl } from "@/lib/api-config"

type CartItem = any

interface MainCartProps {
  isCartClosing: boolean
  handleCloseCart: () => void
  cartItems: CartItem[]
  removeFromCart: (id: any) => void
  updateQuantity: (id: any, quantity: number) => void
  normalizePrice: (price: number) => number
  getCorrectedTotalPrice: () => number
}

// Ultra-modern one-by-one cascading animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.3 
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 50, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 1.2, 
      ease: [0.22, 1, 0.36, 1] 
    }
  }
}

const headerVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 1.2, 
      ease: [0.22, 1, 0.36, 1],
      delay: 0.1 
    }
  }
}

export function MainCart({
  isCartClosing,
  handleCloseCart,
  cartItems,
  removeFromCart,
  updateQuantity,
  normalizePrice,
  getCorrectedTotalPrice,
}: MainCartProps) {
  const [latestProducts, setLatestProducts] = useState<any[]>([])
  const [localWishlist, setLocalWishlist] = useState<Array<string | number>>([])
  
  // New state for Order Note
  const [orderNote, setOrderNote] = useState("")

  // Fetch the latest 3 products for the backdrop preview (Changed from 4 to 3)
  useEffect(() => {
    async function fetchLatestProducts() {
      try {
        const res = await fetch("/api/products?sortBy=createdAt&sortOrder=desc&limit=3", {
          cache: "no-store"
        })
        if (res.ok) {
          const data = await res.json()
          const items = Array.isArray(data.products) ? data.products.slice(0, 3) : []
          
          const mapped = items.map((p: any) => ({
            id: p.id || p._id,
            name: p.name,
            image: getImageUrl(p.images?.[0]),
            price: `Rs. ${Number(p.price || 0).toLocaleString()}`,
            category: typeof p.category === "string" 
              ? p.category.replace(/-/g, " ").replace(/\b\w/g, (m: string) => m.toUpperCase()) 
              : "Uncategorized",
            inStock: (p.stock ?? 0) > 0,
          }))
          setLatestProducts(mapped)
        }
      } catch (e) {
        console.error("Failed to load latest products:", e)
      }
    }

    if (!isCartClosing) {
      fetchLatestProducts()
    }
  }, [isCartClosing])

  const toggleWishlist = (id: string | number) => {
    setLocalWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Generate a dynamic vertical offset for each card for 3 items
  const getEditorialOffset = (index: number) => {
    switch(index) {
        case 0: return "-translate-y-6 2xl:-translate-y-10";
        case 1: return "translate-y-8 2xl:translate-y-12";
        case 2: return "-translate-y-6 2xl:-translate-y-10";
        default: return "";
    }
  }

  // Helper function to safely extract a CSS background color
  const getDisplayColor = (item: any) => {
    if (item.colorHex || item.colorCode) return item.colorHex || item.colorCode;
    const colorStr = (item.colorLabel || item.color || "").toLowerCase();
    // Try to map common strings to single CSS color values (e.g. "light red" -> "lightcoral" or standard hex)
    if (colorStr.includes("light red")) return "lightcoral";
    return colorStr.replace(" ", "");
  }

  if (!cartItems) return null

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      
      {/* Liquid Glass Backdrop */}
      <div
        className={`absolute inset-0 bg-white/30 backdrop-blur-2xl transition-all duration-[1000ms] ease-[0.16,1,0.3,1] ${
          isCartClosing ? "cart-backdrop-exit opacity-0" : "cart-backdrop-enter opacity-100"
        }`}
      >
        {/* Clickable overlay to close the cart */}
        <div className="absolute inset-0 z-0" onClick={handleCloseCart} />
        
        {/* Products Preview Container - Modern Floating Row Layout */}
        <div className="hidden lg:flex absolute top-0 left-0 bottom-0 w-[calc(100%-28rem)] 2xl:w-[calc(100%-32rem)] flex-col items-center justify-center z-10 pointer-events-none px-8">
          
          {/* Top Left Title for the collection */}
          <motion.div 
            variants={headerVariants} 
            initial="hidden"
            animate={isCartClosing ? "hidden" : "visible"}
            className="absolute top-12 left-12 2xl:top-16 2xl:left-16 text-left"
          >
            <h3 className="text-3xl 2xl:text-4xl font-serif font-bold text-stone-900 tracking-tight">Just Dropped</h3>
            <div className="flex items-center gap-3 mt-3">
               <div className="h-[1px] w-8 bg-stone-400"></div>
               <p className="text-stone-500 text-[10px] 2xl:text-xs tracking-[0.25em] uppercase font-bold">Discover our latest collection</p>
            </div>
          </motion.div>

          {/* Floating Horizontal Cards Container */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isCartClosing ? "hidden" : "visible"}
            className="flex flex-row items-center justify-center gap-6 lg:gap-8 2xl:gap-12 mt-8 pointer-events-auto w-full max-w-[1400px]"
          >
            {latestProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                // Increased width sizes here for the 3 cards
                className={`w-44 lg:w-52 xl:w-64 2xl:w-72 hover:z-20 ${getEditorialOffset(index)}`}
              >
                {/* --- EXACT CARD DESIGN FROM YOUR CODE (UNCHANGED) --- */}
                <div className="group relative flex flex-col">
                  <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-[1.25rem] 2xl:rounded-[1.5rem] bg-white shadow-sm border border-stone-100 group-hover:shadow-2xl transition-all duration-700 ease-[0.25, 0.46, 0.45, 0.94] cursor-pointer">
                    
                    <Link href={`/product/${product.id}`} onClick={handleCloseCart} className="block w-full h-full relative overflow-hidden">
                      <div className="w-full h-full transform transition-transform duration-[600ms] ease-[0.25, 0.46, 0.45, 0.94] group-hover:scale-110">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[600ms] ease-[0.25, 0.46, 0.45, 0.94] z-10" />

                      <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-5 translate-y-4 group-hover:translate-y-0 transition-all duration-[600ms] ease-[0.25, 0.46, 0.45, 0.94] opacity-0 group-hover:opacity-100 hidden md:block">
                          <div className="flex items-center gap-1.5 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-[600ms] ease-[0.25, 0.46, 0.45, 0.94] delay-75">
                              {product.inStock ? (
                                  <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                      <span className="text-green-300 text-[9px] 2xl:text-[10px] font-bold uppercase tracking-wider">In Stock</span>
                                  </>
                              ) : (
                                  <>
                                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                                      <span className="text-red-300 text-[9px] 2xl:text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
                                  </>
                              )}
                          </div>

                          <div className="h-[2px] bg-yellow-400 w-0 group-hover:w-full transition-all duration-[700ms] ease-[0.25, 0.46, 0.45, 0.94] mb-3 2xl:mb-4" />

                          <button
                              className="w-full py-2.5 2xl:py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-xs 2xl:text-sm shadow-lg hover:bg-white/90 hover:text-stone-900 transition-all duration-[400ms] ease-[0.25, 0.46, 0.45, 0.94] flex items-center justify-center gap-2 group/btn relative overflow-hidden transform hover:scale-[1.02]"
                          >
                              <span className="absolute inset-0 bg-white/40 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-[400ms] ease-[0.25, 0.46, 0.45, 0.94]"></span>
                              <ShoppingBag className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                              <span>View Product</span>
                          </button>
                      </div>
                    </Link>

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        toggleWishlist(product.id)
                      }}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 p-2 rounded-full bg-white/80 backdrop-blur-md border border-white/50 text-stone-600 hover:bg-white hover:text-pink-500 transition-all duration-[400ms] ease-[0.25, 0.46, 0.45, 0.94] shadow-sm transform hover:scale-110"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-[400ms] ease-[0.25, 0.46, 0.45, 0.94] ${localWishlist.includes(product.id) ? "fill-pink-500 text-pink-500" : ""}`}
                      />
                    </button>
                  </div>

                  <div className="pt-3 sm:pt-4 text-center group-hover:opacity-50 transition-opacity duration-[600ms] ease-[0.25, 0.46, 0.45, 0.94]">
                      <p className="text-[8px] 2xl:text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium mb-1">
                          {product.category}
                      </p>
                      <h3 className="font-serif font-bold text-[11px] 2xl:text-xs sm:text-sm uppercase text-stone-800 tracking-wide mb-1.5 line-clamp-1">
                          {product.name}
                      </h3>
                      <p className="text-[11px] 2xl:text-xs sm:text-sm text-stone-900 font-medium">
                          {product.price}
                      </p>
                  </div>
                </div>
                {/* --- END EXACT CARD DESIGN --- */}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Modern Cart Panel (Redesigned) */}
      <div
        className={`${
          isCartClosing ? "cart-popup-slide-out" : "cart-popup-slide-in"
        } relative w-full max-w-md 2xl:max-w-[30rem] h-screen bg-white/95 backdrop-blur-2xl transform flex flex-col overflow-hidden border-l border-white/50 z-20 shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 2xl:p-8 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg 2xl:text-xl font-serif font-bold text-stone-900 tracking-wide uppercase">
              Shopping Bag
            </h2>
            <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {cartItems.length}
            </span>
          </div>
          <button
            onClick={handleCloseCart}
            className="text-stone-400 hover:text-stone-900 transition-colors p-2 2xl:p-2.5 hover:bg-stone-50 rounded-full"
          >
            <X className="w-5 h-5 2xl:w-6 2xl:h-6" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 2xl:p-8">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                 <ShoppingBag className="w-8 h-8 2xl:w-10 2xl:h-10 text-stone-300 stroke-[1.5]" />
              </div>
              <h3 className="text-lg 2xl:text-xl font-medium text-stone-800 mb-2">
                Your bag is empty
              </h3>
              <p className="text-stone-400 text-sm 2xl:text-base text-center max-w-[250px]">
                Discover our latest collection and add some luxury to your life.
              </p>
              <button 
                onClick={handleCloseCart}
                className="mt-8 px-8 py-3 bg-stone-900 text-white text-sm font-medium rounded-full uppercase tracking-widest hover:bg-stone-800 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="flex-1 p-6 2xl:p-8 space-y-6 2xl:space-y-8">
              {cartItems.map((item: any) => (
                <div
                  key={item.id}
                  className="group flex gap-5 2xl:gap-6 pb-6 2xl:pb-8 border-b border-stone-100 last:border-0 last:pb-0 relative transition-all"
                >
                  {/* Image */}
                  <div className="w-24 h-32 2xl:w-28 2xl:h-36 flex-shrink-0 overflow-hidden rounded-xl bg-stone-50 relative">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[0.25,0.46,0.45,0.94]"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-sm 2xl:text-base font-bold text-stone-900 uppercase tracking-wider leading-snug line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-300 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 2xl:w-5 2xl:h-5" />
                        </button>
                      </div>
                      
                      {/* Attributes */}
                      <div className="flex flex-col gap-1.5 mt-3">
                        {item.sizeLabel ?? item.size ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] 2xl:text-xs text-stone-500 uppercase tracking-widest">Size</span>
                            <span className="text-xs 2xl:text-sm font-semibold text-stone-800">{item.sizeLabel ?? item.size}</span>
                          </div>
                        ) : null}
                        
                        {/* New Color Display Pattern */}
                        {item.colorLabel ?? item.color ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] 2xl:text-xs text-stone-500 uppercase tracking-widest">Color</span>
                            <div className="flex items-center gap-1.5">
                              {/* Color Swatch Circle */}
                              <div 
                                className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 rounded-full shadow-sm border border-stone-200/60"
                                style={{ backgroundColor: getDisplayColor(item) }}
                              />
                              <span className="text-xs 2xl:text-sm font-semibold text-stone-800">{item.colorLabel ?? item.color}</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center border border-stone-200 rounded-full bg-white shadow-sm overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 2xl:w-9 2xl:h-9 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                        >
                          <Minus className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
                        </button>
                        <span className="text-xs 2xl:text-sm font-semibold w-6 2xl:w-8 text-center text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 2xl:w-9 2xl:h-9 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                        >
                          <Plus className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm 2xl:text-base font-bold text-stone-900 tracking-wide">
                        Rs. {normalizePrice(item.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-stone-100 bg-white/90 backdrop-blur-md z-20 flex flex-col shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
            
            {/* Order Note Section */}
            <div className="px-6 2xl:px-8 py-4 border-b border-stone-100 bg-stone-50/50">
               <div className="flex items-center gap-2 mb-3">
                 <MessageSquare className="w-4 h-4 text-stone-500" />
                 <label htmlFor="order-note" className="text-xs 2xl:text-sm font-semibold text-stone-700 uppercase tracking-wider">
                   Add Order Note
                 </label>
               </div>
               <textarea
                 id="order-note"
                 value={orderNote}
                 onChange={(e) => setOrderNote(e.target.value)}
                 placeholder="Special instructions for delivery..."
                 className="w-full text-xs 2xl:text-sm border border-stone-200 rounded-xl p-3 bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 transition-all resize-none shadow-sm placeholder:text-stone-400"
                 rows={2}
               />
            </div>

            {/* Subtotal & Checkout */}
            <div className="p-6 2xl:p-8">
              <div className="flex justify-between items-end mb-6">
                <div className="flex flex-col">
                   <span className="text-sm 2xl:text-base font-bold text-stone-800 uppercase tracking-widest">
                     Subtotal
                   </span>
                   <span className="text-[10px] 2xl:text-xs text-stone-400 mt-1 uppercase tracking-wider">
                     Shipping & taxes calculated at checkout
                   </span>
                </div>
                <span className="text-xl 2xl:text-2xl font-bold text-stone-900 tracking-tight">
                  Rs. {getCorrectedTotalPrice().toLocaleString()}
                </span>
              </div>
              
              <div className="flex flex-col gap-3">
                <Link href="/checkout" className="w-full">
                  <button
                    onClick={handleCloseCart}
                    className="group relative w-full py-4 2xl:py-5 bg-stone-900 text-white font-medium text-sm 2xl:text-base rounded-xl overflow-hidden transition-all duration-300 uppercase tracking-[0.15em] shadow-lg hover:shadow-stone-900/30 hover:-translate-y-0.5"
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                       Secure Checkout
                    </span>
                  </button>
                </Link>
                <button
                  onClick={handleCloseCart}
                  className="w-full py-3 text-stone-500 font-medium text-xs 2xl:text-sm hover:text-stone-900 transition-colors uppercase tracking-widest underline underline-offset-4 decoration-stone-300 hover:decoration-stone-900"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}