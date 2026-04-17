"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import jsPDF from 'jspdf'
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  User,
  Package,
  Settings,
  Heart,
  MapPin,
  CreditCard,
  LogOut,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  X,
  Download,
  ShoppingBag,
  ChevronRight,
  Sparkles,
  Calendar
} from "lucide-react"
import { API_BASE_URL } from "@/lib/api-config"

// --- Interfaces (Kept Unchanged) ---
interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

interface Address {
  _id: string;
  type: 'home' | 'work' | 'billing' | 'shipping';
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

interface PaymentCard {
  _id: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover';
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  isDefault: boolean;
  createdAt: string;
}

interface OrderItem {
  _id: string;
  orderNumber: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    quantity: number;
    size?: string;
    color?: string;
    category: string;
  }>;
  shippingAddress: {
    type: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: {
    type: string;
    cardType: string;
    cardNumber: string;
    cardHolderName: string;
    expiryMonth: string;
    expiryYear: string;
    transactionSlip?: string | null;
  };
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  orderDate: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  notes?: string;
}

interface Order extends OrderItem { } // Alias for consistency

// --- Custom Animations Style Block ---
const AnimationStyles = () => (
  <style jsx global>{`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
    .animate-slide-in {
      animation: slideIn 0.4s ease-out forwards;
    }
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }
    
    .glass-panel {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(231, 229, 228, 0.6);
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #d6d3d1;
      border-radius: 20px;
    }
  `}</style>
)

export default function ProfilePage() {
  // --- State Management (Kept Unchanged) ---
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([])
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null)
  const router = useRouter()

  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [addressForm, setAddressForm] = useState({
    type: 'home' as 'home' | 'work' | 'billing' | 'shipping',
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  })

  const [cardForm, setCardForm] = useState({
    cardType: 'visa' as 'visa' | 'mastercard' | 'amex' | 'discover',
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  })

  // --- Effects & Logic (Kept Unchanged) ---
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      // Ensure _id is present (backend returns 'id' on login)
      if (!parsedUser._id && parsedUser.id) {
        parsedUser._id = parsedUser.id
      }
      setUser(parsedUser)
      setPersonalInfo({
        firstName: parsedUser.firstName || "",
        lastName: parsedUser.lastName || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
      })

      loadWishlistFromBackend(parsedUser._id || parsedUser.id)
      loadAddresses(parsedUser._id || parsedUser.id)
      loadPaymentCards(parsedUser._id || parsedUser.id)
      loadOrders(parsedUser._id || parsedUser.id)

      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      if (tabParam && ['overview', 'orders', 'wishlist', 'addresses', 'payment', 'settings'].includes(tabParam)) {
        setActiveTab(tabParam)
      }

      setIsLoading(false)

      const handleUserChange = () => {
        const currentUser = JSON.parse(localStorage.getItem("user") || '{}')
        if (currentUser.id || currentUser._id) {
          // Ensure _id is present
          if (!currentUser._id && currentUser.id) {
            currentUser._id = currentUser.id
          }
          const userId = currentUser._id
          loadWishlistFromBackend(userId)
          loadAddresses(userId)
          loadPaymentCards(userId)
          loadOrders(userId)
          setUser(currentUser)
        }
      }

      window.addEventListener('userLogin', handleUserChange)
      window.addEventListener('userLogout', handleUserChange)

