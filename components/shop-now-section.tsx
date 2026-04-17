"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import { ChevronRight, ChevronLeft, Loader2, Heart, ShoppingBag, Instagram, Star, X, CheckCircle2, XCircle, Minus, Plus, Info } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { API_BASE_URL, getImageUrl } from "@/lib/api-config"

// --- INTERFACES ---

interface Color {
  name: string
  code?: string
  value?: string
  available: boolean
  id?: string
}

interface Size {
  id: string
  size: string
  available: boolean
}

interface ProductData {
  _id: string | number
  id: string | number
  name: string
  price: number
  originalPrice?: number
  numericPrice: number
  image: string
  images?: string[]
  rating: number
  isNew?: boolean
  category: string
  inStock: boolean
  stock?: number
  colors?: Color[]
}

// --- HELPER FUNCTION ---
const calculateDiscount = (price: number, originalPrice?: number) => {
  if (!originalPrice || originalPrice <= price) return null
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100)
  return `${discount}% OFF`
}

// --- Custom Animation Styles ---
const customStyles = `
  @keyframes modalEnter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  .modal-animate-enter {
    animation: modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  /* Mobile horizontal scrollbar hide */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* Apply transform only on desktop to keep mobile native scroll working */
  @media (min-width: 768px) {
    .desktop-carousel-transform {
      transform: var(--desktop-transform);
      transition: transform 500ms ease-in-out;
    }
  }
`;

// --- MAIN COMPONENT (ShopNowSection) ---

