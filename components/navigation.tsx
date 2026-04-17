"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Menu, User, ShoppingBag, X, CheckCircle, Minus, Plus, Trash2, Search, Heart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import { MainCart } from "@/components/MainCart"
import { API_BASE_URL } from "@/lib/api-config"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCartClosing, setIsCartClosing] = useState(false)
  const [isNavVisible, setIsNavVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Dynamic categories for Collection dropdown
  const [navCategories, setNavCategories] = useState<{name: string, href: string, count: number}[]>([])

  const router = useRouter()
  const pathname = usePathname()
  const { getTotalItems, cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart()

  const isAdminPage = pathname?.startsWith("/admin") ?? false

  const normalizePrice = (price: number): number => {
    if (price < 1) return price * 10000
    return price
  }

  const getCorrectedTotalPrice = (): number => {
    return cartItems.reduce((total, item) => {
      const correctedPrice = normalizePrice(item.price)
      return total + correctedPrice * item.quantity
    }, 0)
  }

  const handleCloseCart = () => {
    setIsCartClosing(true)
    setTimeout(() => {
      setIsCartOpen(false)
      setIsCartClosing(false)
    }, 300)
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY < lastScrollY) {
        setIsNavVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false)
      }
      setLastScrollY(currentScrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsLoggedIn(true)
    }
  }, [])

  useEffect(() => {
    const handleOpenCartPanel = () => {
      setIsCartOpen(true)
      setIsCartClosing(false)
    }

    window.addEventListener('openCartPanel', handleOpenCartPanel)

    return () => {
      window.removeEventListener('openCartPanel', handleOpenCartPanel)
    }
  }, [])

  // Fetch admin-panel categories from backend for Collection dropdown
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories?status=active`, { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        const cats = Array.isArray(data.categories) ? data.categories : []
        const catList = cats.map((cat: any) => ({
          name: cat.name,
          href: `/collection?cat=${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
          count: 0 // count will be populated below
        }))

        // Now fetch product counts per category
        try {
          const prodRes = await fetch("/api/products?sortBy=createdAt&sortOrder=desc", { cache: "no-store" })
          if (prodRes.ok) {
            const prodData = await prodRes.json()
            const items = Array.isArray(prodData.products) ? prodData.products : []
            const countMap: Record<string, number> = {}
            items.forEach((p: any) => {
              const pCat = typeof p.category === "string"
                ? p.category.replace(/-/g, " ").replace(/\b\w/g, (m: string) => m.toUpperCase())
                : ""
              if (pCat) countMap[pCat] = (countMap[pCat] || 0) + 1
            })
            catList.forEach((c: any) => {
              c.count = countMap[c.name] || 0
            })
          }
        } catch { /* ignore count fetch errors */ }

        setNavCategories(catList)
      } catch (e) {
        console.error("Failed to load nav categories:", e)
      }
    }
    fetchCategories()
  }, [])

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (isSignUp) {
      if (!firstName.trim()) errors.firstName = "First name is required"
      if (!lastName.trim()) errors.lastName = "Last name is required"
      if (password.length < 6) errors.password = "Password must be at least 6 characters"
      if (password !== confirmPassword) errors.confirmPassword = "Passwords don't match"
    }
    if (!email.trim()) errors.email = "Email is required"
    if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email is invalid"
    if (!password.trim()) errors.password = "Password is required"
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    if (email === "admin@gmail.com" && password === "admin") {
      setIsSignInModalOpen(false)
      setIsLoading(false)
      router.push("/admin/dashboard")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        setIsLoggedIn(true)
        setIsSignInModalOpen(false)
        setEmail("")
        setPassword("")
        window.dispatchEvent(new CustomEvent("userLogin"))
        router.push("/profile")
      } else {
        if (response.status === 404) setError("Email not found. Please check your email or register first.")
        else if (response.status === 401) setError("Invalid password. Please try again.")
        else setError(data.message || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    if (!validateForm()) {
      setIsLoading(false)
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })
      const data = await response.json()
      if (response.ok) {
        setShowSuccessMessage(true)
        setFirstName("")
        setLastName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setValidationErrors({})
        setTimeout(() => {
          setShowSuccessMessage(false)
          setIsSignUp(false)
        }, 2000)
      } else {
        setError(data.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    setIsLoggedIn(false)
    setIsProfileDropdownOpen(false)
    window.dispatchEvent(new CustomEvent("userLogout"))
    router.push("/")
  }

  const navLinks = [
    { name: "Home", href: "/collection?sort=new" },
    { name: "Collection", href: "/collection" },
    { name: "Gallary", href: "/collection?cat=accessories" },
    { name: "Sale", href: "/about" },
    { name: "Orchidalle", href: "/contact" },
  ]

  if (isAdminPage) {
    return null
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out bg-white/80 backdrop-blur-2xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.03)] ${isNavVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
      >
        <div className="max-w-[1400px] 2xl:max-w-[1800px] mx-auto px-4 lg:px-12 2xl:px-16">
          {/* Main Navbar Container */}
          <div className="flex items-center justify-between h-20 2xl:h-24 relative">

            {/* Left Section */}
            <div className="flex items-center gap-2 md:gap-4 2xl:gap-6 w-1/3 md:w-auto z-10">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-stone-800 hover:text-stone-600 hover:bg-transparent transition-transform hover:scale-110"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5 2xl:h-6 2xl:w-6 stroke-[1.5]" /> : <Menu className="h-5 w-5 2xl:h-6 2xl:w-6 stroke-[1.5]" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-stone-800 hover:text-stone-600 hover:bg-transparent transition-transform hover:scale-110"
              >
                <Search className="h-5 w-5 2xl:h-6 2xl:w-6 stroke-[1.5]" />
              </Button>

              <div className="hidden md:block animate-slide-in-left">
                <Link href="/" className="group">
                  <h1 className="text-3xl 2xl:text-4xl font-serif font-black text-stone-900 tracking-wider group-hover:opacity-80 transition-opacity">
                    EVORA
                  </h1>
                </Link>
              </div>
            </div>

            {/* Center Section */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex justify-center items-center z-10">
              <Link href="/" className="md:hidden group animate-slide-in-down">
                <h1 className="text-2xl font-serif font-black text-stone-900 tracking-wider group-hover:opacity-80 transition-opacity">
                  EVORA
                </h1>
              </Link>

              <div className="hidden md:flex items-center justify-center space-x-8 lg:space-x-12 2xl:space-x-16">
                {navLinks.map((link) => (
                  <div key={link.name} className="relative group/nav flex items-center h-full">
                    <Link
                      href={link.href}
                      className="relative group py-2 2xl:py-3"
                    >
                      <span className="text-xs lg:text-sm 2xl:text-base font-medium tracking-[0.2em] uppercase text-stone-800 transition-colors duration-300 group-hover:text-stone-600">
                        {link.name}
                      </span>
                      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] 2xl:h-[2px] bg-stone-800 transition-all duration-300 ease-out group-hover:w-full" />
                    </Link>

                    {/* Collection Dropdown - Nav Background Applied */}
                    {link.name === "Collection" && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-500 ease-out z-50">
                        <div className="absolute -top-10 left-0 w-full h-16"></div>

                        {/* ✅ Nav bar eke exact same background */}
                        <div className="w-64 2xl:w-72 bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-[24px] p-2.5 2xl:p-3 mt-6 2xl:mt-8 transform origin-top -translate-y-4 scale-95 group-hover/nav:translate-y-0 group-hover/nav:scale-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
                          <div className="flex flex-col gap-1.5">
                            {navCategories.map((subItem, index) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="relative overflow-hidden group/sub py-4 px-6 rounded-[18px] transition-all duration-300 hover:bg-white/60 flex items-center justify-between border border-transparent hover:border-white/40"
                              >
                                <div className="flex flex-col">
                                  <span
                                    className="text-stone-800 text-sm 2xl:text-base font-semibold tracking-wider transition-all duration-300 group-hover/sub:translate-x-1"
                                    style={{ transitionDelay: `${index * 50}ms` }}
                                  >
                                    {subItem.name}
                                  </span>
                                  <span className="text-[10px] 2xl:text-xs text-stone-400 font-medium tracking-widest uppercase mt-0.5 group-hover/sub:translate-x-1 transition-all duration-300">
                                    {subItem.count} {subItem.count === 1 ? "Item" : "Items"}
                                  </span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-stone-300 group-hover/sub:text-stone-800 group-hover/sub:translate-x-1 transition-all duration-300" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-end gap-2 lg:gap-4 2xl:gap-6 animate-slide-in-right w-1/3 md:w-auto z-10">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex text-stone-800 hover:text-stone-600 hover:bg-transparent transition-transform hover:scale-110"
              >
                <Search className="h-5 w-5 2xl:h-6 2xl:w-6 stroke-[1.5]" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex text-stone-800 hover:text-stone-600 hover:bg-transparent transition-transform hover:scale-110"
              >
                <Heart className="h-5 w-5 2xl:h-6 2xl:w-6 stroke-[1.5]" />
              </Button>

              <div className="h-4 2xl:h-5 w-[1px] bg-stone-300 hidden md:block mx-1"></div>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-stone-800 hover:text-stone-600 hover:bg-transparent transition-transform hover:scale-110"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <User className="h-5 w-5 2xl:h-6 2xl:w-6 stroke-[1.5]" />
                </Button>

                {isProfileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-6 2xl:mt-8 w-60 2xl:w-72 bg-white/80 backdrop-blur-2xl rounded-[24px] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-3 2xl:p-4 animate-in fade-in zoom-in-95 duration-300 ease-out z-50">
                    <div className="flex flex-col gap-1">
                      {isLoggedIn ? (
                        <>
                          <div className="text-xs 2xl:text-sm font-semibold text-stone-600 uppercase tracking-wider py-2 2xl:py-2.5 px-4 2xl:px-5 border-b border-stone-200/40 mb-2">
                            {user?.firstName} {user?.lastName}
                          </div>
                          <Link
                            href="/profile"
                            className="text-stone-800 text-sm 2xl:text-base hover:bg-white/60 hover:translate-x-1 py-2.5 2xl:py-3 px-4 2xl:px-5 rounded-xl transition-all duration-300 text-left font-medium"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            My Account
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="text-red-500 text-sm 2xl:text-base hover:bg-red-50/50 hover:translate-x-1 py-2.5 2xl:py-3 px-4 2xl:px-5 rounded-xl transition-all duration-300 text-left font-medium"
                          >
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsSignInModalOpen(true)
                              setIsProfileDropdownOpen(false)
                            }}
                            className="text-stone-800 text-sm 2xl:text-base hover:bg-white/60 hover:translate-x-1 py-2.5 2xl:py-3 px-4 2xl:px-5 rounded-xl transition-all duration-300 text-left font-medium"
                          >
                            Sign In
                          </button>
                          <Link
                            href="/profile"
                            className="text-stone-600 text-sm 2xl:text-base hover:bg-white/60 hover:translate-x-1 py-2.5 2xl:py-3 px-4 2xl:px-5 rounded-xl transition-all duration-300 text-left font-medium"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Help Center
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="text-stone-800 hover:text-stone-600 hover:bg-transparent transition-transform hover:scale-110 relative"
              >
                <ShoppingBag className="h-5 w-5 2xl:h-6 2xl:w-6 stroke-[1.5]" />
                {getTotalItems() > 0 && (
                  <span className="absolute top-0 right-0 bg-stone-900 text-white text-[10px] 2xl:text-xs font-bold rounded-full w-4 h-4 2xl:w-5 2xl:h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/80 backdrop-blur-2xl border-b border-t border-white/40 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] animate-in slide-in-from-top-4 fade-in duration-500 ease-out overflow-hidden">
              <div className="flex flex-col p-6 2xl:p-8 space-y-2">
                {navLinks.map((link) => (
                  <div key={link.name} className="flex flex-col">
                    <Link
                      href={link.href}
                      className="text-stone-800 hover:text-stone-500 font-medium text-lg 2xl:text-xl tracking-wide py-3 2xl:py-4 border-b border-white/30 hover:pl-4 transition-all duration-300 hover:bg-white/20 rounded-lg px-2"
                      onClick={() => link.name !== "Collection" && setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                    {link.name === "Collection" && (
                      <div className="flex flex-col pl-6 mt-1 space-y-1 animate-in slide-in-from-top-2 fade-in duration-300">
                        {navCategories.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="text-stone-600 hover:text-stone-900 font-medium text-base py-2 hover:pl-2 transition-all duration-300"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Sign In Modal */}
      {isSignInModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 2xl:p-6">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsSignInModalOpen(false)} />

          <div className="relative w-full max-w-md 2xl:max-w-lg bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl 2xl:rounded-3xl p-8 2xl:p-10 shadow-2xl transform transition-all duration-300 ease-out scale-100 animate-fade-in-up">
            <button
              onClick={() => setIsSignInModalOpen(false)}
              className="absolute top-4 2xl:top-6 right-4 2xl:right-6 text-stone-400 hover:text-stone-800 transition-colors z-10"
            >
              <X className="h-5 w-5 2xl:h-6 2xl:w-6" />
            </button>

            <div className="space-y-6 2xl:space-y-8 relative z-10">
              {showSuccessMessage && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-xl rounded-2xl 2xl:rounded-3xl z-20">
                  <div className="text-center animate-fade-in-up">
                    <CheckCircle className="h-16 w-16 2xl:h-20 2xl:w-20 text-green-600 mx-auto mb-4 2xl:mb-6 animate-bounce" />
                    <h3 className="text-2xl 2xl:text-3xl font-bold text-stone-800 mb-2 2xl:mb-3">Welcome to EVORA!</h3>
                    <p className="text-stone-500 text-sm 2xl:text-base">Redirecting to login...</p>
                  </div>
                </div>
              )}

              <div className="text-center">
                <h2 className="text-3xl 2xl:text-4xl font-serif font-bold text-stone-900 mb-2 2xl:mb-3 tracking-tight">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-stone-500 text-sm 2xl:text-base">
                  {isSignUp ? "Join the world of luxury" : "Sign in to access your wishlist"}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <form className="space-y-4 2xl:space-y-5" onSubmit={isSignUp ? handleSignUp : handleSignIn}>
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-3 2xl:gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 2xl:px-5 py-3 2xl:py-4 rounded-lg 2xl:rounded-xl bg-white border border-stone-200 text-stone-800 text-sm 2xl:text-base placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 2xl:px-5 py-3 2xl:py-4 rounded-lg 2xl:rounded-xl bg-white border border-stone-200 text-stone-800 text-sm 2xl:text-base placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 2xl:px-5 py-3 2xl:py-4 rounded-lg 2xl:rounded-xl bg-white border border-stone-200 text-stone-800 text-sm 2xl:text-base placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 2xl:px-5 py-3 2xl:py-4 rounded-lg 2xl:rounded-xl bg-white border border-stone-200 text-stone-800 text-sm 2xl:text-base placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
                {isSignUp && (
                  <div>
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 2xl:px-5 py-3 2xl:py-4 rounded-lg 2xl:rounded-xl bg-white border border-stone-200 text-stone-800 text-sm 2xl:text-base placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 2xl:py-4 px-6 2xl:px-8 bg-stone-900 text-white rounded-lg 2xl:rounded-xl font-medium hover:bg-stone-800 transition-all duration-300 shadow-lg transform hover:scale-[1.01] uppercase tracking-wider text-sm 2xl:text-base disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
                </button>
              </form>

              <div className="text-center mt-4 2xl:mt-6">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-stone-500 hover:text-stone-900 text-sm 2xl:text-base font-medium transition-colors underline decoration-stone-300 underline-offset-4"
                >
                  {isSignUp ? "Already have an account? Sign In" : "New to EVORA? Create Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Popup */}
      {isCartOpen && (
        <MainCart
          isCartClosing={isCartClosing}
          handleCloseCart={handleCloseCart}
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          normalizePrice={normalizePrice}
          getCorrectedTotalPrice={getCorrectedTotalPrice}
        />
      )}
    </>
  )
}