      return () => {
        window.removeEventListener('userLogin', handleUserChange)
        window.removeEventListener('userLogout', handleUserChange)
      }
    } else {
      router.push("/")
    }
  }, [router])

  const loadWishlistFromBackend = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data.wishlist)
      } else {
        const savedWishlist = localStorage.getItem("wishlist")
        if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist))
      }
    } catch (error) {
      const savedWishlist = localStorage.getItem("wishlist")
      if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist))
    }
  }

  const handlePersonalInfoChange = (field: keyof typeof personalInfo, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveChanges = async () => {
    if (!user) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personalInfo),
      })
      const data = await response.json()
      if (response.ok) {
        // Ensure _id is preserved/set
        if (!data.user._id && data.user.id) {
          data.user._id = data.user.id
        }
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        alert("Profile updated successfully!")
      } else {
        alert(data.message || "Failed to update profile")
      }
    } catch (error) {
      alert("Network error. Please try again.")
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const removeFromWishlist = async (productId: string | number) => {
    try {
      if (!user) return
      const response = await fetch(`${API_BASE_URL}/api/wishlist/${user._id}/remove/${productId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        const updatedWishlist = wishlistItems.filter(item => (item.productId?._id || item.productId) !== productId)
        setWishlistItems(updatedWishlist)
        const localStorageWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
        const updatedLocalStorageWishlist = localStorageWishlist.filter((id: string | number) => id !== productId)
        localStorage.setItem("wishlist", JSON.stringify(updatedLocalStorageWishlist))
      }
    } catch (error) {
      const updatedWishlist = wishlistItems.filter(item => (item.productId?._id || item.productId) !== productId)
      setWishlistItems(updatedWishlist)
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
    }
  }

  const loadAddresses = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-profile/${userId}/addresses`)
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses)
      }
    } catch (error) { }
  }

  const loadPaymentCards = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-profile/${userId}/payment-cards`)
      if (response.ok) {
        const data = await response.json()
        setPaymentCards(data.paymentCards)
      }
    } catch (error) { }
  }

  const loadOrders = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/user/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) { }
  }

  const generateInvoice = (order: Order) => {
    // ... [Previous logic kept intact] ...
    const doc = new jsPDF()
    doc.setFont('helvetica')
    doc.setFillColor(180, 83, 9)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('EVORA', 20, 25)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Luxury Footwear Collection', 20, 32)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 150, 25)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Invoice #${order.orderNumber}`, 150, 32)
    doc.setFillColor(248, 250, 252)
    doc.rect(15, 50, 180, 35, 'F')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(55, 65, 81)
    doc.text('Order Information', 20, 60)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 68)
    doc.text(`Payment Method: ${order.paymentMethod.type === 'cod' ? 'Cash on Delivery' : `${order.paymentMethod.cardType.toUpperCase()} ****${order.paymentMethod.cardNumber.slice(-4)}`}`, 20, 75)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Bill To:', 20, 100)
    doc.setFontSize(11)
    doc.text(`${order.user?.firstName} ${order.user?.lastName}`, 20, 110)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(order.user?.email || '', 20, 118)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Ship To:', 120, 100)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(order.shippingAddress.street, 120, 110)
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, 120, 118)
    doc.text(`${order.shippingAddress.country} ${order.shippingAddress.zipCode}`, 120, 126)
    doc.setFillColor(55, 65, 81)
    doc.rect(15, 140, 180, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Item Description', 20, 148)
    doc.text('Qty', 120, 148)
    doc.text('Unit Price', 140, 148)
    doc.text('Total', 170, 148)
    let yPosition = 160
    order.items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251)
        doc.rect(15, yPosition - 8, 180, 10, 'F')
      }
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      let itemDescription = item.name
      if (item.size || item.color) itemDescription += ` (${item.size || ''} ${item.color || ''})`
      doc.text(itemDescription, 20, yPosition)
      doc.text(item.quantity.toString(), 120, yPosition)
      doc.text(`Rs. ${item.price.toFixed(2)}`, 140, yPosition)
      doc.text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 170, yPosition)
      yPosition += 10
    })
    yPosition += 10
    doc.setFillColor(243, 244, 246)
    doc.rect(15, yPosition, 180, 25, 'F')
    doc.setTextColor(0, 0, 0)
    doc.text('Subtotal:', 140, yPosition + 8)
    doc.text(`Rs. ${order.subtotal.toFixed(2)}`, 170, yPosition + 8)
    doc.text('Shipping:', 140, yPosition + 16)
    doc.text(`Rs. ${order.shipping.toFixed(2)}`, 170, yPosition + 16)
    doc.text('Tax:', 140, yPosition + 24)
    doc.text(`Rs. ${order.tax.toFixed(2)}`, 170, yPosition + 24)
    doc.setFillColor(180, 83, 9)
    doc.rect(15, yPosition + 30, 180, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 140, yPosition + 38)
    doc.text(`Rs. ${order.total.toFixed(2)}`, 170, yPosition + 38)
    doc.save(`invoice-${order.orderNumber}.pdf`)
  }

  const handleAddAddress = async () => {
    if (!user) return
    if (!addressForm.label || !addressForm.street || !addressForm.city || !addressForm.country) {
      alert('Please fill in required fields')
      return
    }

    // Provide defaults for required backend fields missing in form
    const payload = {
      ...addressForm,
      state: addressForm.state || 'N/A',
      zipCode: addressForm.zipCode || '00000'
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user-profile/${user._id}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses)
        setShowAddressForm(false)
        setAddressForm({ type: 'home', label: '', street: '', city: '', state: '', zipCode: '', country: '', isDefault: false })
        alert('Address added successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to add address: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(error)
      alert('Network error while adding address')
    }
  }

  const handleAddCard = async () => {
    if (!user) return
    if (!cardForm.cardNumber || !cardForm.cardHolderName || !cardForm.cvv) {
      alert('Please fill in required fields')
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-profile/${user._id}/payment-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardForm),
      })
      if (response.ok) {
        const data = await response.json()
        setPaymentCards(data.paymentCards)
        setShowCardForm(false)
        setCardForm({ cardType: 'visa', cardNumber: '', cardHolderName: '', expiryMonth: '', expiryYear: '', cvv: '', isDefault: false })
        alert('Payment card added successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to add payment card')
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!user || !confirm('Are you sure?')) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-profile/${user._id}/addresses/${addressId}`, { method: 'DELETE' })
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to delete address')
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!user || !confirm('Are you sure?')) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-profile/${user._id}/payment-cards/${cardId}`, { method: 'DELETE' })
      if (response.ok) {
        const data = await response.json()
        setPaymentCards(data.paymentCards)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to delete payment card')
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Network error. Please try again.')
    }
  }

  // --- Render Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 border-2 border-stone-200 border-t-amber-800 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-stone-500 font-serif tracking-widest text-sm uppercase">Loading Evora Profile</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // --- UI Constants ---
  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative selection:bg-amber-100 selection:text-amber-900">
      <AnimationStyles />

      {/* Abstract Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-stone-100/50 to-transparent pointer-events-none z-0" />
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-50/40 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12 max-w-7xl">

        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-10 animate-fade-in">
          <Link href="/" className="group flex items-center gap-2 text-stone-600 hover:text-amber-800 transition-colors duration-300">
            <div className="p-2 bg-white border border-stone-200 rounded-full shadow-sm group-hover:shadow-md transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm tracking-wide">Back to Store</span>
          </Link>

          <div className="hidden md:block">
            <h1 className="font-serif text-2xl text-stone-900 tracking-tight">
              My <span className="italic text-amber-800">Account</span>
            </h1>
          </div>

          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 animate-fade-in stagger-1">
            <div className="sticky top-24 space-y-8">
              {/* User Profile Card */}
              <div className="glass-card p-6 rounded-3xl text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse opacity-20"></div>
                    <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 rounded-full flex items-center justify-center border-2 border-white shadow-inner">
                      <span className="font-serif text-3xl text-stone-400 font-bold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                  </div>
                  <h2 className="font-serif text-xl font-bold text-stone-800 mb-1">{user.firstName} {user.lastName}</h2>
                  <p className="text-stone-500 text-sm mb-4">{user.email}</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-medium text-stone-600">
                    <Sparkles className="w-3 h-3 mr-1 text-amber-600" /> Member
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                        ? "bg-stone-900 text-white shadow-lg shadow-stone-200 transform scale-[1.02]"
                        : "text-stone-600 hover:bg-white hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? "text-amber-400" : "text-stone-400 group-hover:text-stone-600"}`} />
                        <span className="font-medium tracking-wide text-sm">{tab.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-stone-400" />}
                    </button>
                  )
                })}

                <div className="pt-4 mt-4 border-t border-stone-200/60">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Sign Out</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 animate-fade-in stagger-2">

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                  <h2 className="font-serif text-3xl text-stone-900 tracking-tight">
                    Welcome back, <span className="italic text-amber-800">{user.firstName}</span>
                  </h2>
                  <p className="text-stone-500 font-serif text-sm">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-in stagger-1">
                  {[
                    { title: "Total Orders", value: orders.length, icon: Package, color: "text-amber-700" },
                    { title: "Wishlist", value: wishlistItems.length, icon: Heart, color: "text-rose-600" },
                    { title: "Spent", value: `Rs. ${orders.reduce((acc, order) => acc + order.total, 0).toLocaleString()}`, icon: CreditCard, color: "text-emerald-600" },
                  ].map((item, index) => (
                    <div key={index} className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center transform hover:scale-[1.02] transition-transform duration-300">
                      <div className={`w-12 h-12 rounded-full ${item.color} bg-white border border-stone-200 shadow-sm flex items-center justify-center mb-4`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-3xl text-stone-900 font-serif mb-1">{item.value}</h3>
                      <p className="text-stone-500 text-sm tracking-wide uppercase">{item.title}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-panel p-8 rounded-3xl animate-slide-in stagger-2">
                    <h3 className="font-serif text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-800" /> Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {orders.length > 0 ? (
                        orders.slice(0, 3).map((order) => (
                          <div key={order.orderNumber} className="flex items-center justify-between p-4 bg-white/60 border border-stone-100 rounded-xl hover:shadow-sm transition-all duration-300">
                            <div>
                              <p className="font-medium text-stone-800 text-sm">Order #{order.orderNumber}</p>
                              <p className="text-xs text-stone-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl">
                          <p className="text-stone-400 text-sm">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="glass-panel p-8 rounded-3xl animate-slide-in stagger-3">
                    <h3 className="font-serif text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                      <User className="w-5 h-5 text-amber-800" /> Profile Summary
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wide">Member Since</p>
                          <p className="text-stone-800 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wide">Default Address</p>
                          <p className="text-stone-800 font-medium truncate max-w-[200px]">
                            {addresses.find(a => a.isDefault)?.city || "Not Set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="font-serif text-3xl text-stone-900 tracking-tight mb-8">Order History</h2>

                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-stone-50/50 rounded-3xl border border-dashed border-stone-200 animate-fade-in">
                    <ShoppingBag className="w-16 h-16 text-stone-300 mb-6" />
                    <h3 className="text-xl font-serif text-stone-800 mb-2">No orders placed yet</h3>
                    <p className="text-stone-500 mb-8 text-center max-w-md">Discover our collection and make your first purchase today.</p>
                    <Link href="/products" className="bg-stone-900 text-white px-8 py-3 rounded-full hover:bg-amber-900 transition-colors shadow-lg shadow-amber-900/20">
                      Explore Collection
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6 animate-slide-in">
                    {orders.map((order, idx) => (
                      <div key={order._id} className="glass-card overflow-hidden rounded-2xl group transition-all duration-300 hover:shadow-lg">
                        <div className="bg-stone-50/80 px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                            <div>
                              <span className="text-xs text-stone-500 uppercase tracking-wider">Order Placed</span>
                              <p className="font-medium text-stone-800 text-sm">{new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-xs text-stone-500 uppercase tracking-wider">Order #</span>
                              <p className="font-medium text-stone-800 text-sm">{order.orderNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              order.orderStatus === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                              {order.items.slice(0, 2).map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-2 hover:bg-stone-50 rounded-xl transition-colors">
                                  <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-stone-900 text-sm">{item.name}</h4>
                                    <p className="text-xs text-stone-500 mt-1">Qty: {item.quantity} &bull; Rs. {item.price.toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <p className="text-xs text-stone-400 pl-2 italic">+ {order.items.length - 2} more items</p>
                              )}
                            </div>

                            <div className="w-full md:w-48 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6">
                              <div>
                                <span className="text-xs text-stone-500 uppercase tracking-wider">Total</span>
                                <p className="font-serif font-bold text-xl text-stone-900">Rs. {order.total.toLocaleString()}</p>
                              </div>
                              <div className="flex flex-col gap-2 mt-4">
                                <button
                                  onClick={() => generateInvoice(order)}
                                  className="w-full py-2 px-4 rounded-lg border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
                                >
                                  <Download className="w-3 h-3" /> Invoice
                                </button>
                                <button className="w-full py-2 px-4 rounded-lg bg-stone-900 text-white text-sm hover:bg-amber-900 transition-all shadow-md shadow-stone-200">
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <h2 className="font-serif text-3xl text-stone-900 tracking-tight mb-8">My Wishlist</h2>

                {wishlistItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-stone-50/50 rounded-3xl border border-dashed border-stone-200 animate-fade-in">
                    <Heart className="w-16 h-16 text-stone-300 mb-6" />
                    <h3 className="text-xl font-serif text-stone-800 mb-2">Your wishlist is empty</h3>
                    <p className="text-stone-500 mb-8 text-center max-w-md">Save items you love to revisit later.</p>
                    <Link href="/products" className="bg-stone-900 text-white px-8 py-3 rounded-full hover:bg-amber-900 transition-colors shadow-lg shadow-amber-900/20">
                      Start Browsing
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-in">
                    {wishlistItems
                      .filter((item) => item?.productId)
                      .map((item, index) => (
                      <motion.div
                        key={item.productId?._id ?? item.productId ?? index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group relative bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                          <img
                            src={item.productId?.images?.[0] || "/placeholder.svg"}
                            alt={item.productId?.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          />

                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Remove Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              removeFromWishlist(item.productId?._id || item.productId);
                            }}
                            className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-stone-400 hover:text-red-500 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 z-10"
                            aria-label="Remove from wishlist"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Quick Add Button (Visible on Hover) */}
                          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              className="w-full py-3 bg-white/95 backdrop-blur-md text-stone-900 text-sm font-medium rounded-xl hover:bg-stone-900 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              Add to Bag
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="mb-auto">
                            <h3 className="font-serif text-lg font-medium text-stone-900 leading-tight mb-2 line-clamp-2 group-hover:text-amber-900 transition-colors">
                              {item.productId?.name}
                            </h3>
                            <div className="flex items-baseline gap-2">
                              <span className="text-amber-800 font-bold text-lg">
                                Rs. {item.productId?.price?.toLocaleString()}
                              </span>
                              {item.productId?.originalPrice > item.productId?.price && (
                                <span className="text-stone-400 text-sm line-through">
                                  Rs. {item.productId?.originalPrice?.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stock Status */}
                          <div className="mt-4 flex items-center gap-2 text-xs font-medium tracking-wide text-stone-500 uppercase">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.productId?.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                            {item.productId?.inStock ? 'In Stock' : 'Out of Stock'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Address Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-serif text-3xl text-stone-900 tracking-tight">Saved Addresses</h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-full hover:bg-amber-900 transition-all shadow-lg shadow-stone-200 text-sm font-medium"
                  >
                    <span className="text-xl leading-none">+</span> Add New
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in">
                  {addresses.map((address) => (
                    <div key={address._id} className="glass-card p-6 rounded-2xl relative group hover:border-amber-200 transition-colors">
                      {address.isDefault && (
                        <span className="absolute top-4 right-4 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          Default
                        </span>
                      )}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900">{address.label}</h3>
                          <p className="text-xs text-stone-500 uppercase">{address.type}</p>
                        </div>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed mb-6 pl-13 border-l-2 border-stone-100 pl-4 ml-2">
                        {address.street}<br />
                        {address.city}, {address.state}<br />
                        {address.country} {address.zipCode}
                      </p>
                      <div className="flex gap-3 pt-4 border-t border-stone-100">
                        <button className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors">Edit</button>
                        <button onClick={() => handleDeleteAddress(address._id)} className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors">Remove</button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Placeholder Card */}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center text-stone-400 hover:border-amber-200 hover:text-amber-700 hover:bg-amber-50/30 transition-all min-h-[200px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <span className="text-2xl">+</span>
                    </div>
                    <span className="font-medium text-sm">Add New Address</span>
                  </button>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-serif text-3xl text-stone-900 tracking-tight">Payment Methods</h2>
                  <button
                    onClick={() => setShowCardForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-full hover:bg-amber-900 transition-all shadow-lg shadow-stone-200 text-sm font-medium"
                  >
                    <span className="text-xl leading-none">+</span> Add Card
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in">
                  {paymentCards.map((card) => (
                    <div key={card._id} className="relative overflow-hidden rounded-2xl h-48 group shadow-lg transition-transform hover:-translate-y-1 duration-300">
                      {/* Card Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.cardType === 'visa' ? 'from-[#1A1F71] to-[#2B3595]' :
                        card.cardType === 'mastercard' ? 'from-[#EB001B] to-[#F79E1B]' :
                          'from-stone-800 to-stone-900'
                        }`} />

                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />

                      <div className="relative z-10 p-6 flex flex-col justify-between h-full text-white">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-xs opacity-70 tracking-widest uppercase">{card.cardType}</span>
                          <button
                            onClick={() => handleDeleteCard(card._id)}
                            className="p-1.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-5 bg-yellow-200/80 rounded-sm" /> {/* Chip Simulation */}
                            <Sparkles className="w-4 h-4 opacity-50" />
                          </div>
                          <p className="font-mono text-xl tracking-wider shadow-black drop-shadow-md pt-2">
                            **** **** **** {card.cardNumber.slice(-4)}
                          </p>
                        </div>

                        <div className="flex justify-between items-end text-xs opacity-80 font-mono">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider mb-0.5">Card Holder</span>
                            <span>{card.cardHolderName.toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider mb-0.5">Expires</span>
                            <span>{card.expiryMonth}/{card.expiryYear}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowCardForm(true)}
                    className="border-2 border-dashed border-stone-200 rounded-2xl h-48 flex flex-col items-center justify-center text-stone-400 hover:border-amber-200 hover:text-amber-700 hover:bg-amber-50/30 transition-all"
                  >
                    <CreditCard className="w-8 h-8 mb-3 opacity-50" />
                    <span className="font-medium text-sm">Add New Card</span>
                  </button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="max-w-2xl animate-slide-in">
                <h2 className="font-serif text-3xl text-stone-900 tracking-tight mb-8">Account Settings</h2>
                <div className="space-y-8">
                  <div className="glass-panel p-8 rounded-3xl">
                    <h3 className="font-serif text-xl font-bold text-stone-900 mb-6">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-amber-700 transition-colors">First Name</label>
                        <input
                          type="text"
                          value={personalInfo.firstName}
                          onChange={(e) => handlePersonalInfoChange("firstName", e.target.value)}
                          className="w-full bg-transparent border-b border-stone-300 py-2 text-stone-900 focus:outline-none focus:border-amber-700 transition-colors font-medium"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-amber-700 transition-colors">Last Name</label>
                        <input
                          type="text"
                          value={personalInfo.lastName}
                          onChange={(e) => handlePersonalInfoChange("lastName", e.target.value)}
                          className="w-full bg-transparent border-b border-stone-300 py-2 text-stone-900 focus:outline-none focus:border-amber-700 transition-colors font-medium"
                        />
                      </div>
                      <div className="md:col-span-2 group">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input
                          type="email"
                          value={personalInfo.email}
                          disabled
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 text-stone-500 cursor-not-allowed"
                        />
                      </div>
                      <div className="md:col-span-2 group">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 group-focus-within:text-amber-700 transition-colors">Phone Number</label>
                        <input
                          type="tel"
                          value={personalInfo.phone}
                          onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                          className="w-full bg-transparent border-b border-stone-300 py-2 text-stone-900 focus:outline-none focus:border-amber-700 transition-colors font-medium"
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleSaveChanges}
                        className="px-8 py-3 bg-stone-900 text-white rounded-full hover:bg-amber-900 transition-all shadow-lg hover:shadow-amber-900/20 text-sm font-medium tracking-wide"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Popups / Modals (Stylized) */}
      {(showAddressForm || showCardForm) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FDFCF8] rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {showAddressForm ? 'Add New Address' : 'Add Payment Card'}
              </h3>
              <button
                onClick={() => { setShowAddressForm(false); setShowCardForm(false); }}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="space-y-4">
              {showAddressForm ? (
                <>
                  <input
                    type="text"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:outline-none transition-all"
                    placeholder="Label (e.g. Home)"
                  />
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:outline-none transition-all"
                    placeholder="Street Address"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:outline-none transition-all"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:outline-none transition-all"
                      placeholder="Country"
                    />
                  </div>
                  <button onClick={handleAddAddress} className="w-full py-3 bg-stone-900 text-white rounded-xl hover:bg-amber-900 transition-all font-medium mt-4">Save Address</button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:outline-none transition-all"
                    placeholder="Card Number"
                    maxLength={19}
                  />
                  <input
                    type="text"
                    value={cardForm.cardHolderName}
                    onChange={(e) => setCardForm({ ...cardForm, cardHolderName: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:outline-none transition-all"
                    placeholder="Cardholder Name"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={cardForm.expiryMonth}
                      onChange={(e) => setCardForm({ ...cardForm, expiryMonth: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:outline-none transition-all"
                      placeholder="MM"
                    />
                    <input
                      type="text"
                      value={cardForm.expiryYear}
                      onChange={(e) => setCardForm({ ...cardForm, expiryYear: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:outline-none transition-all"
                      placeholder="YYYY"
                    />
                    <input
                      type="text"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:outline-none transition-all"
                      placeholder="CVV"
                    />
                  </div>
                  <button onClick={handleAddCard} className="w-full py-3 bg-stone-900 text-white rounded-xl hover:bg-amber-900 transition-all font-medium mt-4">Save Card</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}