export function ShopNowSection() {
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wishlist, setWishlist] = useState<Array<string | number>>([])
  const { addToCart } = useCart()

  // Add to Cart Modal State
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false)
  const [selectedProductForCart, setSelectedProductForCart] = useState<ProductData | null>(null)
  const [productDetails, setProductDetails] = useState<{ sizes: Size[], colors: Color[] } | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loadingProductDetails, setLoadingProductDetails] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Mobile check state for conditional animations
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check screen size to toggle mobile animations
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // --- PRODUCT FETCHING LOGIC ---
  useEffect(() => {
    async function fetchLatestProducts() {
      try {
        setLoading(true)
        setError(null)
        const raw = API_BASE_URL
        const base = raw.endsWith("/api") ? raw : `${raw.replace(/\/$/, "")}/api`

        const response = await fetch(`${base}/products?sortBy=createdAt&order=desc&limitedEdition=false`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch latest products: ${response.status}`);
        }

        const data = await response.json()
        const items = Array.isArray(data.products) ? data.products : Array.isArray(data) ? data : [];

        const fetchedProducts: ProductData[] = items.map((p: any) => {
          const humanCat =
            typeof p.category === "string"
              ? p.category.replace(/-/g, " ").replace(/\b\w/g, (m: string) => m.toUpperCase())
              : "Uncategorized"

          const colors: Color[] = Array.isArray(p.colors) ? p.colors.map((c: any) => ({
            name: c.name || "",
            code: c.code || c.value || "",
            value: c.value || c.code || "",
            available: c.available !== false
          })) : []

          return {
            _id: p._id || p.id,
            id: p.id || p._id,
            name: p.name || 'Untitled Product',
            price: p.price || 0,
            numericPrice: Number(p.price || 0),
            originalPrice: p.originalPrice || undefined,
            rating: Number(p.rating || 0),
            image: p.images && p.images.length > 0 ? p.images[0] : "",
            images: p.images || [],
            category: humanCat,
            inStock: (p.stock ?? 0) > 0,
            stock: p.stock || 0,
            colors: colors,
            isNew: Math.random() > 0.5
          }
        });

        setProducts(fetchedProducts);

      } catch (e: any) {
        console.error("Error fetching products:", e)
        setError("Failed to load latest products. Showing mock data.")

        setProducts([
          { _id: "m1", id: "m1", name: "Ivory Luxe Hoodie", price: 6500, numericPrice: 6500, originalPrice: 7500, image: "/1.jpeg", rating: 4.8, isNew: true, category: "Footwear", inStock: true, stock: 10, colors: [] },
          { _id: "m2", id: "m2", name: "Graphite Edge", price: 4200, numericPrice: 4200, image: "/2.jpeg", rating: 4.5, isNew: false, category: "Footwear", inStock: true, stock: 5, colors: [] },
          { _id: "m3", id: "m3", name: "Shadow Stripe", price: 8500, numericPrice: 8500, originalPrice: 9000, image: "/3.jpeg", rating: 4.2, isNew: true, category: "Footwear", inStock: true, stock: 8, colors: [] },
          { _id: "m4", id: "m4", name: "Sand Dune", price: 5800, numericPrice: 5800, image: "/4.jpeg", rating: 4.7, isNew: false, category: "Footwear", inStock: true, stock: 12, colors: [] },
          { _id: "m5", id: "m5", name: "Midnight Comfort", price: 3200, numericPrice: 3200, originalPrice: 3800, image: "/6.jpeg", rating: 4.0, isNew: true, category: "Footwear", inStock: true, stock: 15, colors: [] },
        ]);

      } finally {
        setLoading(false)
      }
    }
    fetchLatestProducts()
  }, [])

  // Load wishlist
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const userData = localStorage.getItem("user")
        if (userData) {
          const user = JSON.parse(userData)
          const response = await fetch(`${API_BASE_URL}/api/wishlist/${user.id}`)
          if (response.ok) {
            const data = await response.json()
            const productIds = data.wishlist.map((item: any) => item.productId._id || item.productId)
            setWishlist(productIds)
            localStorage.setItem("wishlist", JSON.stringify(productIds))
          } else {
            const savedWishlist = localStorage.getItem("wishlist")
            if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
          }
        } else {
          const savedWishlist = localStorage.getItem("wishlist")
          if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
        }
      } catch (error) {
        console.error("Error loading wishlist:", error)
        const savedWishlist = localStorage.getItem("wishlist")
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
      }
    }

    loadWishlist()
    const handleUserChange = () => loadWishlist()
    window.addEventListener('userLogin', handleUserChange)
    window.addEventListener('userLogout', handleUserChange)
    return () => {
      window.removeEventListener('userLogin', handleUserChange)
      window.removeEventListener('userLogout', handleUserChange)
    }
  }, [])

  const toggleWishlist = async (productId: string | number) => {
    try {
      const userData = localStorage.getItem("user")
      if (!userData) {
        window.location.href = "/login"
        return
      }

      const user = JSON.parse(userData)
      const isInWishlist = wishlist.includes(productId)

      if (isInWishlist) {
        const response = await fetch(`${API_BASE_URL}/api/wishlist/${user.id}/remove/${productId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          const updatedWishlist = wishlist.filter((id) => id !== productId)
          setWishlist(updatedWishlist)
          localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
        }
      } else {
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
      const updatedWishlist = wishlist.includes(productId)
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId]

      setWishlist(updatedWishlist)
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
    }
  }

  const openAddToCartModal = async (product: ProductData) => {
    setSelectedProductForCart(product)
    setSelectedSize(null)
    setSelectedColor(null)
    setQuantity(1)
    setIsAddToCartModalOpen(true)
    document.body.style.overflow = 'hidden'
    setLoadingProductDetails(true)

    try {
      const raw = API_BASE_URL
      const base = raw.endsWith("/api") ? raw : `${raw.replace(/\/$/, "")}/api`

      let res = await fetch(`/api/limited-edition/${product._id || product.id}`, { cache: "no-store" })
      if (!res.ok) {
        res = await fetch(`${base}/product-pages/${product._id || product.id}`, { cache: "no-store" })
      }

      if (res.ok) {
        const data = await res.json()
        setProductDetails({
          sizes: data.sizes || [],
          colors: data.colors || []
        })
      } else {
        setProductDetails({
          sizes: [],
          colors: product.colors || []
        })
      }
    } catch (error) {
      console.error("Error loading product details:", error)
      setProductDetails({
        sizes: [],
        colors: product.colors || []
      })
    } finally {
      setLoadingProductDetails(false)
    }
  }

  const closeAddToCartModal = () => {
    setIsAddToCartModalOpen(false)
    document.body.style.overflow = 'unset'
    setTimeout(() => {
      setSelectedProductForCart(null)
      setProductDetails(null)
      setSelectedSize(null)
      setSelectedColor(null)
      setQuantity(1)
    }, 300)
  }

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleAddToCartFromModal = () => {
    if (!selectedProductForCart) return

    if (productDetails?.sizes && productDetails.sizes.length > 0 && !selectedSize) {
      return
    }

    if (productDetails?.colors && productDetails.colors.length > 0 && !selectedColor) {
      return
    }

    const selectedColorObj = selectedColor && productDetails?.colors
      ? productDetails.colors.find(c => 
          (c as any)._id === selectedColor || 
          c.id === selectedColor || 
          c.name === selectedColor ||
          (c.code ?? c.value) === selectedColor ||
          (selectedColor.startsWith("color-") && productDetails.colors[parseInt(selectedColor.replace("color-", ""), 10)] === c)
        )
      : undefined
    
    const selectedColorName = selectedColorObj?.name ?? selectedColor
    const selectedColorCode = selectedColorObj?.code ?? selectedColorObj?.value

    const selectedSizeObj = selectedSize && productDetails?.sizes
      ? productDetails.sizes.find(s => 
          (s as any)._id === selectedSize || 
          s.id === selectedSize || 
          s.size === selectedSize ||
          (s as any).name === selectedSize
        )
      : undefined

    const selectedSizeValue = selectedSizeObj?.size ?? selectedSize

    addToCart({
      productId: String(selectedProductForCart._id || selectedProductForCart.id),
      name: selectedProductForCart.name,
      price: selectedProductForCart.numericPrice,
      originalPrice: selectedProductForCart.originalPrice,
      image: selectedProductForCart.image,
      quantity: quantity,
      size: (selectedSizeValue ?? undefined),
      color: (selectedColorName ?? undefined),
      colorCode: (selectedColorCode ?? undefined),
      category: selectedProductForCart.category
    })

    closeAddToCartModal()
  }

  // --- CAROUSEL LOGIC ---
  const productsPerView = 4;
  const totalPages = Math.ceil(products.length / productsPerView);

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const PLACEHOLDER_IMAGE = "/placeholder.svg";

  if (loading) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center text-stone-600 py-10 flex justify-center items-center">
          <Loader2 className="w-6 h-6 animate-spin me-2" /> Loading new products...
        </div>
      </section>
    );
  }

  if (error && products.length === 0) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center text-red-600 py-10">{error}</div>
      </section>
    );
  }

  return (
    <section className="relative pt-4 pb-20 md:pt-1 2xl:py-28 overflow-hidden bg-white">
      <style>{customStyles}</style>

      <div className="max-w-[1400px] 2xl:max-w-[1800px] mx-auto relative z-10">

        {/* --- HEADER SECTION --- */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 2xl:mb-20 px-4 md:px-12 2xl:px-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Left Side: Title updated to match Slipper Section style */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs 2xl:text-sm font-medium tracking-[0.2em] uppercase text-stone-500">
              COLLECTIONS
            </span>
            <h2 className="text-3xl md:text-5xl 2xl:text-6xl font-serif leading-tight">
              <span className="font-bold text-stone-900">Newest</span>
              <span className="font-normal italic text-stone-500 ml-2">Collection</span>
            </h2>
          </div>

          {/* Right Side: Arrow buttons + Shop all + Instagram */}
          <div className="hidden md:flex items-center gap-4 2xl:gap-6 mb-2">
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={prevSlide}
                className="relative p-3 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/80 text-stone-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-stone-50 hover:border-stone-300/90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300/50 focus:ring-offset-2 transition-all duration-300 ease-out"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
              >
                <motion.span whileHover={{ x: -1 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  <ChevronLeft className="w-5 h-5 2xl:w-6 2xl:h-6 stroke-[2.25]" />
                </motion.span>
              </motion.button>
              <motion.button
                type="button"
                onClick={nextSlide}
                className="relative p-3 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/80 text-stone-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-stone-50 hover:border-stone-300/90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300/50 focus:ring-offset-2 transition-all duration-300 ease-out"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
              >
                <motion.span whileHover={{ x: 1 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  <ChevronRight className="w-5 h-5 2xl:w-6 2xl:h-6 stroke-[2.25]" />
                </motion.span>
              </motion.button>
            </div>
            <span className="w-12 2xl:w-16 h-[1px] bg-gray-400" />
            <Link href="/products" className="focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2 rounded-full">
              <motion.span
                className="inline-flex items-center px-5 py-2.5 rounded-full text-xs 2xl:text-sm font-semibold tracking-[0.15em] uppercase bg-stone-900 text-white border border-stone-900 hover:bg-stone-800 hover:border-stone-800"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                Shop all
              </motion.span>
            </Link>
            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity duration-300">
              <Instagram className="w-6 h-6 2xl:w-7 2xl:h-7 text-black" />
            </Link>
          </div>
        </motion.div>
        {/* --- End Header --- */}


        {/* --- Products Carousel Section --- */}
        <div className="pl-4 md:px-12 2xl:px-16">

          {/* Carousel Track updated for Mobile Swipe / Desktop TranslateX */}
          <div className="md:overflow-hidden">
            <div
              className="flex gap-4 md:gap-5 overflow-x-auto overflow-y-hidden md:overflow-visible touch-pan-x snap-x snap-mandatory md:snap-none pb-2 md:pb-0 pr-4 md:pr-0 hide-scrollbar desktop-carousel-transform"
              style={{ '--desktop-transform': `translateX(-${currentIndex * (100 / productsPerView)}%)` } as React.CSSProperties}
            >
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  className="group relative flex flex-col flex-shrink-0 w-[75vw] sm:w-[45vw] md:w-[calc(25%-15px)] snap-start"
                  initial={isMobile ? { opacity: 0, y: 15, scale: 0.98 } : { opacity: 0, y: 60, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: isMobile ? 0.05 : 0.2 }}
                  transition={{
                    duration: isMobile ? 0.3 : 0.8,
                    delay: isMobile ? 0 : index * 0.15,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  {/* --- Card Image Area --- */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-white shadow-sm border border-stone-100 group-hover:shadow-2xl transition-all duration-700 ease-[0.25, 0.46, 0.45, 0.94] cursor-pointer">
                    
                    <Link href={`/product/${product._id || product.id}`} className="block w-full h-full relative overflow-hidden">
                      
                      {/* Image - Smooth Zoom Effect */}
                      <div className="w-full h-full transform transition-transform duration-[600ms] ease-[0.25, 0.46, 0.45, 0.94] group-hover:scale-110">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                          />
                      </div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[600ms] ease-[0.25, 0.46, 0.45, 0.94] z-10" />

                      {/* Overlay Content (Bottom) */}
                      <div className="absolute inset-x-0 bottom-0 z-20 p-5 translate-y-4 group-hover:translate-y-0 transition-all duration-[600ms] ease-[0.25, 0.46, 0.45, 0.94] opacity-0 group-hover:opacity-100">
                          
                          {/* Stock Status */}
                          <div className="flex items-center gap-1.5 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-[600ms] ease-[0.25, 0.46, 0.45, 0.94] delay-75">
                              {product.inStock ? (
                                  <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                      <span className="text-green-300 text-[10px] font-bold uppercase tracking-wider">In Stock</span>
                                  </>
                              ) : (
                                  <>
                                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                                      <span className="text-red-300 text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
                                  </>
                              )}
                          </div>

                          {/* Yellow Line Animation */}
                          <div className="h-[2px] bg-yellow-400 w-0 group-hover:w-full transition-all duration-[700ms] ease-[0.25, 0.46, 0.45, 0.94] mb-4" />

                          {/* Add to Cart Button */}
                          <button
                              onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openAddToCartModal(product);
                              }}
                              className="w-full py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-sm shadow-lg hover:bg-white/90 hover:text-stone-900 transition-all duration-[400ms] ease-[0.25, 0.46, 0.45, 0.94] flex items-center justify-center gap-2 group/btn relative overflow-hidden transform hover:scale-[1.02]"
                          >
                              <span className="absolute inset-0 bg-white/40 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-[400ms] ease-[0.25, 0.46, 0.45, 0.94]"></span>
                              <ShoppingBag className="w-4 h-4" />
                              <span>Add to Cart</span>
                          </button>
                      </div>
                    </Link>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        toggleWishlist(product._id || product.id)
                      }}
                      className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/80 backdrop-blur-md border border-white/50 text-stone-600 hover:bg-white hover:text-pink-500 transition-all duration-[400ms] ease-[0.25, 0.46, 0.45, 0.94] shadow-sm opacity-100 transform hover:scale-110"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors duration-[400ms] ease-[0.25, 0.46, 0.45, 0.94] ${wishlist.includes(product._id || product.id) ? "fill-pink-500 text-pink-500" : ""}`}
                      />
                    </button>
                  </div>

                  {/* --- Card Details --- */}
                  <div className="pt-4 text-center group-hover:opacity-50 transition-opacity duration-[600ms] ease-[0.25, 0.46, 0.45, 0.94]">
                      {/* Vendor/Category Line */}
                      <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium mb-1">
                          {product.category}
                      </p>
                      
                      {/* Title */}
                      <h3 className="font-serif font-bold text-sm uppercase text-stone-800 tracking-wide mb-1.5 line-clamp-1">
                          {product.name}
                      </h3>

                      {/* Price */}
                      <p className="text-sm text-stone-900 font-medium">
                          Rs. {product.price.toLocaleString()}
                      </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dot Navigation - Hidden on mobile because it uses native swipe */}
          {products.length > productsPerView && (
            <motion.div
              className="hidden md:flex justify-center mt-12 2xl:mt-16 gap-2 2xl:gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: 0.6,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${index === currentIndex ? "w-8 2xl:w-10 h-2 2xl:h-2.5 bg-gray-900" : "w-2 2xl:w-2.5 h-2 2xl:h-2.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </motion.div>
          )}
        </div>

      </div>

      {/* --- RE-DESIGNED ADD TO CART MODAL (same as products page / slippers section) --- */}
      {mounted && isAddToCartModalOpen && selectedProductForCart && createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
            
            {/* Ultra Smooth Backdrop - White Liquid Glass */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-white/40 backdrop-blur-lg backdrop-saturate-150 transition-opacity cursor-pointer"
                onClick={closeAddToCartModal}
            />

            {/* Modal Content - Luxury Card Style */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 40, rotateX: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 40, rotateX: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] w-full max-w-[480px] overflow-hidden border border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Close Button */}
                <button
                    type="button"
                    onClick={closeAddToCartModal}
                    className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-900 hover:text-white transition-all duration-300 transform hover:rotate-90"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="relative">
                    {/* Header Image Section */}
                    <div className="h-48 bg-stone-50 relative overflow-hidden">
                         <motion.img
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            src={getImageUrl(selectedProductForCart.image)}
                            alt={selectedProductForCart.name}
                            className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                        
                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 pt-0">
                            <motion.div 
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col gap-1"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-600 bg-pink-50 self-start px-2 py-1 rounded-md">
                                    {selectedProductForCart.category}
                                </span>
                                <h3 className="font-serif font-bold text-stone-900 text-2xl leading-tight">
                                    {selectedProductForCart.name}
                                </h3>
                            </motion.div>
                        </div>
                    </div>

                    <div className="px-8 pb-8 space-y-8">
                        {loadingProductDetails ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-stone-300 mb-3" />
                                <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">Tailoring your fit...</span>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="space-y-8"
                            >
                                {/* Pricing Row */}
                                <div className="flex items-end justify-between border-b border-stone-100 pb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Unit Price</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-stone-900 text-2xl">Rs. {selectedProductForCart.price.toLocaleString()}</span>
                                            {selectedProductForCart.originalPrice != null && (
                                                <span className="text-stone-300 line-through text-sm">Rs. {selectedProductForCart.originalPrice.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase">Ready to Ship</span>
                                    </div>
                                </div>

                                {/* Selection Controls */}
                                <div className="grid gap-6">
                                    {/* Size Selection */}
                                    {productDetails?.sizes && productDetails.sizes.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[11px] font-bold text-stone-900 uppercase tracking-wider">Select Size</label>
                                                <button type="button" className="text-[10px] text-stone-400 flex items-center gap-1 hover:text-stone-900 transition-colors">
                                                    <Info className="w-3 h-3" /> Size Guide
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {productDetails.sizes.map((size, sizeIdx) => {
                                                    const sizeKey = size.size ?? size.id ?? `size-${sizeIdx}`;
                                                    return (
                                                        <button
                                                            key={sizeKey}
                                                            type="button"
                                                            onClick={() => setSelectedSize(sizeKey)}
                                                            disabled={!size.available}
                                                            className={`relative h-11 px-5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center justify-center border-2 ${
                                                                selectedSize === sizeKey
                                                                    ? "bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-200"
                                                                    : size.available
                                                                    ? "bg-white text-stone-600 border-stone-100 hover:border-stone-300"
                                                                    : "bg-stone-50 text-stone-300 border-transparent cursor-not-allowed"
                                                            }`}
                                                        >
                                                            {size.size}
                                                            {!size.available && <div className="absolute inset-x-2 h-[1.5px] bg-stone-200 rotate-[30deg]" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Color Selection */}
                                    {productDetails?.colors && productDetails.colors.length > 0 && (
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold text-stone-900 uppercase tracking-wider">Choose Color</label>
                                            <div className="flex flex-wrap gap-3">
                                                {productDetails.colors.map((color, idx) => {
                                                    const colorKey = color.id ?? color.code ?? color.value ?? `color-${idx}`;
                                                    const isSelected = selectedColor === colorKey;
                                                    return (
                                                        <button
                                                            key={colorKey}
                                                            type="button"
                                                            onClick={() => setSelectedColor(colorKey)}
                                                            disabled={!color.available}
                                                            className={`group relative p-1 rounded-full border-2 transition-all duration-300 ${
                                                                isSelected ? "border-stone-900 scale-110" : "border-transparent hover:border-stone-200"
                                                            }`}
                                                        >
                                                            <div 
                                                                className="w-8 h-8 rounded-full shadow-inner border border-black/5"
                                                                style={{ backgroundColor: color.value || color.code }}
                                                            />
                                                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                {color.name}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quantity & Summary Footer */}
                                    <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                                        <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl gap-1">
                                            <button 
                                                type="button"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold text-stone-900">{quantity}</span>
                                            <button 
                                                type="button"
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Subtotal</span>
                                            <span className="text-xl font-bold text-stone-900">
                                                Rs. {(selectedProductForCart.numericPrice * quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Action Button */}
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddToCartFromModal}
                                    className={`w-full py-5 rounded-[1.5rem] font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl ${
                                        (productDetails?.sizes?.length && !selectedSize) || (productDetails?.colors?.length && !selectedColor)
                                            ? "bg-stone-300 cursor-not-allowed shadow-none"
                                            : "bg-stone-900 hover:bg-stone-800 shadow-stone-200"
                                    }`}
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    <span>Add to Cart</span>
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
            </div>
        </AnimatePresence>,
        document.body
      )}
    </section>
  )
}