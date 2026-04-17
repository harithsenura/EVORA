"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { API_BASE_URL, getImageUrl } from "@/lib/api-config"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image?: string
  badge?: string
  category: string
  inStock: boolean
  isLimitedEdition: boolean
  endDate?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const difference = +targetDate - +new Date()
  let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }

  return timeLeft
}

// Helper function to calculate discount percentage
const calculateDiscount = (price: number, originalPrice?: number): string | null => {
  if (!originalPrice || originalPrice <= price) return null
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100)
  return discount > 0 ? `-${discount}%` : null
}

export default function LimitedEditionPage() {
  const [limitedEditionProducts, setLimitedEditionProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [targetDate, setTargetDate] = useState<Date>(new Date())
  const [wishlist, setWishlist] = useState<(string | number)[]>([])

  useEffect(() => {
    const fetchLimitedEditionProducts = async () => {
      try {
        const response = await fetch(`/api/limited-edition?limit=20`)
        if (!response.ok) {
          throw new Error(`Failed to fetch limited edition products: ${response.status}`)
        }
        const data = await response.json()
        const items = Array.isArray(data.products) ? data.products : []
        const mapped: Product[] = items.map((p: any) => ({
          id: p.id || p._id || "",
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          image: (p.images && p.images[0]) || p.image,
          category: p.category,
          inStock: p.stock > 0,
          isLimitedEdition: !!p.isLimitedEdition,
          badge: p.badge,
          endDate: p.endDate,
        }))
        setLimitedEditionProducts(mapped)

        // Set countdown based on first product's endDate
        if (mapped.length > 0 && mapped[0].endDate) {
          const firstProductEndDate = new Date(mapped[0].endDate)
          if (!isNaN(firstProductEndDate.getTime()) && +firstProductEndDate > +new Date()) {
            setTargetDate(firstProductEndDate)
            setTimeLeft(calculateTimeLeft(firstProductEndDate))
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch limited edition products:", error)
        setError(error.message || "Failed to load limited edition products")
      } finally {
        setLoading(false)
      }
    }

    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist))
    }
    
    fetchLimitedEditionProducts()

    // Listen for user login/logout changes
    const handleUserChange = () => {
      const savedWishlist = localStorage.getItem("wishlist")
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist))
      }
    }

    window.addEventListener('userLogin', handleUserChange)
    window.addEventListener('userLogout', handleUserChange)

    return () => {
      window.removeEventListener('userLogin', handleUserChange)
      window.removeEventListener('userLogout', handleUserChange)
    }
  }, [])

  useEffect(() => {
    if (targetDate && +targetDate > +new Date()) {
      const timer = setInterval(() => {
        const newTimeLeft = calculateTimeLeft(targetDate)
        setTimeLeft(newTimeLeft)

        if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [targetDate])

  const toggleWishlist = async (productId: string | number) => {
    try {
      // Get user from localStorage
      const userData = localStorage.getItem("user")
      if (!userData) {
        // Redirect to login page instead of showing alert
        window.location.href = "/login"
        return
      }
      
      const user = JSON.parse(userData)
      const isInWishlist = wishlist.includes(productId)
      
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`${API_BASE_URL}/api/wishlist/${user.id}/remove/${productId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          const updatedWishlist = wishlist.filter((id) => id !== productId)
          setWishlist(updatedWishlist)
          localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
        }
      } else {
        // Add to wishlist
        const response = await fetch(`${API_BASE_URL}/api/wishlist/${user.id}/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        })
        
        if (response.ok) {
          const updatedWishlist = [...wishlist, productId]
          setWishlist(updatedWishlist)
          localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      // Fallback to localStorage only
      const updatedWishlist = wishlist.includes(productId) 
        ? wishlist.filter((id) => id !== productId) 
        : [...wishlist, productId]
      
      setWishlist(updatedWishlist)
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
    }
  }

  const hasTimeLeft = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="h-64 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-red-600 text-lg">{error}. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 font-serif mb-4">
            Limited Edition Collection
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Exclusive deals and limited-time offers. Don't miss out on these special products!
          </p>

          {/* Countdown Timer */}
          {hasTimeLeft && (
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Time Left:</h3>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className="bg-gray-100 border-2 border-gray-200 rounded-lg px-4 py-3 min-w-[70px]">
                    <div className="text-3xl font-bold text-gray-800 font-mono">
                      {String(timeLeft.days).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Days</div>
                </div>
                <div className="text-center">
                  <div className="bg-gray-100 border-2 border-gray-200 rounded-lg px-4 py-3 min-w-[70px]">
                    <div className="text-3xl font-bold text-gray-800 font-mono">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Hr</div>
                </div>
                <div className="text-center">
                  <div className="bg-gray-100 border-2 border-gray-200 rounded-lg px-4 py-3 min-w-[70px]">
                    <div className="text-3xl font-bold text-gray-800 font-mono">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Mins</div>
                </div>
                <div className="text-center">
                  <div className="bg-gray-100 border-2 border-gray-200 rounded-lg px-4 py-3 min-w-[70px]">
                    <div className="text-3xl font-bold text-gray-800 font-mono">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Sec</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {limitedEditionProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {limitedEditionProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <Link href={`/product/${product.id}`}>
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {product.badge}
                      </div>
                    )}

                    {/* Discount Badge */}
                    {calculateDiscount(product.price, product.originalPrice) && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {calculateDiscount(product.price, product.originalPrice)}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <div className="text-sm text-gray-600 mb-1">{product.category}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        ${product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleWishlist(product.id)
                      }}
                      className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${
                        wishlist.includes(product.id) ? "bg-red-50" : ""
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                    </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/product/${product.id}`} className="flex-1">
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    </Link>
                    <Button className="flex-1" disabled={!product.inStock}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No limited edition products available at the moment. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
