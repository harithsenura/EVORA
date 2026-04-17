"use client"

import { useEffect, useState, useMemo } from "react"
import { notFound } from 'next/navigation'
import Link from "next/link"
import { ShoppingCart, X, Heart, Instagram, Check, ChevronDown, MapPin, Truck, Ruler } from 'lucide-react'
import { useCart } from "@/contexts/CartContext"
import { API_BASE_URL, getImageUrl } from "@/lib/api-config"

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
  _id?: string
  name: string
  value: string
  available: boolean
  image?: string
}

interface ProductDetails {
  id: string
  name: string
  price: string | number
  originalPrice?: string | number
  description: string
  features: string[]
  images: string[]
  colors: Color[]
  sizes: Size[]
  orchidEnabled?: boolean
  orchidColors?: OrchidColor[]
  badge?: string
  rating?: number
  reviewCount?: number
  category?: string
}

function normalizeApiBase() {
  const raw = API_BASE_URL
  return raw.endsWith("/api") ? raw : `${raw.replace(/\/$/, "")}/api`
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const routeId = params.id

  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedOrchid, setSelectedOrchid] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [buttonClicked, setButtonClicked] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false) // Added for new review design
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false) // Added for new size guide
  const [wishlist, setWishlist] = useState(false)
  const [reviews, setReviews] = useState<{ userName: string; rating: number; comment: string; createdAt?: string }[]>([])
  const [newReview, setNewReview] = useState<{ userName: string; rating: number; comment: string }>({ userName: "", rating: 5, comment: "" })
  const [reviewLoading, setReviewLoading] = useState(false)
  const [similarProducts, setSimilarProducts] = useState<Array<{ id: string; name: string; price: string; originalPrice?: string; image: string; badge: string }>>([])
  const [similarWishlist, setSimilarWishlist] = useState<Set<string>>(new Set())
  const [quantity, setQuantity] = useState(1)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const { addToCart } = useCart()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    setIsLoggedIn(!!userData)
  }, [])

  const handleAddToCart = () => {
    if (!product) return

    // Allow guests to add to cart (stored in local storage via CartContext)

    // Check if size is selected (if sizes are available)
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size")
      return
    }

    // Check if color is selected (if colors are available)
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert("Please select a color")
      return
    }

    // Check if orchid color is selected (if orchid is enabled)
    if (product.orchidEnabled && product.orchidColors && product.orchidColors.length > 0 && !selectedOrchid) {
      alert("Please select an orchid color")
      return
    }

    // Find the selected orchid color name for display
    const selectedOrchidName = selectedOrchid && product.orchidColors?.length 
      ? (product.orchidColors.find(orchid => ((orchid as any)._id || (orchid as any).id || orchid.name) === selectedOrchid)?.name || selectedOrchid) 
      : undefined

    const selectedSizeObj = product.sizes?.find(s => 
      getSizeKey(s) === selectedSize || 
      (s as any)._id === selectedSize || 
      s.size === selectedSize
    )
    const selectedColorObj = product.colors?.find((c, idx) => 
      getColorKey(c, idx) === selectedColor || 
      (c as any)._id === selectedColor || 
      c.name === selectedColor ||
      (c as any).code === selectedColor ||
      (c as any).value === selectedColor
    )

    const sizeLabel = selectedSizeObj?.size ?? selectedSize
    const colorLabel = selectedColorObj?.name ?? selectedColor
    const colorCode = (selectedColorObj as any)?.value ?? (selectedColorObj as any)?.code

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : Number(product.price),
      originalPrice: product.originalPrice ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice.replace(/[^\d.]/g, '')) : Number(product.originalPrice)) : undefined,
      image: getImageUrl(product.images[0]),
      quantity: quantity,
      size: sizeLabel || undefined,
      color: colorLabel || undefined,
      colorCode: colorCode || undefined,
      sizeLabel: sizeLabel || undefined,
      colorLabel: colorLabel || undefined,
      orchidColor: selectedOrchidName,
      category: product.category || "Uncategorized"
    }

    console.log("Product price debug:", { 
      originalPrice: product.price, 
      calculatedPrice: cartItem.price,
      priceType: typeof product.price 
    })
    console.log("Adding to cart:", cartItem)
    addToCart(cartItem)
    
    // Trigger text vanish and icon swipe animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const base = normalizeApiBase()
        let res = await fetch(`/api/product/${routeId}`, { cache: "no-store" })
        // Fallback: if unified endpoint 404 (e.g. backend not updated or product not found), try product-pages then limited-edition
        if (!res.ok && res.status === 404) {
          res = await fetch(`${base}/product-pages/${routeId}`, { cache: "no-store" })
          if (!res.ok) {
            res = await fetch(`${base}/limited-edition/${routeId}`, { cache: "no-store" })
          }
        }
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) setProduct(null)
            return
          }
          throw new Error(`Failed to fetch product: ${res.status}`)
        }
        const data = (await res.json()) as ProductDetails
        if (!cancelled) setProduct(data)
      } catch (e: any) {
        if (!cancelled) setProduct(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    // Load reviews
    ;(async () => {
      try {
        const base = normalizeApiBase()
        const r = await fetch(`${base}/product-pages/${routeId}/reviews`, { cache: "no-store" })
        if (r.ok) {
          const data = await r.json()
          setReviews(Array.isArray(data.reviews) ? data.reviews : [])
        }
      } catch {}
    })()
    
    return () => {
      cancelled = true
    }
  }, [routeId])

  // Load similar products from the same category as the current product
  useEffect(() => {
    if (!product?.id || !product?.category) {
      setSimilarProducts([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch("/api/products?sortBy=createdAt&sortOrder=desc", { cache: "no-store" })
        if (!r.ok || cancelled) return
        const data = await r.json()
        const list = Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : []
        const norm = (s: string) => (s || "").trim().toLowerCase().replace(/-/g, " ")
        const currentCat = norm(product!.category!)
        const sameCategory = list.filter(
          (p: { id?: string; _id?: string; category?: string }) =>
            String(p.id ?? p._id) !== String(product!.id) && norm(p.category || "") === currentCat
        )
        // Shuffle for random selection (Fisher–Yates)
        const shuffled = [...sameCategory]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        const slice = shuffled.slice(0, 4)
        const mapped = slice.map((p: { id?: string; _id?: string; name?: string; price?: number | string; originalPrice?: number | string; images?: string[]; image?: string; category?: string }) => {
          const id = String(p.id ?? p._id ?? "")
          const price = p.price != null ? (typeof p.price === "number" ? `Rs. ${p.price.toLocaleString()}` : String(p.price)) : ""
          const originalPrice = p.originalPrice != null ? (typeof p.originalPrice === "number" ? `Rs. ${p.originalPrice.toLocaleString()}` : String(p.originalPrice)) : undefined
          const humanCat = (p.category || "").replace(/-/g, " ").replace(/\b\w/g, (m: string) => m.toUpperCase())
          return {
            id,
            name: p.name || "Product",
            price,
            originalPrice,
            image: getImageUrl(p.images?.[0] ?? p.image ?? ""),
            badge: humanCat || "PRODUCT",
          }
        })
        if (!cancelled) setSimilarProducts(mapped)
      } catch {
        if (!cancelled) setSimilarProducts([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [product?.id, product?.category])

  // All hooks must run before any conditional return (Rules of Hooks)
  const colors = useMemo(() => {
    if (!product?.colors || !Array.isArray(product.colors)) return []
    const raw = product.colors
    const seen = new Set<string>()
    return raw.filter((c: Color & { code?: string }) => {
      const key = (c.code || (c as { name?: string }).name || "").trim()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [product?.colors])

  const getSizeKey = (size: Size) => (size as { id?: string; _id?: string }).id ?? (size as { _id?: string })._id ?? size.size
  const getColorKey = (color: Color, index: number) => (color as { id?: string; _id?: string }).id ?? (color as { _id?: string })._id ?? (color as { value?: string }).value ?? (color as { code?: string }).code ?? `color-${index}`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-stone-600">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const images = (product.images && Array.isArray(product.images) && product.images.length > 0) ? product.images : ["/placeholder.svg"]
  const sizes = (product.sizes && Array.isArray(product.sizes)) ? product.sizes : []
  const orchidColors = (product.orchidColors && Array.isArray(product.orchidColors)) ? product.orchidColors : []

  const calculateDiscount = () => {
    if (!product.originalPrice) return null
    const original = typeof product.originalPrice === 'string' ? Number.parseFloat(product.originalPrice.replace(/[^0-9.]/g, "")) : product.originalPrice
    const current = typeof product.price === 'string' ? Number.parseFloat(product.price.replace(/[^0-9.]/g, "")) : product.price
    if (!original || !current || original <= current) return null
    return Math.round(((original - current) / original) * 100)
  }

  const discount = calculateDiscount()

  const handlePreview = (imageUrl: string) => {
    setButtonClicked(true)
    setTimeout(() => {
      setPreviewImage(imageUrl)
      setShowPreview(true)
      setButtonClicked(false)
    }, 150)
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    setTimeout(() => {
      setPreviewImage(null)
    }, 300)
  }

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim() || !newReview.userName.trim()) {
      alert("Please provide both your name and comment")
      return
    }

    setReviewLoading(true)
    try {
      const base = normalizeApiBase()
      const res = await fetch(`${base}/product-pages/${routeId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: newReview.userName,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Reload reviews
        const reviewRes = await fetch(`${base}/product-pages/${routeId}/reviews`, { cache: "no-store" })
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json()
          setReviews(Array.isArray(reviewData.reviews) ? reviewData.reviews : [])
        }
        // Update product rating
        if (product) {
          setProduct({ ...product, rating: data.rating, reviewCount: data.reviews })
        }
        // Reset form
        setNewReview({ userName: "", rating: 5, comment: "" })
        setShowReviewForm(false) // Close form on success
        alert("Thank you for your review!")
      } else {
        const error = await res.json()
        alert(error.message || "Failed to submit review")
      }
    } catch (error) {
      alert("Failed to submit review. Please try again.")
    } finally {
      setReviewLoading(false)
    }
  }

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return ""
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  // --- Review Stats Calculations ---
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) 
    : (product.rating || 0).toFixed(1);
  
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const star = Math.min(Math.max(Math.round(r.rating), 1), 5);
    ratingCounts[star as keyof typeof ratingCounts]++;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm tracking-wide">
            <Link href="/" className="uppercase text-stone-400 hover:text-stone-600 transition-colors">
              Home
            </Link>
            <span className="w-1 h-1 rounded-full bg-stone-400 shrink-0" aria-hidden />
            <Link href="/products" className="uppercase text-stone-400 hover:text-stone-600 transition-colors">
              Shop
            </Link>
            <span className="w-1 h-1 rounded-full bg-stone-400 shrink-0" aria-hidden />
            <span className="uppercase font-bold text-stone-900">
              {product.name}
            </span>
          </nav>

          {/* Product Details Grid */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left: Image Gallery */}
            <div className="flex gap-4">
              {/* Thumbnail Gallery */}
              <div className="flex flex-col gap-3 w-24">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`image-gallery-thumbnail relative aspect-square rounded-xl overflow-hidden border-2 ${
                      selectedImage === idx 
                        ? "selected border-stone-900 shadow-lg shadow-stone-900/20 ring-2 ring-stone-900/20" 
                        : "border-stone-200 hover:border-stone-400 hover:shadow-md"
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                        selectedImage === idx ? 'brightness-110' : 'hover:brightness-105'
                      }`}
                    />
                    {/* Selection indicator */}
                    {selectedImage === idx && (
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-900/10 to-transparent pointer-events-none" />
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-all duration-300 ease-out" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="image-gallery-main relative rounded-2xl overflow-hidden bg-stone-100 w-full max-w-[480px] aspect-[4/5] group">
                <img
                  src={getImageUrl(images[selectedImage])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Image overlay effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
                
                {/* Zoom button */}
                <button
                  onClick={() => handlePreview(images[selectedImage])}
                  className={`gallery-zoom-button absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white text-stone-700 hover:text-stone-900 p-2 rounded-full shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 ${
                    buttonClicked ? 'button-click-animation' : ''
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Product Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">{product.name}</h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? "text-yellow-500" : "text-stone-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-stone-600 font-medium">{product.rating || 0}</span>
                <span className="text-stone-400">|</span>
                <button className="text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  {product.reviewCount || 0} comment
                </button>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-stone-900">Select Size</span>
                  <button className="text-sm text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1">
                    Size Guide
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-2">
                  {sizes.map((size) => {
                    const sizeKey = getSizeKey(size)
                    return (
                      <button
                        key={sizeKey}
                        onClick={() => setSelectedSize(sizeKey)}
                        disabled={!size.available}
                        className={`px-5 py-2.5 rounded-xl border-2 font-medium transition-all duration-300 ${
                          selectedSize === sizeKey
                            ? "bg-stone-900 text-white border-stone-900"
                            : size.available
                              ? "bg-white text-stone-900 border-stone-200 hover:border-stone-400"
                              : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                        }`}
                      >
                        {size.size}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color Selection */}
              {colors.length > 0 && (
                <div>
                  <span className="text-sm font-semibold text-stone-900 block mb-3">Colours Available</span>
                  <div className="flex gap-2">
                    {colors.map((color, idx) => {
                      const colorKey = getColorKey(color, idx)
                      return (
                        <button
                          key={colorKey}
                          onClick={() => setSelectedColor(colorKey)}
                          disabled={!color.available}
                          className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                            selectedColor === colorKey
                              ? "border-stone-900 scale-110"
                              : "border-stone-200 hover:border-stone-400"
                          } ${!color.available ? "opacity-50 cursor-not-allowed" : ""}`}
                          style={{ backgroundColor: (color as { value?: string }).value || (color as { code?: string }).code || "#e5e7eb" }}
                          title={color.name || (color as { code?: string }).code || "Colour"}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Orchid Customization Section */}
              {product.orchidEnabled && orchidColors.length > 0 && (
                <div>
                  <span className="text-sm font-semibold text-stone-900 block mb-3">Customize with Orchid Flower</span>
                  <div className="flex gap-2">
                    {orchidColors.map((orchid) => (
                      <button
                        key={orchid._id || orchid.name}
                        onClick={() => setSelectedOrchid(orchid._id || orchid.name)}
                        disabled={!orchid.available}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                          selectedOrchid === (orchid._id || orchid.name)
                            ? "border-stone-900 scale-110"
                            : "border-stone-200 hover:border-stone-400"
                        } ${!orchid.available ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={orchid.name}
                        style={!orchid.image ? { backgroundColor: orchid.value || "#e5e7eb" } : undefined}
                      >
                        {orchid.image ? (
                          <img
                            src={getImageUrl(orchid.image)}
                            alt={orchid.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-stone-700 font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors"
                  >
                    <span className="text-stone-600">-</span>
                  </button>
                  <span className="w-12 text-center font-medium text-stone-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors"
                  >
                    <span className="text-stone-600">+</span>
                  </button>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={false}
                  className={`flex-1 px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 add-to-cart-button ${
                    "bg-stone-900 hover:bg-stone-800 text-white cursor-pointer"
                  } ${isAnimating ? 'animate-text-vanish-icon-swipe' : ''}`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to cart</span>
                </button>
                <button className="bg-white border-2 border-stone-200 hover:border-stone-900 text-stone-900 px-8 py-4 rounded-xl font-semibold transition-all duration-300">
                  Rs. {typeof product.price === 'string' ? product.price : product.price.toFixed(2)}
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-stone-500">Material</div>
                  <div className="text-base font-medium text-stone-900">Premium Leather</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-stone-500">Pattern</div>
                  <div className="text-base font-medium text-stone-900">Solid</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-stone-500">Fit</div>
                  <div className="text-base font-medium text-stone-900">True to size</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-stone-500">Heel Type</div>
                  <div className="text-base font-medium text-stone-900">Flat</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-stone-500">Sole Type</div>
                  <div className="text-base font-medium text-stone-900">Rubber</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-stone-500">Style</div>
                  <div className="text-base font-medium text-stone-900">Casual Elegance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Products Section */}
          <div className="mt-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 2xl:mb-20 px-0">
              <div className="flex flex-col items-start gap-1">
                <span className="text-xs 2xl:text-sm font-medium tracking-[0.2em] uppercase text-stone-500">
                  COLLECTIONS
                </span>
                <h2 className="text-3xl md:text-5xl 2xl:text-6xl font-serif leading-tight">
                  <span className="font-bold text-stone-900">Similar</span>
                  <span className="font-normal italic text-stone-500 ml-2">Products</span>
                </h2>
              </div>
              <div className="hidden md:flex items-center gap-4 2xl:gap-6 mb-2">
                <span className="text-xs 2xl:text-sm font-semibold tracking-[0.2em] text-black uppercase">
                  Quick Update On Instagram
                </span>
                <span className="w-12 2xl:w-16 h-[1px] bg-gray-400" />
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity duration-300"
                >
                  <Instagram className="w-6 h-6 2xl:w-7 2xl:h-7 text-black" />
                </Link>
              </div>
            </div>
            {similarProducts.length > 0 ? (
              <div className="pl-0 overflow-x-auto overflow-y-hidden md:overflow-visible hide-scrollbar">
                <div className="flex flex-nowrap md:grid md:grid-cols-4 gap-4 md:gap-5 pb-2 md:pb-0 pr-4 md:pr-0 md:max-w-[1400px] 2xl:max-w-[1800px] md:mx-auto">
                  {similarProducts.map((similarItem) => (
                    <div
                      key={similarItem.id}
                      className="group relative flex flex-col flex-shrink-0 w-[75vw] sm:w-[45vw] md:w-auto snap-start"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-white shadow-sm border border-stone-100 group-hover:shadow-2xl transition-all duration-700 ease-[0.25,0.46,0.45,0.94] cursor-pointer">
                        <Link
                          href={`/product/${similarItem.id}`}
                          className="block w-full h-full relative overflow-hidden"
                        >
                          <div className="w-full h-full transform transition-transform duration-[600ms] ease-[0.25,0.46,0.45,0.94] group-hover:scale-110">
                            <img
                              src={getImageUrl(similarItem.image)}
                              alt={similarItem.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setSimilarWishlist((prev) => {
                              const next = new Set(prev)
                              if (next.has(similarItem.id)) next.delete(similarItem.id)
                              else next.add(similarItem.id)
                              return next
                            })
                          }}
                          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/80 backdrop-blur-md border border-white/50 text-stone-600 hover:bg-white hover:text-pink-500 transition-all duration-[400ms] ease-[0.25,0.46,0.45,0.94] shadow-sm opacity-100 transform hover:scale-110"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors duration-[400ms] ${similarWishlist.has(similarItem.id) ? "fill-pink-500 text-pink-500" : ""}`}
                          />
                        </button>
                      </div>
                      <div className="pt-4 text-center group-hover:opacity-50 transition-opacity duration-[600ms] ease-[0.25,0.46,0.45,0.94]">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium mb-1">
                          {similarItem.badge || "PRODUCT"}
                        </p>
                        <h3 className="font-serif font-bold text-sm uppercase text-stone-800 tracking-wide mb-1.5 line-clamp-1">
                          {similarItem.name}
                        </h3>
                        <p className="text-sm text-stone-900 font-medium">
                          {similarItem.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-stone-500">
                <p className="text-sm">No similar products available at the moment.</p>
              </div>
            )}
          </div>

          {/* New Shipping & Size Guide Luxury Section */}
          <div className="mt-16 mb-16 grid md:grid-cols-2 gap-6 lg:gap-10">
            {/* Location-Based Shipping Info */}
            <div className="group relative bg-[#fcf9f5] border border-stone-100 rounded-[2rem] p-8 lg:p-10 overflow-hidden transition-all duration-700 ease-[0.25,0.46,0.45,0.94] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#f2e9de] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000 ease-[0.25,0.46,0.45,0.94]"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-stone-100 group-hover:scale-110 transition-transform duration-500 ease-[0.25,0.46,0.45,0.94]">
                    <Truck className="w-6 h-6 text-stone-700" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3">Location-Based Delivery</h3>
                  <p className="text-stone-500 text-[15px] leading-relaxed mb-8 pr-4">
                    We've detected you're in <span className="font-bold text-stone-800">Colombo, Sri Lanka</span>. Order within the next 4 hours to qualify for <span className="font-bold text-stone-800 underline decoration-stone-300 underline-offset-4">Delivery by Tomorrow</span>.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold tracking-[0.15em] uppercase text-stone-400">
                  <MapPin className="w-4 h-4 text-stone-800" />
                  <span>Colombo, Western Province</span>
                </div>
              </div>
            </div>

            {/* Interactive Size Guide */}
            <div className="group relative bg-white border border-stone-100 rounded-[2rem] p-8 lg:p-10 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-700 ease-[0.25,0.46,0.45,0.94] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100 group-hover:rotate-12 transition-transform duration-500 ease-[0.25,0.46,0.45,0.94]">
                    <Ruler className="w-6 h-6 text-stone-700" strokeWidth={1.5} />
                  </div>
                  <button 
                    onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
                    className="text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase hover:text-stone-900 transition-colors flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-full"
                  >
                    {isSizeGuideOpen ? 'Close Guide' : 'View Full Guide'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-500 ${isSizeGuideOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3">Perfect Fit Guarantee</h3>
                <p className="text-stone-500 text-[15px] leading-relaxed mb-4">
                  Our footwear is crafted true to size. If you're between sizes, we recommend sizing up for flats and true to size for heels.
                </p>

                {/* Expanding Size Chart */}
                <div className={`transition-all duration-700 ease-[0.25,0.46,0.45,0.94] overflow-hidden ${isSizeGuideOpen ? 'max-h-[500px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
                  <div className="border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-center">
                      <thead className="bg-stone-50 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold border-b border-stone-100">
                        <tr>
                          <th className="px-4 py-4 font-bold">EU</th>
                          <th className="px-4 py-4 font-bold border-l border-stone-100">UK</th>
                          <th className="px-4 py-4 font-bold border-l border-stone-100">US</th>
                          <th className="px-4 py-4 font-bold border-l border-stone-100">CM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700 font-medium">
                        <tr className="hover:bg-stone-50 transition-colors duration-300">
                          <td className="px-4 py-3.5 text-stone-900 font-bold">36</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">3</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">5</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">23.0</td>
                        </tr>
                        <tr className="hover:bg-stone-50 transition-colors duration-300">
                          <td className="px-4 py-3.5 text-stone-900 font-bold">37</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">4</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">6</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">23.8</td>
                        </tr>
                        <tr className="hover:bg-stone-50 transition-colors duration-300">
                          <td className="px-4 py-3.5 text-stone-900 font-bold">38</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">5</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">7</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">24.5</td>
                        </tr>
                        <tr className="hover:bg-stone-50 transition-colors duration-300">
                          <td className="px-4 py-3.5 text-stone-900 font-bold">39</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">6</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">8</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">25.3</td>
                        </tr>
                        <tr className="hover:bg-stone-50 transition-colors duration-300">
                          <td className="px-4 py-3.5 text-stone-900 font-bold">40</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">7</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">9</td>
                          <td className="px-4 py-3.5 border-l border-stone-100">26.0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Modern Comments / Customer Reviews Section */}
          <div className="mt-12 mb-16">
            
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-16">
              
              {/* Left: Overall Rating */}
              <div className="flex-1">
                <h2 className="text-4xl md:text-5xl font-serif mb-6">
                  <span className="font-bold text-stone-900">Customer</span>
                  <span className="font-normal italic text-stone-500 ml-3">Reviews</span>
                </h2>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-6 h-6 ${star <= Math.round(Number(avgRating)) ? "text-[#d4af37]" : "text-stone-200"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-3xl font-medium text-stone-900">{avgRating}</span>
                </div>
                <p className="text-sm text-stone-500 font-medium">Based on {totalReviews} reviews</p>
              </div>

              {/* Center: Rating Distribution Bars */}
              <div className="flex-1 w-full max-w-md space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-4 text-sm font-medium">
                    <span className="w-14 text-stone-500">{star} Stars</span>
                    <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-stone-900 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${totalReviews > 0 ? (ratingCounts[star as keyof typeof ratingCounts] / totalReviews) * 100 : 0}%` }} 
                      />
                    </div>
                    <span className="w-4 text-stone-400 text-right">{ratingCounts[star as keyof typeof ratingCounts]}</span>
                  </div>
                ))}
              </div>

              {/* Right: Write Review Button */}
              <div className="flex-1 flex justify-start lg:justify-end w-full lg:w-auto mt-6 lg:mt-0">
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-8 py-3.5 bg-[#1a1a1a] text-white rounded-full text-xs font-bold tracking-[0.15em] hover:bg-black transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {showReviewForm ? <X className="w-4 h-4" /> : <span className="text-lg leading-none">+</span>} 
                  {showReviewForm ? "CLOSE FORM" : "WRITE A REVIEW"}
                </button>
              </div>

            </div>

            {/* Hidden Review Form with Smooth Animation */}
            <div 
              className={`transition-all duration-700 ease-[0.25,0.46,0.45,0.94] overflow-hidden ${
                showReviewForm ? 'max-h-[800px] opacity-100 mb-16' : 'max-h-0 opacity-0 mb-0'
              }`}
            >
              <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl mx-auto">
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-8 text-center">Share Your Experience</h3>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-stone-500 uppercase mb-3">Your Name</label>
                      <input
                        type="text"
                        value={newReview.userName}
                        onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full px-5 py-3.5 bg-stone-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-stone-500 uppercase mb-3">Rating</label>
                      <div className="flex gap-3 h-[52px] items-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setNewReview({ ...newReview, rating })}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              newReview.rating >= rating
                                ? "bg-[#d4af37]/10 scale-110"
                                : "hover:bg-stone-100"
                            }`}
                          >
                            <svg
                              className={`w-6 h-6 transition-colors ${newReview.rating >= rating ? "text-[#d4af37]" : "text-stone-300"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-stone-500 uppercase mb-3">Your Review</label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Tell us what you loved about this product..."
                      rows={4}
                      className="w-full px-5 py-4 bg-stone-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none transition-all"
                    />
                  </div>
                  <div className="pt-2 text-center">
                    <button
                      onClick={handleSubmitReview}
                      disabled={reviewLoading}
                      className="px-10 py-4 bg-stone-900 text-white rounded-full font-bold text-sm tracking-wider hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {reviewLoading ? "SUBMITTING..." : "SUBMIT REVIEW"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Cards List */}
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
                <span className="text-sm font-bold text-stone-900 tracking-wide">{totalReviews} Reviews</span>
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-stone-500 bg-stone-50 px-4 py-2.5 rounded-full cursor-pointer hover:bg-stone-100 transition-colors">
                  SORT BY: MOST RECENT
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-16 text-stone-500">
                  <p className="text-lg font-serif">No reviews yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(showAllComments ? reviews : reviews.slice(0, 3)).map((review, idx) => {
                    // Generate a pseudo-title from the first few words for the modern look
                    const words = review.comment.split(' ');
                    const title = words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');

                    return (
                      <div 
                        key={idx} 
                        className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 flex flex-col"
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-[#fcf9f5] text-stone-700 rounded-full flex items-center justify-center font-serif text-xl border border-stone-100 shrink-0">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-stone-900 text-sm">{review.userName}</span>
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </div>
                            </div>
                            {review.createdAt && (
                              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                                {formatDate(review.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-[#d4af37]" : "text-stone-200"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        {review.comment && (
                          <div className="flex-1">
                            <h4 className="font-bold text-stone-900 mb-2 capitalize">{title}</h4>
                            <p className="text-stone-500 text-sm leading-relaxed">{review.comment}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {reviews.length > 3 && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setShowAllComments(!showAllComments)}
                    className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-stone-900 hover:text-stone-500 transition-colors uppercase"
                  >
                    {showAllComments ? "Show Less" : "Load More Reviews"}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllComments ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Modern Preview Modal with Smooth Animations */}
      {showPreview && previewImage && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClosePreview}
        >
          <div
            className="modal-content relative max-w-4xl w-full mx-4 transform"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClosePreview}
              className="gallery-zoom-button absolute -top-12 right-0 text-white hover:text-stone-300 bg-black/20 backdrop-blur-sm rounded-full p-2 hover:bg-black/40"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="modal-image-container bg-white rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 ease-out hover:shadow-3xl">
              <img 
                src={previewImage || "/placeholder.svg"} 
                alt="Product preview" 
                className="modal-image w-full h-auto transition-all duration-500 ease-out transform hover:scale-105" 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}