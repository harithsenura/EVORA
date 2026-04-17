"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { TruckButton } from "@/components/ui/truck-button"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, MapPin, CreditCard, Truck, CheckCircle, UserIcon, Phone, Mail, Upload, X as XIcon, Building2, ChevronRight } from "lucide-react"
import { API_BASE_URL, getImageUrl } from "@/lib/api-config"

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
}

interface Address {
  _id: string
  type: "home" | "work" | "billing" | "shipping"
  label: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  createdAt: string
}

interface PaymentCard {
  _id: string
  cardType: "visa" | "mastercard" | "amex" | "discover"
  cardNumber: string
  cardHolderName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  isDefault: boolean
  createdAt: string
}

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
}

export default function CheckoutPage() {
  const { cartItems, getTotalPrice, getTotalItems, clearCart } = useCart()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"bankTransfer" | "cod">("cod")
  const [transactionSlip, setTransactionSlip] = useState<string | null>(null)
  const [transactionSlipFile, setTransactionSlipFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [checkoutSettings, setCheckoutSettings] = useState({
    shippingPrice: 500,
    isShippingFree: false,
    globalDiscount: 0,
  })
  const router = useRouter()

  // Guest checkout fields
  const [guestFirstName, setGuestFirstName] = useState("")
  const [guestLastName, setGuestLastName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  
  // Registered user phone number (optional, can be edited)
  const [userPhone, setUserPhone] = useState("")
  const [userPhoneError, setUserPhoneError] = useState("")
  const [guestPhoneError, setGuestPhoneError] = useState("")

  const [guestAddress, setGuestAddress] = useState({
    type: "shipping" as Address["type"],
    label: "Shipping Address",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Sri Lanka",
  })

  const [guestCard, setGuestCard] = useState({
    cardType: "visa" as PaymentCard["cardType"],
    cardNumber: "",
    cardHolderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  })

  const normalizePrice = (price: number): number => {
    if (price < 1) {
      return price * 10000
    }
    return price
  }

  const getCorrectedTotalPrice = (): number => {
    return cartItems.reduce((total, item) => {
      const correctedPrice = normalizePrice(item.price)
      return total + correctedPrice * item.quantity
    }, 0)
  }

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", minimumFractionDigits: 2 })
        .format(amount)
        .replace("LKR", "Rs.")
    } catch {
      return `Rs. ${amount.toFixed(2)}`
    }
  }

  useEffect(() => {
    try {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(media.matches)
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      media.addEventListener?.("change", handler)
    } catch {}

    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUserProfile(parsedUser)
      setUserPhone(parsedUser.phone || "")
      loadUserData(parsedUser.id)
    } else {
      // Guest checkout
      setIsLoading(false)
    }
    loadCheckoutSettings()
  }, [router])

  const loadCheckoutSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkout-settings`)
      if (response.ok) {
        const data = await response.json()
        setCheckoutSettings(data.settings)
      }
    } catch (error) {
      console.error("Error loading checkout settings:", error)
    }
  }

  // Validate phone number format (Sri Lankan format: 07XXXXXXXX or +947XXXXXXXX)
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone || phone.trim() === "") return true // Optional, so empty is valid
    
    // Remove spaces, dashes, and plus signs for validation
    const cleaned = phone.replace(/[\s\-+]/g, "")
    
    // Check if it's all digits
    if (!/^\d+$/.test(cleaned)) return false
    
    // Check for Sri Lankan mobile format: 07XXXXXXXX (10 digits) or 947XXXXXXXX (9 digits after country code)
    // Also allow shorter numbers like 0XX-XXXXXXX
    if (cleaned.length >= 9 && cleaned.length <= 12) {
      // Check if it starts with 0 or 94
      if (cleaned.startsWith("0") || cleaned.startsWith("94")) {
        return true
      }
    }
    
    return false
  }

  const handleUserPhoneChange = (value: string) => {
    setUserPhone(value)
    if (value.trim() === "") {
      setUserPhoneError("Please enter phone number")
    } else if (!validatePhoneNumber(value)) {
      setUserPhoneError("Please enter a valid mobile number (e.g., 07XXXXXXXX)")
    } else {
      setUserPhoneError("")
    }
  }

  const handleGuestPhoneChange = (value: string) => {
    setGuestPhone(value)
    if (value.trim() === "") {
      setGuestPhoneError("Please enter phone number")
    } else if (!validatePhoneNumber(value)) {
      setGuestPhoneError("Please enter a valid mobile number (e.g., 07XXXXXXXX)")
    } else {
      setGuestPhoneError("")
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      const [addressesResponse, cardsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user-profile/${userId}/addresses`),
        fetch(`${API_BASE_URL}/api/user-profile/${userId}/payment-cards`),
      ])

      if (addressesResponse.ok) {
        const addressesData = await addressesResponse.json()
        setAddresses(addressesData.addresses)

        const defaultAddress = addressesData.addresses.find((addr: Address) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress)
        } else if (addressesData.addresses.length > 0) {
          setSelectedAddress(addressesData.addresses[0])
        }
      }

      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json()
        setPaymentCards(cardsData.paymentCards)

        const defaultCard = cardsData.paymentCards.find((card: PaymentCard) => card.isDefault)
        if (defaultCard) {
          setSelectedCard(defaultCard)
        } else if (cardsData.paymentCards.length > 0) {
          setSelectedCard(cardsData.paymentCards[0])
        }
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error loading user data:", error)
      setIsLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    // Validate phone numbers - phone number is required
    if (userProfile) {
      if (!userPhone || userPhone.trim() === "") {
        setUserPhoneError("Please enter phone number")
        alert("Please enter phone number")
        return
      }
      if (!validatePhoneNumber(userPhone)) {
        setUserPhoneError("Please enter a valid mobile number (e.g., 07XXXXXXXX)")
        alert("Please enter a valid mobile number (e.g., 07XXXXXXXX)")
        return
      }
    } else {
      if (!guestPhone || guestPhone.trim() === "") {
        setGuestPhoneError("Please enter phone number")
        alert("Please enter phone number")
        return
      }
      if (!validatePhoneNumber(guestPhone)) {
        setGuestPhoneError("Please enter a valid mobile number (e.g., 07XXXXXXXX)")
        alert("Please enter a valid mobile number (e.g., 07XXXXXXXX)")
        return
      }
    }

    // Validate address
    if (userProfile) {
      if (!selectedAddress) {
        alert("Please select a shipping address")
        return
      }
      if (selectedPaymentMethod === "bankTransfer" && !transactionSlip) {
        alert("Please upload your transaction slip")
        return
      }
    } else {
      // Guest validations
      if (!guestFirstName || !guestLastName || !guestEmail) {
        alert("Please fill your name and email")
        return
      }
      const { street, city, state, zipCode, country } = guestAddress
      if (!street || !city || !state || !zipCode || !country) {
        alert("Please fill your shipping address")
        return
      }
      if (selectedPaymentMethod === "bankTransfer" && !transactionSlip) {
        alert("Please upload your transaction slip")
        return
      }
    }

    setIsProcessing(true)

    try {
      const correctedSubtotal = getCorrectedTotalPrice()
      const orderData: any = {
        userId: userProfile?.id,
        guestDetails: userProfile ? undefined : {
          firstName: guestFirstName,
          lastName: guestLastName,
          email: guestEmail,
          phone: guestPhone || undefined,
        },
        // Include phone for registered users if provided
        phone: userProfile ? (userPhone || undefined) : undefined,
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: normalizePrice(item.price),
          originalPrice: item.originalPrice ? normalizePrice(item.originalPrice) : null,
          image: item.image,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          category: item.category,
        })),
        shippingAddress: userProfile ? {
          type: selectedAddress!.type,
          label: selectedAddress!.label,
          street: selectedAddress!.street,
          city: selectedAddress!.city,
          state: selectedAddress!.state,
          zipCode: selectedAddress!.zipCode,
          country: selectedAddress!.country,
        } : {
          type: guestAddress.type,
          label: guestAddress.label,
          street: guestAddress.street,
          city: guestAddress.city,
          state: guestAddress.state,
          zipCode: guestAddress.zipCode,
          country: guestAddress.country,
        },
        paymentMethod: selectedPaymentMethod === "cod"
          ? {
              type: "cod",
              cardType: "cod",
              cardNumber: "N/A",
              cardHolderName: "Cash on Delivery",
              expiryMonth: "N/A",
              expiryYear: "N/A",
            }
          : {
              type: "bankTransfer",
              cardType: "bankTransfer",
              cardNumber: "N/A",
              cardHolderName: "Bank Transfer",
              expiryMonth: "N/A",
              expiryYear: "N/A",
              transactionSlip: transactionSlip || null,
            },
        subtotal: correctedSubtotal,
        shipping: checkoutSettings.isShippingFree ? 0 : checkoutSettings.shippingPrice,
        tax: 0,
        discount: checkoutSettings.globalDiscount > 0 ? (correctedSubtotal * checkoutSettings.globalDiscount) / 100 : 0,
        total:
          correctedSubtotal +
          (checkoutSettings.isShippingFree ? 0 : checkoutSettings.shippingPrice) -
          (checkoutSettings.globalDiscount > 0 ? (correctedSubtotal * checkoutSettings.globalDiscount) / 100 : 0),
      }

      console.log("Sending order data:", orderData)
      console.log("Guest details being sent:", orderData.guestDetails)
      console.log("User profile:", userProfile)

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      const responseData = await response.json()
      console.log("Order response:", responseData)

      if (response.ok) {
        clearCart()

        alert(`Order placed successfully! Order Number: ${responseData.order.orderNumber}`)
        if (userProfile) {
          router.push("/profile?tab=orders")
        } else {
          router.push("/")
        }
      } else {
        console.error("Order creation failed:", responseData)
        alert(`Failed to place order: ${responseData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="pt-20 pb-12 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 w-48 rounded bg-white/60 animate-pulse" />
              <div className="rounded-lg border border-stone-200 bg-white/80 backdrop-blur-xl p-6 space-y-3">
                <div className="h-5 w-36 rounded bg-stone-200/60 animate-pulse" />
                <div className="h-4 w-64 rounded bg-stone-200/50 animate-pulse" />
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="h-12 rounded bg-stone-200/50 animate-pulse" />
                  <div className="h-12 rounded bg-stone-200/50 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white/80 backdrop-blur-xl p-6 space-y-3 h-fit">
              <div className="h-5 w-32 rounded bg-stone-200/60 animate-pulse" />
              <div className="space-y-2">
                <div className="h-16 rounded bg-stone-200/50 animate-pulse" />
                <div className="h-16 rounded bg-stone-200/50 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center py-16 bg-white/80 backdrop-blur-xl rounded-lg border border-stone-200 shadow-sm">
              <Truck className="w-20 h-20 text-stone-400 mx-auto mb-4" />
              <h1 className="text-2xl font-serif font-bold text-stone-900 mb-3">Your Cart is Empty</h1>
              <p className="text-stone-600 mb-6 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
              </p>
              <Link href="/products">
                <Button className="bg-stone-900 text-white px-6 py-2 rounded-lg hover:bg-stone-800 transition-colors">
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setTransactionSlip(base64String)
        setTransactionSlipFile(file)
        // Store in local storage
        localStorage.setItem(`transactionSlip_${Date.now()}`, base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeTransactionSlip = () => {
    setTransactionSlip(null)
    setTransactionSlipFile(null)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      <div className="relative z-10 pt-28 pb-16 px-0 md:px-8 flex-1">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-12">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] font-medium tracking-[0.25em] uppercase text-stone-400 mb-0 px-2 sm:px-0">
            <Link href="/" className="hover:text-stone-900 transition-colors duration-300">Home</Link>
            <span className="w-1 h-1 rounded-full bg-stone-300" />
            <Link href="/cart" className="hover:text-stone-900 transition-colors duration-300">Cart</Link>
            <span className="w-1 h-1 rounded-full bg-stone-300" />
            <span className="text-stone-900">Checkout</span>
          </nav>

          {/* Title & Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14 px-2 sm:px-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight leading-none">
                <span className="font-bold text-[#2A2A2A]">Secure</span>
                <span className="font-normal italic text-[#6F6F6F]"> Checkout</span>
              </h1>
              <p className="text-stone-400 text-sm mt-3 max-w-lg leading-relaxed hidden md:block">
                Complete your purchase securely. Your personal and payment data is encrypted and protected at every step of the way.
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
                { label: "Security", value: "SSL" },
                { label: "Privacy", value: "AES-256" },
                { label: "Authenticity", value: "100%" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xl font-semibold font-serif text-[#1a1a1a]">{s.value}</span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-stone-400 mt-0.5">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              {/* Customer Information */}
              <motion.div variants={sectionVariants} className="bg-white rounded-[2rem] border border-stone-100 p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-900 border border-stone-100">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Customer Details</h2>
                </div>
                
                {userProfile ? (
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">Full Name</span>
                        <div className="w-full px-4 py-3 bg-stone-50/50 border border-stone-100 rounded-xl text-stone-900 font-serif text-base">
                          {userProfile?.firstName} {userProfile?.lastName}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">Email Address</span>
                        <div className="w-full px-4 py-3 bg-stone-50/50 border border-stone-100 rounded-xl text-stone-900 font-medium text-sm">
                          {userProfile?.email}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">Contact Number</span>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                          className={`w-full bg-white border px-4 py-3 pl-10 rounded-xl text-sm font-medium transition-all outline-none ${
                            userPhoneError
                              ? "border-red-200 focus:border-red-400 text-red-900"
                              : "border-stone-100 focus:border-stone-900 text-stone-900"
                          }`}
                          placeholder="07XXXXXXXX"
                          type="tel"
                          value={userPhone}
                          onChange={(e) => handleUserPhoneChange(e.target.value)}
                        />
                      </div>
                      {userPhoneError && (
                        <p className="text-red-500 text-[9px] font-bold uppercase tracking-wider mt-1.5 ml-1">{userPhoneError}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">First Name</span>
                      <input
                        className="w-full bg-white border border-stone-100 px-4 py-3 rounded-xl text-sm font-medium focus:border-stone-900 transition-all outline-none"
                        placeholder="John"
                        value={guestFirstName}
                        onChange={(e) => setGuestFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">Last Name</span>
                      <input
                        className="w-full bg-white border border-stone-100 px-4 py-3 rounded-xl text-sm font-medium focus:border-stone-900 transition-all outline-none"
                        placeholder="Doe"
                        value={guestLastName}
                        onChange={(e) => setGuestLastName(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">Email Address</span>
                      <input
                        className="w-full bg-white border border-stone-100 px-4 py-3 rounded-xl text-sm font-medium focus:border-stone-900 transition-all outline-none"
                        placeholder="john@example.com"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">Contact Number</span>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                          className={`w-full bg-white border px-4 py-3 pl-10 rounded-xl text-sm font-medium transition-all outline-none ${
                            guestPhoneError
                              ? "border-red-200 focus:border-red-400 text-red-900"
                              : "border-stone-100 focus:border-stone-900 text-stone-900"
                          }`}
                          placeholder="07XXXXXXXX"
                          type="tel"
                          value={guestPhone}
                          onChange={(e) => handleGuestPhoneChange(e.target.value)}
                        />
                      </div>
                      {guestPhoneError && (
                        <p className="text-red-500 text-[9px] font-bold uppercase tracking-wider mt-1.5 ml-1">{guestPhoneError}</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Shipping Address */}
              <motion.div variants={sectionVariants} className="bg-white rounded-[2rem] border border-stone-100 p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-900 border border-stone-100">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Delivery Location</h2>
                </div>
                
                {userProfile ? (
                  addresses.length === 0 ? (
                    <div className="text-center py-10 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                      <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                      <p className="text-sm text-stone-500 font-serif italic mb-4">No addresses saved yet</p>
                      <Link href="/profile?tab=addresses">
                        <button className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg shadow-stone-200">
                          Add New Address
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                            selectedAddress?._id === address._id
                              ? "border-stone-900 bg-stone-50 shadow-sm"
                              : "border-stone-100 bg-white hover:border-stone-300"
                          }`}
                          onClick={() => setSelectedAddress(address)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif font-bold text-stone-900 text-sm">{address.label}</h3>
                                <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider ${
                                  selectedAddress?._id === address._id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"
                                }`}>
                                  {address.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-500 leading-relaxed">
                                {address.street}<br />
                                {address.city}, {address.state}<br />
                                {address.country} {address.zipCode}
                              </p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedAddress?._id === address._id ? "border-stone-900 bg-stone-900" : "border-stone-200"
                            }`}>
                              {selectedAddress?._id === address._id && <div className="w-1 h-1 rounded-full bg-white" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">Street Address</span>
                      <input
                        className="w-full bg-white border border-stone-100 px-4 py-3 rounded-xl text-sm font-medium focus:border-stone-900 transition-all outline-none"
                        placeholder="123 Luxury Lane"
                        value={guestAddress.street}
                        onChange={(e) => setGuestAddress({ ...guestAddress, street: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">City</span>
                      <input
                        className="w-full bg-white border border-stone-100 px-4 py-3 rounded-xl text-sm font-medium focus:border-stone-900 transition-all outline-none"
                        placeholder="Colombo"
                        value={guestAddress.city}
                        onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">State / Province</span>
                      <input
                        className="w-full bg-white border border-stone-100 px-4 py-3 rounded-xl text-sm font-medium focus:border-stone-900 transition-all outline-none"
                        placeholder="Western"
                        value={guestAddress.state}
                        onChange={(e) => setGuestAddress({ ...guestAddress, state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">Postal Code</span>
                      <input
                        className="w-full bg-white border border-stone-100 px-4 py-3 rounded-xl text-sm font-medium focus:border-stone-900 transition-all outline-none"
                        placeholder="00100"
                        value={guestAddress.zipCode}
                        onChange={(e) => setGuestAddress({ ...guestAddress, zipCode: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-1">Country</span>
                      <input
                        className="w-full bg-white border border-stone-100 px-4 py-3 rounded-xl text-sm font-medium focus:border-stone-900 transition-all outline-none"
                        placeholder="Sri Lanka"
                        value={guestAddress.country}
                        onChange={(e) => setGuestAddress({ ...guestAddress, country: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Payment Method */}
              <motion.div variants={sectionVariants} className="bg-white rounded-[2rem] border border-stone-100 p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-900 border border-stone-100">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Payment Selection</h2>
                </div>

                <div className="space-y-4">
                  {/* Cash on Delivery Option */}
                  <div
                    className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      selectedPaymentMethod === "cod"
                        ? "border-stone-900 bg-stone-50 shadow-sm"
                        : "border-stone-100 bg-white hover:border-stone-300"
                    }`}
                    onClick={() => setSelectedPaymentMethod("cod")}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-7 rounded-lg flex items-center justify-center font-bold text-[8px] tracking-tighter ${
                        selectedPaymentMethod === "cod" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-400"
                      }`}>
                        CASH
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif font-bold text-stone-900 text-sm">Cash on Delivery</h3>
                        <p className="text-[11px] text-stone-500">Pay securely when your order arrives</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPaymentMethod === "cod" ? "border-stone-900 bg-stone-900" : "border-stone-200"
                      }`}>
                        {selectedPaymentMethod === "cod" && <div className="w-1 h-1 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {/* Bank Transfer Option */}
                  <div
                    className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      selectedPaymentMethod === "bankTransfer"
                        ? "border-stone-900 bg-stone-50 shadow-sm"
                        : "border-stone-100 bg-white hover:border-stone-300"
                    }`}
                    onClick={() => setSelectedPaymentMethod("bankTransfer")}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-7 rounded-lg flex items-center justify-center ${
                        selectedPaymentMethod === "bankTransfer" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-400"
                      }`}>
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif font-bold text-stone-900 text-sm">Bank Transfer</h3>
                        <p className="text-[11px] text-stone-500">Direct deposit with receipt upload</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPaymentMethod === "bankTransfer" ? "border-stone-900 bg-stone-900" : "border-stone-200"
                      }`}>
                        {selectedPaymentMethod === "bankTransfer" && <div className="w-1 h-1 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Transfer Details & Upload */}
                <AnimatePresence>
                  {selectedPaymentMethod === "bankTransfer" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-stone-100 space-y-4">
                        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                          <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3">Bank Details</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] text-stone-400 block">Bank Name</span>
                              <span className="text-xs font-bold text-stone-900">Commercial Bank</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400 block">Account Number</span>
                              <span className="text-xs font-bold text-stone-900">8010023456</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Upload Receipt</span>
                          {!transactionSlip ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-50 hover:border-stone-400 transition-all group">
                              <div className="flex flex-col items-center justify-center py-4">
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                  <Upload className="w-4 h-4 text-stone-400" />
                                </div>
                                <p className="text-[11px] font-medium text-stone-600">Select transaction slip</p>
                                <p className="text-[9px] text-stone-400 mt-1 uppercase tracking-widest font-bold">Max 5MB (JPG/PNG)</p>
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                          ) : (
                            <div className="relative group rounded-2xl overflow-hidden border border-stone-100 bg-white p-3 shadow-sm">
                              <div className="flex items-center gap-3">
                                <img src={transactionSlip} alt="Receipt" className="w-16 h-16 object-cover rounded-xl" />
                                <div className="flex-1">
                                  <p className="text-[11px] font-serif font-bold text-stone-900 truncate max-w-[120px]">
                                    {transactionSlipFile?.name || "receipt.jpg"}
                                  </p>
                                  <p className="text-[9px] text-stone-400 uppercase font-bold tracking-widest">
                                    {((transactionSlipFile?.size || 0) / 1024).toFixed(0)} KB
                                  </p>
                                </div>
                                <button
                                  onClick={removeTransactionSlip}
                                  className="p-2 rounded-full bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                  <XIcon className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <motion.div variants={sectionVariants} className="lg:col-span-1">
              <div className="sticky top-32 space-y-6">
                <div className="bg-white rounded-[2rem] border border-stone-100 p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-900 border border-stone-100">
                      <Truck className="w-4 h-4" />
                    </div>
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Your Order</h2>
                  </div>

                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {cartItems.map((item) => (
                      <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4">
                        <div className="w-20 h-24 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 shrink-0">
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 py-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xs font-serif font-bold text-stone-900 line-clamp-1">{item.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-4">
                              {item.size && (
                                <div className="flex items-center justify-center min-w-[32px] h-[32px] px-2.5 rounded-md border border-stone-200 bg-stone-50 text-[11px] font-bold text-stone-800 shadow-sm uppercase" title="Size">
                                  {/^[0-9a-fA-F]{24}$/.test(String(item.size)) ? "-" : item.size}
                                </div>
                              )}
                              {item.colorCode ? (
                                <div className="flex items-center gap-2.5">
                                  <div 
                                    className="w-6 h-6 rounded-full border border-stone-300 shadow-sm shrink-0" 
                                    style={{ backgroundColor: item.colorCode }} 
                                    title={item.color}
                                  />
                                  <span className="text-[11px] text-stone-500 uppercase font-bold tracking-widest">{/^[0-9a-fA-F]{24}$/.test(String(item.color)) ? "Selected" : item.color}</span>
                                </div>
                              ) : (
                                item.color && <span className="text-[11px] text-stone-400 uppercase font-bold tracking-widest">Col: {/^[0-9a-fA-F]{24}$/.test(String(item.color)) ? "Selected" : item.color}</span>
                              )}
                              <div className="h-5 w-[1px] bg-stone-100 mx-1" />
                              <span className="text-[11px] text-stone-400 uppercase font-bold tracking-widest">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-stone-900">
                            {formatCurrency(normalizePrice(item.price) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-stone-100 space-y-4">
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-stone-400 font-bold tracking-widest uppercase">Subtotal</span>
                      <span className="text-stone-900 font-bold">{formatCurrency(getCorrectedTotalPrice())}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-stone-400 font-bold tracking-widest uppercase">Shipping</span>
                      <span className="text-stone-900 font-bold">
                        {checkoutSettings.isShippingFree ? "FREE" : formatCurrency(checkoutSettings.shippingPrice)}
                      </span>
                    </div>
                    {checkoutSettings.globalDiscount > 0 && (
                      <div className="flex justify-between items-center text-[12px] text-emerald-600">
                        <span className="font-bold tracking-widest uppercase">Discount ({checkoutSettings.globalDiscount}%)</span>
                        <span className="font-bold">-{formatCurrency((getCorrectedTotalPrice() * checkoutSettings.globalDiscount) / 100)}</span>
                      </div>
                    )}
                    <div className="pt-4 flex justify-between items-end border-t border-stone-50">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Total Amount</span>
                        <span className="text-2xl font-serif font-bold text-stone-900">
                          {formatCurrency(
                            getCorrectedTotalPrice() +
                            (checkoutSettings.isShippingFree ? 0 : checkoutSettings.shippingPrice) -
                            (checkoutSettings.globalDiscount > 0 ? (getCorrectedTotalPrice() * checkoutSettings.globalDiscount) / 100 : 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <TruckButton
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || 
                        (userProfile ? !selectedAddress : (!guestFirstName || !guestLastName || !guestEmail || !guestAddress.street)) ||
                        (userProfile ? !userPhone : !guestPhone) ||
                        (selectedPaymentMethod === "bankTransfer" && !transactionSlip)
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div className="mt-5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-green-50 rounded-xl border border-green-100">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest">Secure Checkout</span>
                    </div>
                    <p className="text-[8px] text-center text-stone-400 uppercase tracking-[0.1em] leading-relaxed">
                      Your information is encrypted and securely processed.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}




