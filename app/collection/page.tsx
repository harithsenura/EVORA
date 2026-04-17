"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2, Heart, ShoppingBag, Search, SlidersHorizontal,
  CheckCircle2, XCircle, ChevronDown, X, Minus, Plus, Info,
  ArrowRight, Sparkles, Filter
} from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { API_BASE_URL, getImageUrl } from "@/lib/api-config"

// --- Types ---
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

interface Product {
  id: string | number
  name: string
  price: string
  originalPrice?: string
  numericPrice: number
  image: string
  images?: string[]
  category: string
  inStock: boolean
  rating: number
  colors?: Color[]
  stock?: number
  sizes?: Size[]
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 18 }
  }
}

function CollectionContent() {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get("cat")

  // --- State ---
  const [activeCategory, setActiveCategory] = useState("All")
  const [sortBy, setSortBy] = useState("featured")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [availability, setAvailability] = useState("all")

  const [wishlist, setWishlist] = useState<Array<string | number>>([])
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 20

  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>(["All"])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const { addToCart } = useCart()

  // Add to Cart Modal
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false)
  const [selectedProductForCart, setSelectedProductForCart] = useState<Product | null>(null)
  const [productDetails, setProductDetails] = useState<{ sizes: Size[], colors: Color[] } | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loadingProductDetails, setLoadingProductDetails] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Set category from URL param on mount
  useEffect(() => {
    if (initialCat) {
      const normalizedCat = initialCat.replace(/-/g, " ").replace(/\b\w/g, m => m.toUpperCase())
      setActiveCategory(normalizedCat)
    }
  }, [initialCat])

  // Lock scroll on filter sheet
  useEffect(() => {
    if (isFilterSheetOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isFilterSheetOpen])

  // --- Data Loading ---
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const res = await fetch("/api/products?sortBy=createdAt&sortOrder=desc", { cache: "no-store" })
        if (!res.ok) throw new Error(String(res.status))
        const data = await res.json()
        const items = Array.isArray(data.products) ? data.products : []

        const mapped: Product[] = items.map((p: any) => {
          const humanCat = typeof p.category === "string"
            ? p.category.replace(/-/g, " ").replace(/\b\w/g, (m: string) => m.toUpperCase())
            : "Uncategorized"
          const colors: Color[] = Array.isArray(p.colors) ? p.colors.map((c: any) => ({
            name: c.name || "", code: c.code || c.value || "",
            value: c.value || c.code || "", available: c.available !== false
          })) : []
          return {
            id: p.id || p._id, name: p.name,
            image: getImageUrl(p.images?.[0]), images: p.images || [],
            price: `Rs. ${Number(p.price || 0).toLocaleString()}`,
            originalPrice: p.originalPrice ? `Rs. ${Number(p.originalPrice).toLocaleString()}` : undefined,
            numericPrice: Number(p.price || 0), category: humanCat,
            inStock: (p.stock ?? 0) > 0, rating: Number(p.rating || 0),
            colors, stock: p.stock || 0,
          }
        })
        setAllProducts(mapped)
        const cats = Array.from(new Set(mapped.map((m: Product) => m.category))).filter(Boolean)
        setCategories(["All", ...cats])
      } catch (e) {
        console.error("Failed to load products:", e)
        setAllProducts([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
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
            const productIds = (data.wishlist || []).map((item: any) => item.productId?._id || item.productId)
            setWishlist(productIds)
            localStorage.setItem("wishlist", JSON.stringify(productIds))
          } else {
            const saved = localStorage.getItem("wishlist")
            if (saved) setWishlist(JSON.parse(saved))
          }
        } else {
          const saved = localStorage.getItem("wishlist")
          if (saved) setWishlist(JSON.parse(saved))
        }
      } catch {
        const saved = localStorage.getItem("wishlist")
        if (saved) setWishlist(JSON.parse(saved))
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

  // --- Logic Functions ---
  const toggleWishlist = async (productId: string | number) => {
    try {
      const userData = localStorage.getItem("user")
      if (!userData) { window.location.href = "/login"; return }
      const user = JSON.parse(userData)
      const isIn = wishlist.includes(productId)
      if (isIn) {
        const res = await fetch(`${API_BASE_URL}/api/wishlist/${user.id}/remove/${productId}`, { method: 'DELETE' })
        if (res.ok) {
          const next = wishlist.filter(id => id !== productId)
          setWishlist(next); localStorage.setItem("wishlist", JSON.stringify(next))
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/wishlist/${user.id}/add`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (res.ok) {
          const next = [...wishlist, productId]
          setWishlist(next); localStorage.setItem("wishlist", JSON.stringify(next))
        }
      }
    } catch {
      const next = wishlist.includes(productId)
        ? wishlist.filter(id => id !== productId) : [...wishlist, productId]
      setWishlist(next); localStorage.setItem("wishlist", JSON.stringify(next))
    }
  }

  const openAddToCartModal = async (product: Product) => {
    setSelectedProductForCart(product); setSelectedSize(null); setSelectedColor(null)
    setQuantity(1); setIsAddToCartModalOpen(true)
    document.body.style.overflow = 'hidden'; setLoadingProductDetails(true)
    try {
      const raw = API_BASE_URL
      const base = raw.endsWith("/api") ? raw : `${raw.replace(/\/$/, "")}/api`
      let res = await fetch(`/api/limited-edition/${product.id}`, { cache: "no-store" })
      if (!res.ok) res = await fetch(`${base}/product-pages/${product.id}`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setProductDetails({ sizes: data.sizes || [], colors: data.colors || [] })
      } else {
        setProductDetails({ sizes: [], colors: product.colors || [] })
      }
    } catch {
      setProductDetails({ sizes: [], colors: product.colors || [] })
    } finally { setLoadingProductDetails(false) }
  }

  const closeAddToCartModal = () => {
    setIsAddToCartModalOpen(false); document.body.style.overflow = 'unset'
    setTimeout(() => {
      setSelectedProductForCart(null); setProductDetails(null)
      setSelectedSize(null); setSelectedColor(null); setQuantity(1)
    }, 300)
  }

  const handleAddToCartFromModal = () => {
    if (!selectedProductForCart) return
    if (productDetails?.sizes?.length && !selectedSize) return
    if (productDetails?.colors?.length && !selectedColor) return
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
      productId: String(selectedProductForCart.id), name: selectedProductForCart.name,
      price: selectedProductForCart.numericPrice,
      originalPrice: selectedProductForCart.originalPrice ? parseFloat(selectedProductForCart.originalPrice.replace(/[^\d.]/g, '')) : undefined,
      image: selectedProductForCart.image, quantity,
      size: selectedSizeValue ?? undefined, color: selectedColorName ?? undefined, colorCode: selectedColorCode ?? undefined, category: selectedProductForCart.category
    })
    closeAddToCartModal()
  }

  // --- Filtering & Sorting ---
  const getFilteredProducts = (): Product[] => {
    let filtered = allProducts
    if (activeCategory !== "All") filtered = filtered.filter(p => p.category === activeCategory)
    if (searchQuery) filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    filtered = filtered.filter(p => p.numericPrice >= priceRange[0] && p.numericPrice <= priceRange[1])
    if (availability === "in-stock") filtered = filtered.filter(p => p.inStock)
    else if (availability === "out-of-stock") filtered = filtered.filter(p => !p.inStock)
    switch (sortBy) {
      case "price-low": filtered.sort((a, b) => a.numericPrice - b.numericPrice); break
      case "price-high": filtered.sort((a, b) => b.numericPrice - a.numericPrice); break
      default: break
    }
    return filtered
  }

  const filteredProducts = getFilteredProducts()
  const totalProducts = filteredProducts.length
  const totalPages = Math.ceil(totalProducts / productsPerPage)
  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

  // Category stats
  const getCategoryCount = (cat: string) => {
    if (cat === "All") return allProducts.length
    return allProducts.filter(p => p.category === cat).length
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      <div className="relative z-10 pt-28 pb-16 px-0 md:px-8 flex-1">
        <div className="max-w-[1400px] mx-auto px-2 sm:px-12">

          <div className="mb-6 md:mb-14 px-2 sm:px-0">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[10px] font-medium tracking-[0.25em] uppercase text-stone-400 mb-0">
              <Link href="/" className="hover:text-stone-900 transition-colors duration-300">Home</Link>
              <span className="w-1 h-1 rounded-full bg-stone-300" />
              <span className="text-stone-900">Collection</span>
            </nav>

            {/* Title & Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4 md:mb-7">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight leading-none">
                  <span className="font-bold text-[#2A2A2A]">The</span>
                  <span className="font-normal italic text-[#6F6F6F]"> Collection</span>
                </h1>
                <p className="text-stone-400 text-sm mt-3 max-w-lg leading-relaxed hidden md:block">
                  Discover our carefully curated selection of premium footwear, designed to complement your unique style.
                </p>
              </motion.div>

              {/* Stats Pills */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex items-center gap-8"
              >
                {[
                  { label: "Products", value: `${allProducts.length}+` },
                  { label: "Categories", value: `${categories.length - 1}` },
                  { label: "In Stock", value: `${allProducts.filter(p => p.inStock).length}` },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-xl font-semibold font-serif text-[#1a1a1a]">{s.value}</span>
                    <span className="text-[9px] uppercase tracking-[0.22em] text-stone-400 mt-0.5">{s.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ========== DESKTOP FILTER BAR ========== */}
            <div className="hidden lg:flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-stone-200/60 pb-5 gap-8">
              <div className="flex items-center gap-8 overflow-x-auto w-full lg:w-auto scrollbar-hide pb-2 lg:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => { setActiveCategory(category); setCurrentPage(1) }}
                    className={`relative text-xs tracking-[0.15em] uppercase font-medium whitespace-nowrap transition-colors duration-300 py-2 ${activeCategory === category ? "text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
                  >
                    {category}
                    <span className="ml-1.5 text-[10px] text-stone-300">({getCategoryCount(category)})</span>
                    {activeCategory === category && (
                      <motion.div layoutId="collectionCategoryIndicator" className="absolute bottom-0 left-0 right-0 h-[1px] bg-stone-900" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-6 lg:gap-8 w-full lg:w-auto justify-between lg:justify-end">
                <div className="relative group flex items-center">
                  <Search className="w-4 h-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                  <input
                    type="text" placeholder="Search"
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-24 focus:w-48 lg:focus:w-56 transition-all duration-500 bg-transparent border-none focus:ring-0 text-xs font-medium uppercase tracking-widest placeholder:text-stone-400 text-stone-900 px-3 outline-none"
                  />
                </div>
                <button
                  onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                  className={`flex items-center gap-2 text-xs font-medium uppercase tracking-widest transition-colors duration-300 ${isAdvancedFilterOpen ? 'text-stone-900' : 'text-stone-400 hover:text-stone-900'}`}
                >
                  <SlidersHorizontal className="w-4 h-4" /><span>Filters</span>
                </button>
                <div className="relative group">
                  <select
                    value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-transparent text-xs font-medium uppercase tracking-widest text-stone-400 group-hover:text-stone-900 outline-none cursor-pointer pr-5 transition-colors duration-300"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-stone-900 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300" />
                </div>
              </div>
            </div>

            {/* Desktop Accordion Filter */}
            <AnimatePresence>
              {isAdvancedFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: "auto", opacity: 1, marginBottom: 40 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="hidden lg:block overflow-hidden"
                >
                  <div className="pt-8 pb-10 border-b border-stone-200/60 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                    <div className="flex flex-col gap-6">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Availability</span>
                      <div className="flex flex-col gap-4">
                        {['all', 'in-stock', 'out-of-stock'].map(status => (
                          <label key={status} className="flex items-center gap-4 cursor-pointer group w-max" onClick={() => setAvailability(status)}>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 ${availability === status ? 'border-stone-900' : 'border-stone-300 group-hover:border-stone-500'}`}>
                              <div className={`w-2 h-2 rounded-full bg-stone-900 transition-transform duration-300 ${availability === status ? 'scale-100' : 'scale-0'}`} />
                            </div>
                            <span className={`text-xs uppercase tracking-widest transition-colors duration-300 ${availability === status ? 'text-stone-900 font-bold' : 'text-stone-500 group-hover:text-stone-900'}`}>
                              {status.replace('-', ' ')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Price Range</span>
                        <span className="text-xs font-medium text-stone-500 tracking-widest">RS. {priceRange[0]} — RS. {priceRange[1]}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="relative w-full">
                          <span className="absolute left-0 bottom-3 text-xs text-stone-400 font-medium">Rs.</span>
                          <input type="number" value={priceRange[0]} onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-full bg-transparent border-b border-stone-200 pb-3 pl-8 text-sm font-medium focus:border-stone-900 outline-none transition-colors" />
                        </div>
                        <div className="w-4 h-[1px] bg-stone-300 shrink-0" />
                        <div className="relative w-full">
                          <span className="absolute left-0 bottom-3 text-xs text-stone-400 font-medium">Rs.</span>
                          <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-full bg-transparent border-b border-stone-200 pb-3 pl-8 text-sm font-medium focus:border-stone-900 outline-none transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ========== MOBILE HEADER ========== */}
            <div className="flex lg:hidden items-center gap-3 mb-6 mt-4">
              {!isMobileSearchOpen && (
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsFilterSheetOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-stone-100/80 rounded-full text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-700 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-stone-800" /><span>Filters</span>
                </motion.button>
              )}
              <div className="relative flex items-center">
                {isMobileSearchOpen ? (
                  <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: "200px", opacity: 1 }} className="relative h-9">
                    <input autoFocus type="text" placeholder="SEARCH..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => !searchQuery && setIsMobileSearchOpen(false)}
                      className="w-full h-full pl-9 pr-9 bg-white/90 backdrop-blur-sm border border-stone-100/80 rounded-full text-[10px] font-semibold uppercase tracking-widest outline-none shadow-[0_2px_12px_rgba(0,0,0,0.04)]" />
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <button onClick={() => setIsMobileSearchOpen(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 p-1 rounded-full hover:bg-stone-50">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsMobileSearchOpen(true)}
                    className="flex items-center justify-center w-9 h-9 bg-white/90 backdrop-blur-sm border border-stone-100/80 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-stone-800">
                    <Search className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* ========== PRODUCT GRID ========== */}
          <div className="w-full min-h-[400px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-stone-300 mb-4" />
                <p className="text-stone-400 font-serif italic">Curating collection...</p>
              </div>
            )}

            {!isLoading && currentProducts.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-md rounded-3xl border border-white shadow-sm text-center mx-2">
                <Filter className="w-8 h-8 text-stone-400 mb-4" />
                <h3 className="text-xl font-serif text-stone-800 mb-2">No items found</h3>
                <p className="text-stone-400 text-sm mb-6">Try adjusting your filters or search terms</p>
                <button onClick={() => { setActiveCategory("All"); setSearchQuery(""); setPriceRange([0, 50000]); setAvailability("all"); setSortBy("featured"); setCurrentPage(1) }}
                  className="px-6 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors">
                  Clear all filters
                </button>
              </motion.div>
            )}

            {!isLoading && currentProducts.length > 0 && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible"
                className="grid grid-cols-2 lg:grid-cols-4 gap-x-2.5 gap-y-8 sm:gap-x-5 sm:gap-y-10">
                {currentProducts.map((product) => (
                  <motion.div key={product.id} variants={itemVariants} className="group relative flex flex-col">
                    <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-white shadow-sm border border-stone-100 group-hover:shadow-2xl transition-all duration-700 ease-[0.25,0.46,0.45,0.94] cursor-pointer">
                      <Link href={`/product/${product.id}`} className="block w-full h-full relative overflow-hidden">
                        <div className="w-full h-full transform transition-transform duration-[600ms] ease-[0.25,0.46,0.45,0.94] group-hover:scale-110">
                          <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[600ms] z-10" />
                        <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-5 translate-y-4 group-hover:translate-y-0 transition-all duration-[600ms] opacity-0 group-hover:opacity-100 hidden md:block">
                          <div className="flex items-center gap-1.5 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-[600ms] delay-75">
                            {product.inStock ? (
                              <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /><span className="text-green-300 text-[10px] font-bold uppercase tracking-wider">In Stock</span></>
                            ) : (
                              <><XCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-red-300 text-[10px] font-bold uppercase tracking-wider">Out of Stock</span></>
                            )}
                          </div>
                          <div className="h-[2px] bg-yellow-400 w-0 group-hover:w-full transition-all duration-[700ms] mb-4" />
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openAddToCartModal(product) }}
                            className="w-full py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-sm shadow-lg hover:bg-white/90 hover:text-stone-900 transition-all duration-[400ms] flex items-center justify-center gap-2 group/btn relative overflow-hidden transform hover:scale-[1.02]">
                            <span className="absolute inset-0 bg-white/40 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-[400ms]" />
                            <ShoppingBag className="w-4 h-4" /><span>Add to Cart</span>
                          </button>
                        </div>
                      </Link>
                      <button onClick={(e) => { e.preventDefault(); toggleWishlist(product.id) }}
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 p-2 rounded-full bg-white/80 backdrop-blur-md border border-white/50 text-stone-600 hover:bg-white hover:text-pink-500 transition-all duration-[400ms] shadow-sm transform hover:scale-110">
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-[400ms] ${wishlist.includes(product.id) ? "fill-pink-500 text-pink-500" : ""}`} />
                      </button>
                    </div>
                    <div className="pt-3 sm:pt-4 text-center group-hover:opacity-50 transition-opacity duration-[600ms]">
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium mb-1">{product.category}</p>
                      <h3 className="font-serif font-bold text-xs sm:text-sm uppercase text-stone-800 tracking-wide mb-1.5 line-clamp-1">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-stone-900 font-medium">{product.price}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 sm:gap-6 mt-16 sm:mt-20">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-white border border-stone-200 text-stone-900 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold shadow-sm flex items-center gap-2 text-xs sm:text-sm">
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" /> <span className="hidden sm:inline">Previous</span>
              </button>
              <div className="font-serif text-stone-500 italic text-xs sm:text-sm">
                Page <span className="font-bold text-stone-900 not-italic">{currentPage}</span> of {totalPages}
              </div>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-stone-900 border border-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">Next</span> <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========== MOBILE FILTER BOTTOM SHEET ========== */}
      {mounted && createPortal(
        <AnimatePresence>
          {isFilterSheetOpen && (
            <div className="fixed inset-0 z-[99999] lg:hidden flex items-end justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }} onClick={() => setIsFilterSheetOpen(false)}
                className="absolute inset-0 bg-white/50 backdrop-blur-md" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] border-t border-white/50 p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] max-h-[85vh] overflow-y-auto">
                <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-8" />
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif font-bold text-stone-900">Filters</h3>
                  <button onClick={() => setIsFilterSheetOpen(false)}
                    className="p-2.5 bg-stone-50 hover:bg-stone-100 transition-colors rounded-full text-stone-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-8">
                  {/* Categories */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Category</span>
                    <div className="flex flex-wrap gap-2.5">
                      {categories.map(cat => (
                        <button key={cat} onClick={() => { setActiveCategory(cat); setCurrentPage(1) }}
                          className={`px-4 py-2.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase transition-all ${activeCategory === cat ? "bg-stone-900 text-white shadow-md border border-stone-900" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Sort */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Sort By</span>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ value: "featured", label: "Featured" }, { value: "newest", label: "Newest" }, { value: "price-low", label: "Price: Low" }, { value: "price-high", label: "Price: High" }].map(opt => (
                        <button key={opt.value} onClick={() => setSortBy(opt.value)}
                          className={`px-3 py-3 rounded-xl text-[10px] font-bold tracking-[0.1em] uppercase text-center transition-all border ${sortBy === opt.value ? "bg-stone-900 text-white border-stone-900 shadow-md" : "bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100"}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[1px] bg-stone-100 w-full" />
                  {/* Availability */}
                  <div className="flex flex-col gap-5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Availability</span>
                    <div className="flex flex-col gap-4">
                      {['all', 'in-stock', 'out-of-stock'].map(status => (
                        <label key={status} className="flex items-center justify-between cursor-pointer group w-full py-1" onClick={() => setAvailability(status)}>
                          <span className={`text-xs uppercase tracking-widest transition-colors duration-300 ${availability === status ? 'text-stone-900 font-bold' : 'text-stone-500'}`}>{status.replace('-', ' ')}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${availability === status ? 'border-stone-900' : 'border-stone-300'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full bg-stone-900 transition-transform duration-300 ${availability === status ? 'scale-100' : 'scale-0'}`} />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.98 }} onClick={() => setIsFilterSheetOpen(false)}
                  className="w-full mt-10 py-5 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-stone-200">
                  Show Results ({filteredProducts.length})
                </motion.button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========== ADD TO CART MODAL ========== */}
      {mounted && isAddToCartModalOpen && selectedProductForCart && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }} className="absolute inset-0 bg-white/40 backdrop-blur-lg backdrop-saturate-150 cursor-pointer"
              onClick={closeAddToCartModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }} transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] w-full max-w-[480px] overflow-hidden border border-white/20"
              onClick={e => e.stopPropagation()}>
              <button onClick={closeAddToCartModal}
                className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-900 hover:text-white transition-all duration-300 transform hover:rotate-90">
                <X className="w-4 h-4" />
              </button>
              <div className="relative">
                <div className="h-48 bg-stone-50 relative overflow-hidden">
                  <motion.img initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }} src={getImageUrl(selectedProductForCart.image)}
                    alt={selectedProductForCart.name} className="w-full h-full object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 pt-0">
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-600 bg-pink-50 self-start px-2 py-1 rounded-md">{selectedProductForCart.category}</span>
                      <h3 className="font-serif font-bold text-stone-900 text-2xl leading-tight">{selectedProductForCart.name}</h3>
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                      <div className="flex items-end justify-between border-b border-stone-100 pb-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Unit Price</span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-stone-900 text-2xl">{selectedProductForCart.price}</span>
                            {selectedProductForCart.originalPrice && <span className="text-stone-300 line-through text-sm">{selectedProductForCart.originalPrice}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /><span className="text-[10px] font-bold uppercase">Ready to Ship</span>
                        </div>
                      </div>
                      <div className="grid gap-6">
                        {productDetails?.sizes && productDetails.sizes.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-[11px] font-bold text-stone-900 uppercase tracking-wider">Select Size</label>
                              <button className="text-[10px] text-stone-400 flex items-center gap-1 hover:text-stone-900 transition-colors"><Info className="w-3 h-3" /> Size Guide</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {productDetails.sizes.map((size, i) => {
                                const key = size.size ?? size.id ?? `size-${i}`
                                return (
                                  <button key={key} onClick={() => setSelectedSize(key)} disabled={!size.available}
                                    className={`relative h-11 px-5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center justify-center border-2 ${selectedSize === key ? "bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-200" : size.available ? "bg-white text-stone-600 border-stone-100 hover:border-stone-300" : "bg-stone-50 text-stone-300 border-transparent cursor-not-allowed"}`}>
                                    {size.size}{!size.available && <div className="absolute inset-x-2 h-[1.5px] bg-stone-200 rotate-[30deg]" />}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {productDetails?.colors && productDetails.colors.length > 0 && (
                          <div className="space-y-3">
                            <label className="text-[11px] font-bold text-stone-900 uppercase tracking-wider">Choose Color</label>
                            <div className="flex flex-wrap gap-3">
                              {productDetails.colors.map((color, idx) => {
                                const colorKey = color.id ?? color.code ?? color.value ?? `color-${idx}`
                                return (
                                  <button key={colorKey} onClick={() => setSelectedColor(colorKey)} disabled={!color.available}
                                    className={`group relative p-1 rounded-full border-2 transition-all duration-300 ${selectedColor === colorKey ? "border-stone-900 scale-110" : "border-transparent hover:border-stone-200"}`}>
                                    <div className="w-8 h-8 rounded-full shadow-inner border border-black/5" style={{ backgroundColor: color.value || color.code }} />
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{color.name}</div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                          <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl gap-1">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="w-8 text-center text-sm font-bold text-stone-900">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Subtotal</span>
                            <span className="text-xl font-bold text-stone-900">Rs. {(selectedProductForCart.numericPrice * quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCartFromModal}
                        className={`w-full py-5 rounded-[1.5rem] font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl ${(productDetails?.sizes?.length && !selectedSize) || (productDetails?.colors?.length && !selectedColor) ? "bg-stone-300 cursor-not-allowed shadow-none" : "bg-stone-900 hover:bg-stone-800 shadow-stone-200"}`}>
                        <ShoppingBag className="w-5 h-5" /><span>Add to Cart</span>
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
    </div>
  )
}

export default function CollectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-stone-300" />
      </div>
    }>
      <CollectionContent />
    </Suspense>
  )
}
