"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  ShoppingCart,
  Users,
  Star,
  TrendingUp,
  Eye,
  Settings,
  LogOut,
  Plus,
  BarChart3,
  Edit,
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react"
import { AdminChatDashboard } from "@/components/admin/AdminChatDashboard"
import { API_BASE_URL as CENTRAL_API_BASE_URL } from "@/lib/api-config"

interface ProductColor {
  _id?: string // Added _id for editing existing colors
  name: string
  code: string
  available: boolean
}
interface ProductSize {
  _id?: string // Added _id for editing existing sizes
  size: string
  available: boolean
  stock: number
}
interface OrchidColor {
  _id?: string // Added _id for editing existing orchid colors
  name: string
  value: string
  available: boolean
  image?: string | File
}
interface Product {
  _id: string
  name: string
  price: number
  originalPrice?: number
  category: string
  description: string
  images: (string | File)[]
  stock: number
  rating: number
  reviews: number
  colors?: ProductColor[]
  sizes?: ProductSize[]
  orchidEnabled?: boolean
  orchidColors?: OrchidColor[]
  features: string[]
  isLimitedEdition: boolean
  discount: number
  status: string
  endDate?: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  productCount: number
}

interface LimitedEdition {
  id: string
  name: string
  price: number
  originalPrice: number
  description: string
  images: (string | File)[]
  stock: number
  isActive: boolean
  endDate: string
  category?: string
  // Added status to align with Product interface
  status?: "active" | "inactive"
  // Added size, color, and orchid color features
  sizes?: ProductSize[]
  colors?: ProductColor[]
  orchidColors?: OrchidColor[]
  // Added missing fields to match Product interface
  rating?: number
  reviews?: number
  discount?: number
  orchidEnabled?: boolean
  features?: any[]
}

interface Order {
  _id: string
  orderNumber: string
  userId: string | {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  phone?: string
  user?: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  guestDetails?: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  items: Array<{
    productId: string
    name: string
    price: number
    originalPrice?: number
    image: string
    quantity: number
    size?: string
    color?: string
    category: string
  }>
  shippingAddress: {
    type: string
    label: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: {
    type: string
    cardType: string
    cardNumber: string
    cardHolderName: string
    expiryMonth: string
    expiryYear: string
    transactionSlip?: string | null
  }
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping: number
  tax: number
  total: number
  orderDate: string
  estimatedDelivery: string
  trackingNumber?: string
  notes?: string
}

interface Feedback {
  id: string
  customerName: string
  customerEmail: string
  rating: number
  message: string
  date: string
  status: "pending" | "approved" | "rejected"
  productName?: string
  fit?: string
  storeResponse?: string
}

const RAW_API = CENTRAL_API_BASE_URL
const API_BASE = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API.replace(/\/$/, "")}/api`

const isLocalSrc = (src: string) => typeof src === "string" && src.startsWith("/")
const SafeImage = ({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}) => {
  const fallback = "/placeholder.svg"
  const resolved = src && typeof src === "string" ? src : fallback
  return isLocalSrc(resolved) ? (
    <Image src={resolved || "/placeholder.svg"} alt={alt} width={width} height={height} className={className} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolved || "/placeholder.svg"} alt={alt} width={width} height={height} className={className} />
  )
}

const ImageSlider = ({ images, productName }: { images: (string | File)[]; productName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-xs">No Image</span>
      </div>
    )
  }

  const getImageSrc = (image: string | File) => {
    if (image instanceof File) {
      return URL.createObjectURL(image)
    }
    return image
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="relative w-20 h-20 group">
      <img
        src={getImageSrc(images[currentIndex]) || "/placeholder.svg"}
        alt={`${productName} - Image ${currentIndex + 1}`}
        className="w-20 h-20 object-cover rounded-lg"
      />

      {images.length > 1 && (
        <>
          {/* Navigation buttons */}
          <button
            onClick={prevImage}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* Image indicators */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${index === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
              />
            ))}
          </div>

          {/* Image counter */}
          <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  )
}

const ProductImagePreview = ({
  images,
  onRemove,
}: { images: (string | File)[]; onRemove: (index: number) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return null
  }

  const getImageSrc = (image: string | File) => {
    if (image instanceof File) {
      return URL.createObjectURL(image)
    }
    return image
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleRemove = (index: number) => {
    onRemove(index)
    // Adjust currentIndex after removal
    if (index === currentIndex && currentIndex >= images.length - 1) {
      // If removing the current image and it's the last one, go to previous
      setCurrentIndex(Math.max(0, currentIndex - 1))
    } else if (index < currentIndex) {
      // If removing an image before current, adjust index
      setCurrentIndex(currentIndex - 1)
    }
    // If removing an image after current, no adjustment needed
  }

  return (
    <div className="mt-2">
      {/* Main image display */}
      <div className="relative w-40 h-40 mb-3">
        <img
          src={getImageSrc(images[currentIndex]) || "/placeholder.svg"}
          alt={`Preview ${currentIndex + 1}`}
          className="w-40 h-40 object-cover rounded-lg border-2 border-amber-200"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <button
          onClick={() => handleRemove(currentIndex)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
        >
          ×
        </button>

        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
          {currentIndex + 1}/{images.length}
        </div>
      </div>

      {/* Enhanced thumbnail strip for up to 5 images */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap max-w-xs">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-14 h-14 rounded border-2 overflow-hidden transition-all hover:scale-105 ${idx === currentIndex ? "border-amber-500 shadow-md" : "border-gray-300"
                }`}
            >
              <img
                src={getImageSrc(image) || "/placeholder.svg"}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="text-white text-xs font-medium">{idx + 1}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Image count indicator */}
      <div className="mt-2 text-sm text-amber-700">
        {images.length}/5 images uploaded
        {images.length < 5 && <span className="text-amber-600"> (You can add {5 - images.length} more images)</span>}
      </div>
    </div>
  )
}

const sampleOrders: Order[] = []

const sampleCategories: Category[] = [
  {
    id: "1",
    name: "Comfort Slippers",
    slug: "comfort-slippers",
    description: "Premium comfort slippers crafted for everyday luxury",
    image: "/elegant-comfort-slippers-collection.png",
    productCount: 24,
  },
  {
    id: "2",
    name: "Designer Heels",
    slug: "designer-heels",
    description: "Elegant high heels for special occasions",
    image: "/designer-high-heel-sandals-collection.png",
    productCount: 18,
  },
]

const sampleLimitedEdition: LimitedEdition[] = [
  {
    id: "1",
    name: "Platinum Crystal Heels",
    price: 12500,
    originalPrice: 15000,
    description: "Exclusive platinum-finished crystal heels with Swarovski elements",
    images: ["/premium-velvet-slippers-collection.png"],
    stock: 5,
    isActive: true,
    endDate: "2024-09-30",
    status: "active",
  },
]

const sampleFeedback: Feedback[] = [
  {
    id: "FB-001",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@email.com",
    rating: 5,
    message:
      "Absolutely love these slippers! The comfort is unmatched and the quality is exceptional. Will definitely order again.",
    date: "2024-08-24",
    status: "approved",
    productName: "Elegant Comfort Slippers",
  },
  {
    id: "FB-002",
    customerName: "Michael Chen",
    customerEmail: "michael@email.com",
    rating: 4,
    message: "Great sandals for summer. Very comfortable and stylish. Only minor issue is they run slightly small.",
    date: "2024-08-23",
    status: "pending",
    productName: "Summer Sandals",
  },
]

const validateFileSize = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  return file.size <= maxSize
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const compressImage = async (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality)
        resolve(compressedBase64)
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

const compressImageToFile = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        // Compress to max 600px width while maintaining aspect ratio
        const maxWidth = 600
        const scale = maxWidth / img.width
        canvas.width = maxWidth
        canvas.height = img.height * scale

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Convert to blob with 70% quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File from the blob
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error("Failed to compress image"))
            }
          },
          "image/jpeg",
          0.7,
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const compressOrchidImageToFile = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        // Compress to max 300px width for orchid thumbnails (smaller than product images)
        const maxWidth = 300
        const scale = maxWidth / img.width
        canvas.width = maxWidth
        canvas.height = img.height * scale

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Convert to blob with 50% quality (more aggressive compression for thumbnails)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error("Failed to compress orchid image"))
            }
          },
          "image/jpeg",
          0.5,
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Helper function to get user data from order
const getUserData = (order: Order) => {
  if (order.user) {
    return order.user
  }
  if (typeof order.userId === 'object' && order.userId !== null) {
    return order.userId
  }
  return null
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeSection, setActiveSection] = useState("overview")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [productError, setProductError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [limitedEdition, setLimitedEdition] = useState<LimitedEdition[]>(sampleLimitedEdition)
  const [limitedEditionError, setLimitedEditionError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [productForm, setProductForm] = useState<Partial<Product>>({})
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({})
  const [editingLimitedEdition, setEditingLimitedEdition] = useState<LimitedEdition | null>(null)
  const [isAddingLimitedEdition, setIsAddingLimitedEdition] = useState(false)
  const [limitedEditionForm, setLimitedEditionForm] = useState<Partial<LimitedEdition>>({})
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [feedbackReplyText, setFeedbackReplyText] = useState("")
  const [feedbackReplySaving, setFeedbackReplySaving] = useState(false)
  const [checkoutSettings, setCheckoutSettings] = useState({
    shippingPrice: 500,
    isShippingFree: false,
    globalDiscount: 0
  })
  const [visibleReceipts, setVisibleReceipts] = useState<Set<string>>(new Set())
  const router = useRouter()

  // State for save errors related to product form specifically
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth === "true") {
      setIsAuthenticated(true)
    } else {
      router.push("/admin")
    }
  }, [router])

  // Fetch feedbacks from backend
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!isAuthenticated) return
      
      try {
        setFeedbackLoading(true)
        const response = await fetch(`${API_BASE}/feedback?admin=true`)
        if (!response.ok) throw new Error("Failed to fetch feedbacks")
        const backendFeedbacks = await response.json()
        
        // Map backend structure to admin dashboard structure
        const mappedFeedbacks: Feedback[] = backendFeedbacks.map((fb: any) => ({
          id: fb._id || fb.id,
          customerName: fb.name,
          customerEmail: fb.role || "N/A",
          rating: fb.rating,
          message: fb.comment,
          date: fb.createdAt ? new Date(fb.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A",
          status: fb.status || "pending",
          fit: fb.fit,
          storeResponse: fb.storeResponse || "",
        }))
        
        setFeedback(mappedFeedbacks)
      } catch (error) {
        console.error("Error fetching feedbacks:", error)
        setFeedback([])
      } finally {
        setFeedbackLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchFeedbacks()
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    router.push("/admin")
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setProductError(null)
      // Fetch all products including limited edition products
      const response = await fetch(`${API_BASE}/products?limit=100`)
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }
      const data = await response.json()
      setProducts(Array.isArray(data.products) ? data.products : [])
    } catch (error) {
      console.error("Error fetching products:", error)
      setProductError("Failed to fetch products. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/orders`)
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`)
      }
      const data = await response.json()
      // Backend returns the array directly (res.json(orders)), not { orders }
      const ordersList = Array.isArray(data) ? data : (Array.isArray(data?.orders) ? data.orders : [])
      setOrders(ordersList)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLimitedEdition = async () => {
    try {
      setLimitedEditionError(null)
      const response = await fetch(`${API_BASE}/limited-edition?limit=100&status=all`)
      if (!response.ok) {
        throw new Error(`Failed to fetch limited edition: ${response.status}`)
      }
      const data = await response.json()
      console.log("Limited Edition API Response:", data)
      console.log("Limited Edition Products:", data.products)
      setLimitedEdition(Array.isArray(data.products) ? data.products : [])
    } catch (error) {
      console.error("Error fetching limited edition:", error)
      setLimitedEditionError("Failed to fetch limited edition products.")
    }
  }

  const handleAddProduct = () => {
    setIsAddingProduct(true)
    setProductForm({
      name: "",
      price: 0,
      category: "",
      description: "",
      // These fields seem to be from an older version or are not directly used in the form's state
      // categoryImageUrl: "",
      // limitedEditionImageUrl: "",
      stock: 0,
      rating: 0,
      reviews: 0,
      colors: [],
      sizes: [],
      orchidEnabled: false,
      orchidColors: [],
      features: [],
      isLimitedEdition: false,
      discount: 0,
      status: "active",
      images: [], // Initialize images as an empty array
    })
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    // Ensure images is an array for the form state
    setProductForm({ ...product, images: product.images || [] })
  }

  const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          // Compress to max 600px width while maintaining aspect ratio
          const maxWidth = 600
          const scale = maxWidth / img.width
          canvas.width = maxWidth
          canvas.height = img.height * scale

          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Convert to base64 with 60% quality
          const base64 = canvas.toDataURL("image/jpeg", 0.6)
          resolve(base64)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSaveProduct = async () => {
    try {
      setSaveError(null) // Clear previous save error

      // Validate required fields
      const missing: string[] = []
      if (!productForm.name || !productForm.name.trim()) missing.push("name")
      if (!productForm.category || !productForm.category.trim()) missing.push("category")
      if (productForm.price == null || Number.isNaN(Number(productForm.price))) missing.push("price")
      if (!productForm.images || productForm.images.length === 0) missing.push("images")
      if (!productForm.description || !productForm.description.trim()) missing.push("description")

      if (missing.length) {
        setSaveError(`Please fill required fields: ${missing.join(", ")}`)
        return
      }

      // Check for invalid file sizes before proceeding
      const fileImages = (productForm.images || []).filter((img) => img instanceof File) as File[]
      const invalidFiles = fileImages.filter((file) => !validateFileSize(file))
      if (invalidFiles.length > 0) {
        const fileNames = invalidFiles.map((f) => `${f.name} (${formatFileSize(f.size)})`).join(", ")
        setSaveError(
          `The following files are too large (max 5MB each): ${fileNames}. Please remove them and try again.`,
        )
        return
      }

      const orchidColorMetadata = await Promise.all(
        (productForm.orchidColors || []).map(async (orchidColor) => {
          let imageData = orchidColor.image

          if (orchidColor.image instanceof File) {
            // Compress to File object instead of base64
            // Use the new specific compression function for orchid images
            imageData = await compressOrchidImageToFile(orchidColor.image)
          }

          return {
            _id: orchidColor._id, // Preserve existing ID if editing
            name: orchidColor.name,
            value: orchidColor.value,
            available: orchidColor.available,
            image: imageData,
          }
        }),
      )

      const hasNewImages = (productForm.images || []).some((img) => img instanceof File)
      const hasNewOrchidImages = (orchidColorMetadata || []).some((oc) => oc.image instanceof File)

      const url = isAddingProduct ? `${API_BASE}/products` : `${API_BASE}/products/${editingProduct?._id}`
      const method = isAddingProduct ? "POST" : "PUT"

      let response: Response

      if (hasNewImages || hasNewOrchidImages) {
        // Use FormData for file uploads
        const formData = new FormData()

        // Append basic product fields
        formData.append("name", productForm.name!)
        formData.append("category", productForm.category!)
        formData.append("price", String(productForm.price!))
        if (productForm.originalPrice !== undefined && productForm.originalPrice !== null) {
          formData.append("originalPrice", String(productForm.originalPrice))
        }
        formData.append("description", productForm.description!)
        formData.append("stock", String(productForm.stock ?? 0))
        formData.append("rating", String(productForm.rating ?? 0))
        formData.append("reviews", String(productForm.reviews ?? 0))
        formData.append("discount", String(productForm.discount ?? 0))
        formData.append("status", productForm.status || "active")
        formData.append("isLimitedEdition", String(productForm.isLimitedEdition || false))
        formData.append("orchidEnabled", String(!!productForm.orchidEnabled))

        // Append sizes using array notation
        if (productForm.sizes && productForm.sizes.length > 0) {
          productForm.sizes.forEach((size, index) => {
            formData.append(`sizes[${index}][size]`, String(size.size || ""))
            formData.append(`sizes[${index}][available]`, String(size.available ?? false))
            formData.append(`sizes[${index}][stock]`, String(size.stock ?? 0))
            if (size._id) {
              formData.append(`sizes[${index}][_id]`, String(size._id))
            }
          })
        }

        // Append colors using array notation
        if (productForm.colors && productForm.colors.length > 0) {
          productForm.colors.forEach((color, index) => {
            formData.append(`colors[${index}][name]`, String(color.name || ""))
            formData.append(`colors[${index}][code]`, String(color.code || ""))
            formData.append(`colors[${index}][available]`, String(color.available ?? false))
            if (color._id) {
              formData.append(`colors[${index}][_id]`, String(color._id))
            }
          })
        }

        // Process orchid colors - separate file uploads from metadata
        // page.tsx (handleSaveProduct function තුළ)

        

const orchidImagesMap: { [key: number]: File } = {}

orchidColorMetadata.forEach((orchidColor, index) => {
  formData.append(`orchidColors[${index}][name]`, String(orchidColor.name || ""))
  formData.append(`orchidColors[${index}][value]`, String(orchidColor.value || ""))
  formData.append(`orchidColors[${index}][available]`, String(orchidColor.available ?? false))
  
  // 🟢 FIX 1: Edit කරන විට, දැනටමත් පවතින Image Path එක Backend එකට යවන්න.
  // Local file path එකක් නිසා '/uploads/' prefix එක යොදන්න.
  if (typeof orchidColor.image === "string" && orchidColor.image.startsWith('/uploads/')) {
    formData.append(`orchidColors[${index}][image]`, orchidColor.image)
  }

  // If image is a File object (compressed), store it for batch upload
  if (orchidColor.image instanceof File) {
    orchidImagesMap[index] = orchidColor.image
    
    // 🚨 FIX 2: Index එක යවන්නේ අලුත් File එකක් upload කරන Color එකට විතරයි.
    formData.append(`orchidImageIndexes`, String(index))
  }
})

// Append all orchid images under the 'images' field (from previous fix)
Object.values(orchidImagesMap).forEach((file) => {
  formData.append("images", file)
})

        // Append existing product image URLs as single JSON array so backend parses safely
        const existingImages = (productForm.images || []).filter((img) => typeof img === "string") as string[]
        formData.append("existingImages", JSON.stringify(existingImages))

          // Append new product image files
          ; (productForm.images || []).forEach((img) => {
            if (img instanceof File) {
              formData.append("images", img)
            }
          })

        response = await fetch(url, {
          method,
          body: formData,
        })
      } else {
        // No new images, send as JSON
        // Prepare orchidColors for JSON, converting File to base64 if necessary
        const orchidColorsForJson = await Promise.all(
          orchidColorMetadata.map(async (orchidColor) => {
            let imageData = orchidColor.image
            if (orchidColor.image instanceof File) {
              imageData = await compressAndConvertToBase64(orchidColor.image)
            }
            return {
              _id: orchidColor._id,
              name: orchidColor.name,
              value: orchidColor.value,
              available: orchidColor.available,
              image: imageData,
            }
          }),
        )

        const productData = {
          name: productForm.name!,
          category: productForm.category!,
          price: Number(productForm.price!),
          originalPrice: productForm.originalPrice !== undefined ? Number(productForm.originalPrice) : undefined,
          description: productForm.description!,
          stock: productForm.stock ?? 0,
          rating: productForm.rating ?? 0,
          reviews: productForm.reviews ?? 0,
          discount: productForm.discount ?? 0,
          status: productForm.status || "active",
          isLimitedEdition: productForm.isLimitedEdition || false,
          orchidEnabled: !!productForm.orchidEnabled,
          orchidColors: orchidColorsForJson,
          sizes: Array.isArray(productForm.sizes) ? productForm.sizes : [],
          colors: Array.isArray(productForm.colors) ? productForm.colors : [],
          features: productForm.features || [],
          images: (productForm.images || []).filter((img) => typeof img === "string") as string[],
        }

        response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "")
        setSaveError(`Failed to save product: ${response.status} ${errorText}`)
        return
      }

      await fetchProducts()
      if (isAddingProduct) {
        setIsAddingProduct(false)
      } else {
        setEditingProduct(null)
      }
      setProductForm({})
    } catch (error) {
      console.error("Error saving product:", error)
      setSaveError(`Failed to save product: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        await fetchProducts()
      } else {
        const errorText = await response.text()
        console.error("Error deleting product:", response.status, errorText)
        setProductError(`Failed to delete product: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      setProductError("Failed to delete product. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsAddingProduct(false)
    setEditingProduct(null)
    setProductForm({})
    setSaveError(null) // Clear save error on cancel
  }

  const fetchCategories = async () => {
    try {
      setCategoryError(null)
      const response = await fetch(`${API_BASE}/categories?status=active&limit=100`)
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`)
      const data = await response.json()
      setCategories(Array.isArray(data.categories) ? data.categories : [])
    } catch (err) {
      console.error("Error fetching categories:", err)
      setCategoryError("Failed to fetch categories. Please try again.")
    }
  }

  // Load checkout settings
  const loadCheckoutSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/checkout-settings`)
      if (response.ok) {
        const data = await response.json()
        setCheckoutSettings(data.settings)
      }
    } catch (error) {
      console.error("Error loading checkout settings:", error)
    }
  }

  // Save checkout settings
  const saveCheckoutSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/checkout-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutSettings),
      })
      
      if (response.ok) {
        alert('Settings saved successfully!')
        await loadCheckoutSettings()
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error("Error saving checkout settings:", error)
      alert('Failed to save settings')
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchLimitedEdition()
    fetchCategories()
    fetchOrders()
    loadCheckoutSettings()
  }, [])

  const handleAddCategory = () => {
    setIsAddingCategory(true)
    setCategoryForm({
      name: "",
      description: "",
      image: "",
      productCount: 0,
    })
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm(category)
  }

  const handleSaveCategory = async () => {
    try {
      setCategoryError(null)
      if (isAddingCategory) {
        const res = await fetch(`${API_BASE}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryForm.name,
            description: categoryForm.description,
            image: categoryForm.image,
            status: "active", // Assuming new categories are active by default
          }),
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Failed to add category: ${res.status} ${errorText}`)
        }
        setIsAddingCategory(false)
      } else if (editingCategory) {
        const res = await fetch(`${API_BASE}/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: categoryForm.name,
            description: categoryForm.description,
            image: categoryForm.image,
          }),
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Failed to update category: ${res.status} ${errorText}`)
        }
        setEditingCategory(null)
      }
      setCategoryForm({})
      await fetchCategories()
    } catch (err) {
      console.error("Error saving category:", err)
      setCategoryError((err as Error).message || "Failed to save category. Please try again.")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      setCategoryError(null)
      const res = await fetch(`${API_BASE}/categories/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to delete category: ${res.status} ${errorText}`)
      }
      await fetchCategories()
    } catch (err) {
      console.error("Error deleting category:", err)
      setCategoryError((err as Error).message || "Failed to delete category.")
    }
  }

  const handleCancelCategoryEdit = () => {
    setIsAddingCategory(false)
    setEditingCategory(null)
    setCategoryForm({})
  }

  const handleAddLimitedEdition = () => {
    setIsAddingLimitedEdition(true)
    setLimitedEditionForm({
      name: "",
      price: 0,
      originalPrice: 0,
      description: "",
      images: [],
      stock: 0,
      isActive: true,
      endDate: "",
      // New field to map to product model
      // @ts-ignore - casting to any for the category field
      category: "",
      status: "active", // Set default status
    })
  }

  const handleEditLimitedEdition = (item: LimitedEdition) => {
    setEditingLimitedEdition(item)
    setLimitedEditionForm({
      ...item,
      images: item.images || [],
      category: item.category || "",
      status: item.status || (item.isActive ? "active" : "inactive"),
      isActive: item.status === "active" || (item.isActive ?? true), // Set isActive based on status
      // Add size, color, and orchid color features
      sizes: item.sizes || [],
      colors: item.colors || [],
      orchidColors: item.orchidColors || [],
    })
  }

  const handleSaveLimitedEdition = async () => {
    try {
      setLoading(true)
      setLimitedEditionError(null)
      
      // Validate required fields
      const missing: string[] = []
      if (!limitedEditionForm.name || !limitedEditionForm.name.trim()) missing.push("name")
      if (!limitedEditionForm.category || !limitedEditionForm.category.trim()) missing.push("category")
      if (limitedEditionForm.price == null || Number.isNaN(Number(limitedEditionForm.price))) missing.push("price")
      if (!limitedEditionForm.images || limitedEditionForm.images.length === 0) missing.push("images")
      if (!limitedEditionForm.description || !limitedEditionForm.description.trim()) missing.push("description")

      if (missing.length) {
        setLimitedEditionError(`Please fill required fields: ${missing.join(", ")}`)
        setLoading(false)
        return
      }

      // Check for invalid file sizes before proceeding
      const fileImages = (limitedEditionForm.images || []).filter((img) => img instanceof File) as File[]
      const invalidFiles = fileImages.filter((file) => !validateFileSize(file))
      if (invalidFiles.length > 0) {
        const fileNames = invalidFiles.map((f) => `${f.name} (${formatFileSize(f.size)})`).join(", ")
        setLimitedEditionError(
          `The following files are too large (max 5MB each): ${fileNames}. Please remove them and try again.`,
        )
        setLoading(false)
        return
      }

      const orchidColorMetadata = await Promise.all(
        (limitedEditionForm.orchidColors || []).map(async (orchidColor) => {
          let imageData = orchidColor.image

          if (orchidColor.image instanceof File) {
            // Compress to File object instead of base64
            // Use the new specific compression function for orchid images
            imageData = await compressOrchidImageToFile(orchidColor.image)
          }

          return {
            _id: orchidColor._id, // Preserve existing ID if editing
            name: orchidColor.name,
            value: orchidColor.value,
            available: orchidColor.available,
            image: imageData,
          }
        }),
      )

      const hasNewImages = (limitedEditionForm.images || []).some((img) => img instanceof File)
      const hasNewOrchidImages = (orchidColorMetadata || []).some((oc) => oc.image instanceof File)

      const url = isAddingLimitedEdition ? `${API_BASE}/limited-edition` : `${API_BASE}/limited-edition/${editingLimitedEdition?.id}`
      const method = isAddingLimitedEdition ? "POST" : "PUT"

      let response: Response

      if (hasNewImages || hasNewOrchidImages) {
        // Use FormData for file uploads
        const formData = new FormData()

        // Append basic product fields
        formData.append("name", limitedEditionForm.name!)
        formData.append("category", limitedEditionForm.category!)
        formData.append("price", String(limitedEditionForm.price!))
        if (limitedEditionForm.originalPrice !== undefined && limitedEditionForm.originalPrice !== null) {
          formData.append("originalPrice", String(limitedEditionForm.originalPrice))
        }
        formData.append("description", limitedEditionForm.description!)
        formData.append("stock", String(limitedEditionForm.stock ?? 0))
        formData.append("rating", String(limitedEditionForm.rating ?? 0))
        formData.append("reviews", String(limitedEditionForm.reviews ?? 0))
        formData.append("discount", String(limitedEditionForm.discount ?? 0))
        formData.append("status", limitedEditionForm.isActive ? "active" : "inactive")
        formData.append("isLimitedEdition", "true")
        formData.append("orchidEnabled", String(!!limitedEditionForm.orchidEnabled))
        if (limitedEditionForm.endDate) {
          formData.append("endDate", limitedEditionForm.endDate)
        }

        // Append sizes using array notation
        if (limitedEditionForm.sizes && limitedEditionForm.sizes.length > 0) {
          limitedEditionForm.sizes.forEach((size, index) => {
            formData.append(`sizes[${index}][size]`, String(size.size || ""))
            formData.append(`sizes[${index}][available]`, String(size.available ?? false))
            formData.append(`sizes[${index}][stock]`, String(size.stock ?? 0))
            if (size._id) {
              formData.append(`sizes[${index}][_id]`, String(size._id))
            }
          })
        }

        // Append colors using array notation
        if (limitedEditionForm.colors && limitedEditionForm.colors.length > 0) {
          limitedEditionForm.colors.forEach((color, index) => {
            formData.append(`colors[${index}][name]`, String(color.name || ""))
            formData.append(`colors[${index}][code]`, String(color.code || ""))
            formData.append(`colors[${index}][available]`, String(color.available ?? false))
            if (color._id) {
              formData.append(`colors[${index}][_id]`, String(color._id))
            }
          })
        }

        // Process orchid colors - separate file uploads from metadata
        const orchidImagesMap: { [key: number]: File } = {}

        orchidColorMetadata.forEach((orchidColor, index) => {
          formData.append(`orchidColors[${index}][name]`, String(orchidColor.name || ""))
          formData.append(`orchidColors[${index}][value]`, String(orchidColor.value || ""))
          formData.append(`orchidColors[${index}][available]`, String(orchidColor.available ?? false))
          
          // 🟢 FIX 1: Edit කරන විට, දැනටමත් පවතින Image Path එක Backend එකට යවන්න.
          // Local file path එකක් නිසා '/uploads/' prefix එක යොදන්න.
          if (typeof orchidColor.image === "string" && orchidColor.image.startsWith('/uploads/')) {
            formData.append(`orchidColors[${index}][image]`, orchidColor.image)
          }

          // If image is a File object (compressed), store it for batch upload
          if (orchidColor.image instanceof File) {
            orchidImagesMap[index] = orchidColor.image
            
            // 🚨 FIX 2: Index එක යවන්නේ අලුත් File එකක් upload කරන Color එකට විතරයි.
            formData.append(`orchidImageIndexes`, String(index))
          }
        })

        // Append all orchid images under the 'images' field (from previous fix)
        Object.values(orchidImagesMap).forEach((file) => {
          formData.append("images", file)
        })

        // Append existing product image URLs
        const existingImages = (limitedEditionForm.images || []).filter((img) => typeof img === "string") as string[]
        existingImages.forEach((imageUrl) => {
          formData.append("existingImages", imageUrl)
        })

        // Append new product image files
        ;(limitedEditionForm.images || []).forEach((img) => {
            if (img instanceof File) {
              formData.append("images", img)
            }
          })

        response = await fetch(url, {
          method,
          body: formData,
        })
      } else {
        // No new images, send as JSON
        // Prepare orchidColors for JSON, converting File to base64 if necessary
        const orchidColorsForJson = await Promise.all(
          orchidColorMetadata.map(async (orchidColor) => {
            let imageData = orchidColor.image
            if (orchidColor.image instanceof File) {
              imageData = await compressAndConvertToBase64(orchidColor.image)
            }
            return {
              _id: orchidColor._id,
              name: orchidColor.name,
              value: orchidColor.value,
              available: orchidColor.available,
              image: imageData,
            }
          }),
        )

        const productData = {
          name: limitedEditionForm.name!,
          category: limitedEditionForm.category!,
          price: Number(limitedEditionForm.price!),
          originalPrice: limitedEditionForm.originalPrice !== undefined ? Number(limitedEditionForm.originalPrice) : undefined,
          description: limitedEditionForm.description!,
          stock: limitedEditionForm.stock ?? 0,
          rating: limitedEditionForm.rating ?? 0,
          reviews: limitedEditionForm.reviews ?? 0,
          discount: limitedEditionForm.discount ?? 0,
          status: limitedEditionForm.isActive ? "active" : "inactive",
          isLimitedEdition: true,
          orchidEnabled: !!limitedEditionForm.orchidEnabled,
          orchidColors: orchidColorsForJson,
          sizes: Array.isArray(limitedEditionForm.sizes) ? limitedEditionForm.sizes : [],
          colors: Array.isArray(limitedEditionForm.colors) ? limitedEditionForm.colors : [],
          features: limitedEditionForm.features || [],
          images: (limitedEditionForm.images || []).filter((img) => typeof img === "string") as string[],
          endDate: limitedEditionForm.endDate || undefined,
        }

        response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "")
        setLimitedEditionError(`Failed to save limited edition: ${response.status} ${errorText}`)
        setLoading(false)
        return
      }

      await fetchLimitedEdition()
      if (isAddingLimitedEdition) {
        setIsAddingLimitedEdition(false)
      } else {
        setEditingLimitedEdition(null)
      }

      setLimitedEditionForm({})
      await fetchLimitedEdition()
    } catch (error) {
      console.error("Error saving limited edition:", error)
      setLimitedEditionError((error as Error).message || "Failed to save limited edition. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLimitedEdition = async (id: string) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/limited-edition/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to delete limited edition: ${res.status} ${errorText}`)
      }
      await fetchLimitedEdition()
    } catch (error) {
      console.error("Error deleting limited edition:", error)
      setLimitedEditionError((error as Error).message || "Failed to delete limited edition.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelLimitedEditionEdit = () => {
    setIsAddingLimitedEdition(false)
    setEditingLimitedEdition(null)
    setLimitedEditionForm({
      sizes: [],
      colors: [],
      orchidColors: [],
      isActive: true, // Reset to active by default
      status: "active", // Reset status to active
    })
  }

  const handleToggleLimitedEditionStatus = async (id: string) => {
    try {
      const item = limitedEdition.find((le) => le.id === id)
      if (!item) return
      // Determine current status correctly
      const currentStatus = item.status || (item.isActive ? "active" : "inactive")
      const newStatus = currentStatus === "active" ? "inactive" : "active"

      const res = await fetch(`${API_BASE}/limited-edition/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to toggle status: ${res.status} ${errorText}`)
      }
      await fetchLimitedEdition()
    } catch (error) {
      console.error("Error toggling limited edition status:", error)
      setLimitedEditionError((error as Error).message || "Failed to update status.")
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["orderStatus"]) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      })

      if (response.ok) {
        setOrders(orders.map((order) => 
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        ))
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const handleAddTrackingNumber = (orderId: string, trackingNumber: string) => {
    setOrders(orders.map((order) => (order._id === orderId ? { ...order, trackingNumber } : order)))
  }

  const handleUpdateFeedbackStatus = async (feedbackId: string, newStatus: Feedback["status"]) => {
    try {
      const response = await fetch(`${API_BASE}/feedback/${feedbackId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update feedback status")

      // Update local state
      setFeedback(feedback.map((fb) => (fb.id === feedbackId ? { ...fb, status: newStatus } : fb)))
    } catch (error) {
      console.error("Error updating feedback status:", error)
      alert("Failed to update feedback status. Please try again.")
    }
  }

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return

    try {
      const response = await fetch(`${API_BASE}/feedback/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete feedback")

      // Update local state
      setFeedback(feedback.filter((fb) => fb.id !== id))
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null)
      }
    } catch (error) {
      console.error("Error deleting feedback:", error)
      alert("Failed to delete feedback. Please try again.")
    }
  }

  const handleSaveFeedbackReply = async () => {
    if (!selectedFeedback) return
    setFeedbackReplySaving(true)
    try {
      const response = await fetch(`${API_BASE}/feedback/${selectedFeedback.id}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeResponse: feedbackReplyText }),
      })
      if (!response.ok) throw new Error("Failed to save reply")
      const data = await response.json()
      const reply = data.storeResponse != null ? String(data.storeResponse) : feedbackReplyText
      setFeedback(feedback.map((fb) => (fb.id === selectedFeedback.id ? { ...fb, storeResponse: reply } : fb)))
      setSelectedFeedback((prev) => (prev && prev.id === selectedFeedback.id ? { ...prev, storeResponse: reply } : prev))
    } catch (error) {
      console.error("Error saving reply:", error)
      alert("Failed to save reply. Please try again.")
    } finally {
      setFeedbackReplySaving(false)
    }
  }

  const getFeedbackStatusColor = (status: Feedback["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRatingStars = (rating: number) => {
    const n = Number.isFinite(rating) ? rating : 0
    const stars = Math.round(Math.min(Math.max(n, 0), 5))
    return "⭐".repeat(stars) + "☆".repeat(5 - stars)
  }

  const getStatusColor = (status: Order["orderStatus"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="text-amber-800">Loading...</div>
      </div>
    )
  }

  const stats = [
    { title: "Total Products", value: products.length.toString(), icon: Package, color: "bg-blue-500" },
    { title: "Total Orders", value: orders.length.toString(), icon: ShoppingCart, color: "bg-green-500" },
    { title: "Active Users", value: "234", icon: Users, color: "bg-purple-500" }, // Reduced from 456
    { title: "Reviews", value: "156", icon: Star, color: "bg-yellow-500" }, // Reduced from 234
  ]

  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "categories", label: "Categories", icon: TrendingUp },
    { id: "limited-edition", label: "Limited Edition", icon: Star },
    { id: "feedback", label: "Feedback", icon: Users },
    { id: "live-chat", label: "Live Chat", icon: MessageCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-100 to-amber-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-amber-200/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-amber-300/15 rounded-full blur-lg animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-amber-100/25 rounded-full blur-2xl animate-float-slow"></div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen backdrop-blur-xl bg-white/70 border-r border-white/30 shadow-xl">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-amber-900 mb-8">EVORA Admin</h1>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeSection === item.id
                    ? "bg-amber-200/50 text-amber-900 shadow-md"
                    : "text-amber-700 hover:bg-amber-100/50"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-amber-200">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full flex items-center gap-3 px-4 py-3 text-amber-700 hover:bg-red-100/50 hover:text-red-700"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === "overview" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-amber-900">Dashboard Overview</h2>
                <Link href="/">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Eye className="w-4 h-4 mr-2" />
                    View Website
                  </Button>
                </Link>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-amber-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.color} text-white`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <Card className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                <h3 className="text-xl font-semibold text-amber-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveSection("products")}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex flex-col items-center gap-2"
                  >
                    <Plus className="w-6 h-6" />
                    Add New Product
                  </Button>
                  <Button
                    onClick={() => setActiveSection("orders")}
                    className="bg-green-600 hover:bg-green-700 text-white p-4 h-auto flex flex-col items-center gap-2"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    Manage Orders
                  </Button>
                  <Button
                    onClick={() => setActiveSection("feedback")}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto flex flex-col items-center gap-2"
                  >
                    <Star className="w-6 h-6" />
                    View Feedback
                  </Button>
                  <Button
                    onClick={() => setActiveSection("checkout")}
                    className="bg-orange-600 hover:bg-orange-700 text-white p-4 h-auto flex flex-col items-center gap-2"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    Checkout Settings
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeSection === "products" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-amber-900">Products Management</h2>
                {/* Changed button to use setIsAddingProduct */}
                <Button onClick={() => setIsAddingProduct(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {productError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">{productError}</div>
              )}
              {saveError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">{saveError}</div>
              )}

              {/* Add/Edit Product Form */}
              {(isAddingProduct || editingProduct) && (
                <Card className="p-6 mb-8 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                  <h3 className="text-xl font-semibold text-amber-900 mb-6">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Product Name</label>
                      <Input
                        value={productForm.name || ""}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Category</label>
                      <select
                        value={productForm.category || ""}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full p-2 backdrop-blur-sm bg-white/50 border border-amber-200 rounded-md"
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Price (Rs.)</label>
                      <Input
                        type="number"
                        value={productForm.price ?? 0}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Original Price (Rs.)</label>
                      <Input
                        type="number"
                        value={productForm.originalPrice ?? 0}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter original price (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Stock Quantity</label>
                      <Input
                        type="number"
                        value={productForm.stock ?? 0}
                        onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter stock quantity"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-amber-800 mb-2">Product Description</label>
                      <Textarea
                        value={productForm.description || ""}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter product description"
                        rows={3}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-amber-800 mb-2">Product Images</label>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || [])
                          const currentImages = productForm.images || []
                          const currentCount = currentImages.length

                          const invalidFiles = newFiles.filter((file) => !validateFileSize(file))
                          if (invalidFiles.length > 0) {
                            const fileNames = invalidFiles
                              .map((f) => `${f.name} (${formatFileSize(f.size)})`)
                              .join(", ")
                            alert(`The following files are too large (max 5MB each): ${fileNames}`)
                            e.target.value = "" // Clear the input
                            return
                          }

                          const availableSlots = 5 - currentCount
                          const filesToAdd = newFiles.slice(0, availableSlots)

                          if (newFiles.length > availableSlots) {
                            alert(
                              `You can only add ${availableSlots} more image${availableSlots !== 1 ? "s" : ""}. Maximum 5 images per product.`,
                            )
                          }

                          const updatedImages = [...currentImages, ...filesToAdd]
                          setProductForm({ ...productForm, images: updatedImages })
                          e.target.value = "" // Clear input after successful upload
                        }}
                        className="w-full p-2 border border-amber-200 rounded-md bg-white/50"
                        disabled={(productForm.images || []).length >= 5}
                      />
                      <p className="text-xs text-amber-600 mt-1">
                        Maximum file size: 5MB per image. Supported formats: JPEG, JPG, PNG
                      </p>
                      {(productForm.images || []).length >= 5 && (
                        <p className="text-sm text-amber-600 mt-1">
                          Maximum 5 images reached. Remove an image to add more.
                        </p>
                      )}
                      {(productForm.images || []).length > 0 && (
                        <p className="text-sm text-amber-700 mt-1">
                          {(productForm.images || []).length}/5 images uploaded
                          {(productForm.images || []).length < 5 &&
                            ` (You can add ${5 - (productForm.images || []).length} more images)`}
                        </p>
                      )}
                      {(productForm.images || []).length > 0 && (
                        <ProductImagePreview
                          images={productForm.images || []}
                          onRemove={(index) => {
                            const newImages = (productForm.images || []).filter((_, i) => i !== index)
                            setProductForm({ ...productForm, images: newImages })
                          }}
                        />
                      )}
                    </div>

                    {/* Sizes Section */}
                    <div className="md:col-span-2 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-amber-900">Sizes</label>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() =>
                            setProductForm({
                              ...productForm,
                              sizes: [...(productForm.sizes || []), { size: "", available: true, stock: 0 }],
                            })
                          }
                        >
                          + Add Size
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(productForm.sizes || []).map((s, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-4">
                              <Input
                                placeholder="Size (e.g., 36)"
                                value={s.size}
                                onChange={(e) => {
                                  const arr = [...(productForm.sizes || [])]
                                  arr[idx] = { ...arr[idx], size: e.target.value }
                                  setProductForm({ ...productForm, sizes: arr })
                                }}
                                className="backdrop-blur-sm bg-white/50 border-amber-200"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                placeholder="Stock"
                                value={s.stock ?? 0}
                                onChange={(e) => {
                                  const arr = [...(productForm.sizes || [])]
                                  arr[idx] = { ...arr[idx], stock: Number(e.target.value) }
                                  setProductForm({ ...productForm, sizes: arr })
                                }}
                                className="backdrop-blur-sm bg-white/50 border-amber-200"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="inline-flex items-center gap-2 text-sm text-amber-800">
                                <input
                                  type="checkbox"
                                  checked={s.available}
                                  onChange={(e) => {
                                    const arr = [...(productForm.sizes || [])]
                                    arr[idx] = { ...arr[idx], available: e.target.checked }
                                    setProductForm({ ...productForm, sizes: arr })
                                  }}
                                />
                                Available
                              </label>
                            </div>
                            <div className="col-span-2 text-right">
                              <Button
                                type="button"
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => {
                                  const arr = [...(productForm.sizes || [])]
                                  arr.splice(idx, 1)
                                  setProductForm({ ...productForm, sizes: arr })
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Colors Section */}
                    <div className="md:col-span-2 mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-amber-900">Colors</label>
                        <Button
                          type="button"
                          size="sm"
                          className="relative bg-amber-600 hover:bg-amber-700 text-white overflow-hidden"
                        >
                          <span className="pointer-events-none">+ Add Color</span>
                          {/* Real clickable area is the color input overlay */}
                          <input
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const selectedColor = e.target.value
                              if (!selectedColor) return
                              setProductForm({
                                ...productForm,
                                colors: [
                                  ...(productForm.colors || []),
                                  { name: "", code: selectedColor, available: true },
                                ],
                              })
                            }}
                          />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(productForm.colors || []).map((c, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-4">
                              <Input
                                placeholder="Color Name"
                                value={c.name}
                                onChange={(e) => {
                                  const arr = [...(productForm.colors || [])]
                                  arr[idx] = { ...arr[idx], name: e.target.value }
                                  setProductForm({ ...productForm, colors: arr })
                                }}
                                className="backdrop-blur-sm bg-white/50 border-amber-200"
                              />
                            </div>
                            <div className="col-span-4">
                              <Input
                                placeholder="#HEX"
                                value={c.code}
                                onChange={(e) => {
                                  const arr = [...(productForm.colors || [])]
                                  arr[idx] = { ...arr[idx], code: e.target.value }
                                  setProductForm({ ...productForm, colors: arr })
                                }}
                                className="backdrop-blur-sm bg-white/50 border-amber-200"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="inline-flex items-center gap-2 text-sm text-amber-800">
                                <input
                                  type="checkbox"
                                  checked={c.available !== false}
                                  onChange={(e) => {
                                    const arr = [...(productForm.colors || [])]
                                    arr[idx] = { ...arr[idx], available: e.target.checked }
                                    setProductForm({ ...productForm, colors: arr })
                                  }}
                                />
                                Available
                              </label>
                            </div>
                            <div className="col-span-2 text-right">
                              <Button
                                type="button"
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => {
                                  const arr = [...(productForm.colors || [])]
                                  arr.splice(idx, 1)
                                  setProductForm({ ...productForm, colors: arr })
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Orchid Options */}
                    <div className="md:col-span-2 mt-6">
                      <label className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
                        <input
                          type="checkbox"
                          checked={!!productForm.orchidEnabled}
                          onChange={(e) => setProductForm({ ...productForm, orchidEnabled: e.target.checked })}
                        />
                        Enable Orchid Options
                      </label>

                      {productForm.orchidEnabled && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-amber-900">Orchid Colors</span>
                            <Button
                              type="button"
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700 text-white"
                              onClick={() =>
                                setProductForm({
                                  ...productForm,
                                  orchidColors: [
                                    ...(productForm.orchidColors || []),
                                    { name: "", value: "", available: true, image: undefined },
                                  ],
                                })
                              }
                            >
                              + Add Orchid Color
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {(productForm.orchidColors || []).map((o, idx) => (
                              <div key={idx} className="border border-amber-200 rounded-lg p-3 bg-white/30">
                                <div className="grid grid-cols-12 gap-2 items-start">
                                  <div className="col-span-4">
                                    <label className="text-xs text-amber-800 mb-1 block">Orchid Name</label>
                                    <Input
                                      placeholder="e.g., Purple Orchid"
                                      value={o.name}
                                      onChange={(e) => {
                                        const arr = [...(productForm.orchidColors || [])]
                                        arr[idx] = { ...arr[idx], name: e.target.value }
                                        setProductForm({ ...productForm, orchidColors: arr })
                                      }}
                                      className="backdrop-blur-sm bg-white/50 border-amber-200"
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <label className="text-xs text-amber-800 mb-1 block">Color Code</label>
                                    <Input
                                      placeholder="#HEX"
                                      value={o.value}
                                      onChange={(e) => {
                                        const arr = [...(productForm.orchidColors || [])]
                                        arr[idx] = { ...arr[idx], value: e.target.value }
                                        setProductForm({ ...productForm, orchidColors: arr })
                                      }}
                                      className="backdrop-blur-sm bg-white/50 border-amber-200"
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <label className="text-xs text-amber-800 mb-1 block">Orchid Image</label>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          const arr = [...(productForm.orchidColors || [])]
                                          arr[idx] = { ...arr[idx], image: file }
                                          setProductForm({ ...productForm, orchidColors: arr })
                                        }
                                      }}
                                      className="backdrop-blur-sm bg-white/50 border-amber-200 text-xs"
                                    />
                                  </div>
                                  <div className="col-span-2 flex items-end gap-2">
                                    <label className="inline-flex items-center gap-1 text-xs text-amber-800">
                                      <input
                                        type="checkbox"
                                        checked={o.available !== false}
                                        onChange={(e) => {
                                          const arr = [...(productForm.orchidColors || [])]
                                          arr[idx] = { ...arr[idx], available: e.target.checked }
                                          setProductForm({ ...productForm, orchidColors: arr })
                                        }}
                                      />
                                      Available
                                    </label>
                                    <Button
                                      type="button"
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700 text-white h-8 px-2"
                                      onClick={() => {
                                        const arr = [...(productForm.orchidColors || [])]
                                        arr.splice(idx, 1)
                                        setProductForm({ ...productForm, orchidColors: arr })
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>

                                {o.image && (
                                  <div className="mt-2">
                                    <img
                                      src={typeof o.image === "string" ? o.image : URL.createObjectURL(o.image)}
                                      alt={o.name || "Orchid preview"}
                                      className="h-20 w-20 object-cover rounded border border-amber-300"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <Button
                      onClick={handleSaveProduct}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Saving..." : "Save Product"}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {/* Products List */}
              <div className="grid gap-6">
                {loading && <div className="text-center text-amber-700">Loading products...</div>}
                {!loading && products.length === 0 && (
                  <div className="text-center text-amber-700 py-8">No products found. Add some to get started.</div>
                )}
                {products.map((product) => {
                  // const productImage = Array.isArray(product.images) && product.images.length > 0
                  //   ? (typeof product.images[0] === 'string' ? product.images[0] : '/placeholder.svg')
                  //   : '/placeholder.svg';
                  return (
                    <Card
                      key={product._id}
                      className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg"
                    >
                      <div className="flex items-center gap-6">
                        <ImageSlider images={product.images || []} productName={product.name} />

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-amber-900">{product.name}</h3>
                          <p className="text-amber-700 text-sm mb-2">{product.category}</p>
                          <p className="text-amber-600 text-sm">{product.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-lg font-bold text-amber-900">
                              Rs. {(product.price ?? 0).toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-amber-600 line-through">
                                Rs. {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="text-sm text-amber-700">Stock: {product.stock}</span>
                            <span className="text-sm text-amber-700">
                              ⭐ {product.rating} ({product.reviews})
                            </span>
                            {product.images && product.images.length > 1 && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                {product.images.length} images
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditProduct(product)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteProduct(product._id)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {activeSection === "orders" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-amber-900">Orders Management</h2>
                <div className="flex gap-2">
                  <select className="px-4 py-2 rounded-lg backdrop-blur-sm bg-white/50 border border-amber-200 text-amber-800">
                    <option value="">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              <div className="grid gap-6">
                {orders.length === 0 && <div className="text-center text-amber-700 py-8">No orders found yet.</div>}
                {orders.map((order) => (
                  <Card key={order._id} className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-amber-900">Order #{order.orderNumber}</h3>
                        
                        {/* Customer Information - Highlighted */}
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2 mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-semibold text-amber-900 text-sm">Customer Information</span>
                          </div>
                          <div className="space-y-1">
                            {/* Debug info - remove after fixing */}
                            {(() => {
                              console.log('Order debug:', {
                                orderNumber: order.orderNumber,
                                hasUser: !!order.user,
                                hasGuestDetails: !!order.guestDetails,
                                guestDetails: order.guestDetails,
                                userId: order.userId,
                                userIdType: typeof order.userId,
                                isPopulatedUserId: typeof order.userId === 'object' && order.userId !== null,
                                userData: getUserData(order)
                              })
                              return null
                            })()}
                            <p className="text-amber-800 text-sm font-medium">
                              <span className="font-semibold">Name:</span> {
                                getUserData(order) ? 
                                  `${getUserData(order)!.firstName} ${getUserData(order)!.lastName}` : 
                                  `${order.guestDetails?.firstName || 'N/A'} ${order.guestDetails?.lastName || 'N/A'}`
                              }
                            </p>
                            <p className="text-amber-800 text-sm font-medium">
                              <span className="font-semibold">Email:</span> {
                                getUserData(order)?.email || order.guestDetails?.email || 'N/A'
                              }
                            </p>
                            <div className="bg-blue-100 border border-blue-300 rounded-md p-2 mt-2">
                              <p className="text-blue-900 text-sm font-bold flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="font-semibold">Phone:</span> 
                                <span className={`font-bold ${(getUserData(order)?.phone || order.guestDetails?.phone || order.phone) ? 'text-blue-700' : 'text-red-600'}`}>
                                  {(getUserData(order)?.phone || order.guestDetails?.phone || order.phone) || 'Not provided'}
                                </span>
                              </p>
                            </div>
                            <p className="text-amber-700 text-xs mt-1">
                              {getUserData(order) ? 'Registered User' : 'Guest Checkout'}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-amber-600 text-sm">Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value as Order["orderStatus"])}
                          className="px-3 py-1 rounded-lg backdrop-blur-sm bg-white/50 border border-amber-200 text-amber-800 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-amber-900 mb-2">Products</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-amber-50/50 rounded-lg">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-amber-900">{item.name}</p>
                                <p className="text-sm text-amber-700">
                                  Qty: {item.quantity} • Rs. {item.price.toFixed(2)}
                                  {item.size && ` • Size: ${item.size}`}
                                  {item.color && ` • Color: ${item.color}`}
                                </p>
                              </div>
                              <p className="font-medium text-amber-900">
                                Rs. {(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-amber-900 mb-2">Order Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-amber-700">Subtotal:</span>
                            <span className="text-amber-900">Rs. {order.subtotal.toFixed(2)}</span>
                            </div>
                          <div className="flex justify-between">
                            <span className="text-amber-700">Shipping:</span>
                            <span className="text-amber-900">Rs. {order.shipping.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-700">Tax:</span>
                            <span className="text-amber-900">Rs. {order.tax.toFixed(2)}</span>
                            </div>
                          <div className="flex justify-between font-medium border-t border-amber-200 pt-2">
                            <span className="text-amber-900">Total:</span>
                            <span className="text-amber-900">Rs. {order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-medium text-amber-900 mb-2">Shipping Address</h4>
                          <p className="text-sm text-amber-700">
                            {order.shippingAddress.street}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                            {order.shippingAddress.country} {order.shippingAddress.zipCode}
                          </p>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-medium text-amber-900 mb-2">Payment Method</h4>
                          <p className="text-sm text-amber-700">
                            {order.paymentMethod.type === 'cod' 
                              ? 'Cash on Delivery' 
                              : order.paymentMethod.type === 'bankTransfer'
                                ? 'Bank Transfer'
                                : `${order.paymentMethod.cardType.toUpperCase()} ****${order.paymentMethod.cardNumber.slice(-4)}`}<br />
                            {order.paymentMethod.cardHolderName}
                          </p>
                        </div>

                        {/* View Receipt Button for Bank Transfer Orders */}
                        {order.paymentMethod.type === 'bankTransfer' && order.paymentMethod.transactionSlip && (
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                setVisibleReceipts(prev => {
                                  const newSet = new Set(prev)
                                  if (newSet.has(order._id)) {
                                    newSet.delete(order._id)
                                  } else {
                                    newSet.add(order._id)
                                  }
                                  return newSet
                                })
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              <span>{visibleReceipts.has(order._id) ? 'Hide Receipt' : 'View Receipt'}</span>
                            </button>
                            
                            {/* Receipt Section - Hidden by default */}
                            {visibleReceipts.has(order._id) && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Eye className="w-4 h-4 text-blue-700" />
                                  <h4 className="font-medium text-blue-900">Transaction Receipt</h4>
                                </div>
                                <div className="relative group">
                                  <img
                                    src={order.paymentMethod.transactionSlip}
                                    alt="Transaction Receipt"
                                    className="w-full max-w-md rounded-lg border border-blue-200 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                                    onClick={() => {
                                      const newWindow = window.open()
                                      if (newWindow) {
                                        newWindow.document.write(`
                                          <html>
                                            <head><title>Transaction Receipt - Order ${order.orderNumber}</title></head>
                                            <body style="margin:0;padding:20px;background:#f5f5f5;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                                              <img src="${order.paymentMethod.transactionSlip}" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);" />
                                            </body>
                                          </html>
                                        `)
                                      }
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 max-w-md">
                                    <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Click to view full size</span>
                                  </div>
                                </div>
                                <p className="text-xs text-blue-700 mt-2">Click on the image to view in full size</p>
                              </div>
                            )}
                          </div>
                        )}

                        {order.trackingNumber && (
                          <div className="mt-4">
                            <h4 className="font-medium text-amber-900 mb-2">Tracking Number</h4>
                            <p className="text-sm text-amber-700 font-mono">{order.trackingNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === "checkout" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-amber-900">Checkout Settings</h2>
                      </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Shipping Settings */}
                <Card className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                  <h3 className="text-xl font-semibold text-amber-900 mb-6">Shipping Settings</h3>

                      <div className="space-y-6">
                    {/* Free Shipping Toggle */}
                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                          <div>
                        <h4 className="font-medium text-amber-900">Free Shipping</h4>
                        <p className="text-sm text-amber-700">Enable free shipping for all orders</p>
                            </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkoutSettings.isShippingFree}
                          onChange={(e) => setCheckoutSettings({
                            ...checkoutSettings,
                            isShippingFree: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                          </div>

                    {/* Shipping Price */}
                    {!checkoutSettings.isShippingFree && (
                          <div>
                        <label className="block text-sm font-medium text-amber-800 mb-2">Shipping Price (Rs.)</label>
                        <Input
                          type="number"
                          value={checkoutSettings.shippingPrice}
                          onChange={(e) => setCheckoutSettings({
                            ...checkoutSettings,
                            shippingPrice: parseInt(e.target.value) || 0
                          })}
                          className="w-full"
                          placeholder="Enter shipping price"
                        />
                      </div>
                    )}

                    {/* Current Settings Display */}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Current Settings</h4>
                      <p className="text-sm text-green-700">
                        {checkoutSettings.isShippingFree 
                          ? "✅ Free shipping enabled for all orders" 
                          : `💰 Shipping price: Rs. ${checkoutSettings.shippingPrice}`
                        }
                      </p>
                            </div>
                          </div>
                </Card>

                {/* Discount Settings */}
                <Card className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                  <h3 className="text-xl font-semibold text-amber-900 mb-6">Discount Settings</h3>
                  
                  <div className="space-y-6">
                    {/* Global Discount */}
                        <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Global Discount (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={checkoutSettings.globalDiscount}
                        onChange={(e) => setCheckoutSettings({
                          ...checkoutSettings,
                          globalDiscount: parseInt(e.target.value) || 0
                        })}
                        className="w-full"
                        placeholder="Enter discount percentage"
                      />
                      <p className="text-xs text-amber-600 mt-1">This discount will be applied to all products</p>
                                </div>

                    {/* Discount Preview */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Discount Preview</h4>
                      <p className="text-sm text-blue-700">
                        {checkoutSettings.globalDiscount > 0 
                          ? `🎉 ${checkoutSettings.globalDiscount}% discount applied to all products` 
                          : "No global discount applied"
                        }
                                </p>
                              </div>

                    {/* Save Settings Button */}
                    <Button 
                      onClick={saveCheckoutSettings}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Save Settings
                    </Button>
                              </div>
                </Card>
                            </div>

              {/* Settings Summary */}
              <Card className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg mt-8">
                <h3 className="text-xl font-semibold text-amber-900 mb-4">Settings Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50 rounded-lg text-center">
                    <h4 className="font-medium text-amber-900">Shipping</h4>
                    <p className="text-2xl font-bold text-amber-800">
                      {checkoutSettings.isShippingFree ? 'FREE' : `Rs. ${checkoutSettings.shippingPrice}`}
                    </p>
                          </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <h4 className="font-medium text-green-900">Global Discount</h4>
                    <p className="text-2xl font-bold text-green-800">
                      {checkoutSettings.globalDiscount}%
                    </p>
                        </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <h4 className="font-medium text-blue-900">Status</h4>
                    <p className="text-lg font-bold text-blue-800">Active</p>
                      </div>
                    </div>
                  </Card>
            </div>
          )}

          {activeSection === "categories" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-amber-900">Categories Management</h2>
                <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
              {categoryError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">{categoryError}</div>
              )}

              {/* Add/Edit Category Form */}
              {(isAddingCategory || editingCategory) && (
                <Card className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg mb-8">
                  <h3 className="text-xl font-semibold text-amber-900 mb-4">
                    {isAddingCategory ? "Add New Category" : "Edit Category"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Category Name</label>
                      <Input
                        value={categoryForm.name || ""}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter category name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Product Count</label>
                      <Input
                        type="number"
                        value={categoryForm.productCount ?? 0}
                        onChange={(e) => setCategoryForm({ ...categoryForm, productCount: Number(e.target.value) })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter product count"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Image URL</label>
                      <Input
                        value={categoryForm.image || ""}
                        onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter image URL"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-amber-800 mb-2">Description</label>
                      <Textarea
                        value={categoryForm.description || ""}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter category description"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <Button onClick={handleSaveCategory} className="bg-green-600 hover:bg-green-700 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Save Category
                    </Button>
                    <Button
                      onClick={handleCancelCategoryEdit}
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {/* Categories List */}
              <div className="grid gap-6">
                {categories.length === 0 && !categoryError && (
                  <div className="text-center text-amber-700 py-8">No categories found. Add some to get started.</div>
                )}
                {categories.map((category) => (
                  <Card key={category.id} className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                    <div className="flex items-center gap-6">
                      <SafeImage
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-amber-900">{category.name}</h3>
                        <p className="text-amber-600 text-sm mb-2">{category.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-amber-700">Products: {category.productCount}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditCategory(category)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteCategory(category.id)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === "limited-edition" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-amber-900">Limited Edition Management</h2>
                <Button onClick={handleAddLimitedEdition} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Limited Edition
                </Button>
              </div>

              {/* Add/Edit Limited Edition Form */}
              {(isAddingLimitedEdition || editingLimitedEdition) && (
                <Card className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg mb-8">
                  <h3 className="text-xl font-semibold text-amber-900 mb-4">
                    {isAddingLimitedEdition ? "Add New Limited Edition" : "Edit Limited Edition"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Product Name</label>
                      <Input
                        value={limitedEditionForm.name || ""}
                        onChange={(e) => setLimitedEditionForm({ ...limitedEditionForm, name: e.target.value })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Category</label>
                      <select
                        value={limitedEditionForm.category || ""}
                        onChange={(e) =>
                          setLimitedEditionForm({ ...limitedEditionForm, category: e.target.value })
                        }
                        className="w-full p-2 backdrop-blur-sm bg-white/50 border border-amber-200 rounded-md"
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Price (Rs.)</label>
                      <Input
                        type="number"
                        value={limitedEditionForm.price ?? 0}
                        onChange={(e) =>
                          setLimitedEditionForm({ ...limitedEditionForm, price: Number(e.target.value) })
                        }
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Original Price (Rs.)</label>
                      <Input
                        type="number"
                        value={limitedEditionForm.originalPrice ?? 0}
                        onChange={(e) =>
                          setLimitedEditionForm({ ...limitedEditionForm, originalPrice: Number(e.target.value) })
                        }
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter original price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Stock Quantity</label>
                      <Input
                        type="number"
                        value={limitedEditionForm.stock ?? 0}
                        onChange={(e) =>
                          setLimitedEditionForm({ ...limitedEditionForm, stock: Number(e.target.value) })
                        }
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter stock quantity"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">End Date</label>
                      <Input
                        type="date"
                        value={limitedEditionForm.endDate || ""}
                        onChange={(e) => setLimitedEditionForm({ ...limitedEditionForm, endDate: e.target.value })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">Product Images</label>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || [])
                          const currentImages = limitedEditionForm.images || []
                          const currentCount = currentImages.length

                          const invalidFiles = newFiles.filter((file) => !validateFileSize(file))
                          if (invalidFiles.length > 0) {
                            const fileNames = invalidFiles
                              .map((f) => `${f.name} (${formatFileSize(f.size)})`)
                              .join(", ")
                            alert(`The following files are too large (max 5MB each): ${fileNames}`)
                            e.target.value = "" // Clear the input
                            return
                          }

                          const availableSlots = 5 - currentCount
                          const filesToAdd = newFiles.slice(0, availableSlots)

                          if (newFiles.length > availableSlots) {
                            alert(
                              `You can only add ${availableSlots} more image${availableSlots !== 1 ? "s" : ""}. Maximum 5 images per product.`,
                            )
                          }

                          const updatedImages = [
                            ...currentImages.filter((img) => typeof img === "string"),
                            ...filesToAdd,
                          ]
                          setLimitedEditionForm({ ...limitedEditionForm, images: updatedImages })
                          e.target.value = "" // Clear input after successful upload
                        }}
                        className="w-full p-2 border border-amber-200 rounded-md bg-white/50"
                        disabled={(limitedEditionForm.images || []).length >= 5}
                      />
                      <p className="text-xs text-amber-600 mt-1">
                        Maximum file size: 5MB per image. Supported formats: JPEG, JPG, PNG
                      </p>

                      {(limitedEditionForm.images || []).length >= 5 && (
                        <p className="text-sm text-amber-600 mt-1">
                          Maximum 5 images reached. Remove an image to add more.
                        </p>
                      )}
                      {(limitedEditionForm.images || []).length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {(limitedEditionForm.images || []).map((file, idx) => {
                            let imageSrc: string
                            if (file instanceof File) {
                              imageSrc = URL.createObjectURL(file)
                            } else {
                              imageSrc = file
                            }
                            return (
                              <div key={idx} className="relative">
                                <img
                                  src={imageSrc || "/placeholder.svg"}
                                  alt={`Preview ${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded border-2 border-amber-200"
                                />
                                <button
                                  onClick={() => {
                                    const newImages = (limitedEditionForm.images || []).filter((_, i) => i !== idx)
                                    setLimitedEditionForm({ ...limitedEditionForm, images: newImages })
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                                <div className="absolute bottom-0 left-0 bg-black/60 text-white text-xs px-1 rounded-tr">
                                  {idx + 1}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      <div className="mt-1 text-sm text-amber-700">
                        {(limitedEditionForm.images || []).length}/5 images
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-amber-800 mb-2">Description</label>
                      <Textarea
                        value={limitedEditionForm.description || ""}
                        onChange={(e) => setLimitedEditionForm({ ...limitedEditionForm, description: e.target.value })}
                        className="backdrop-blur-sm bg-white/50 border-amber-200"
                        placeholder="Enter product description"
                        rows={3}
                      />
                    </div>

                    {/* Size Management */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-amber-800 mb-2">Product Sizes</label>
                      <div className="space-y-3">
                        {(limitedEditionForm.sizes || []).map((size, index) => (
                          <div key={index} className="flex gap-2 items-center p-3 bg-white/30 rounded-lg border border-amber-200">
                            <Input
                              value={size.size}
                              onChange={(e) => {
                                const newSizes = [...(limitedEditionForm.sizes || [])]
                                newSizes[index] = { ...size, size: e.target.value }
                                setLimitedEditionForm({ ...limitedEditionForm, sizes: newSizes })
                              }}
                              placeholder="Size (e.g., S, M, L, 6, 7, 8)"
                              className="flex-1 backdrop-blur-sm bg-white/50 border-amber-200"
                            />
                            <Input
                              type="number"
                              value={size.stock}
                              onChange={(e) => {
                                const newSizes = [...(limitedEditionForm.sizes || [])]
                                newSizes[index] = { ...size, stock: Number(e.target.value) }
                                setLimitedEditionForm({ ...limitedEditionForm, sizes: newSizes })
                              }}
                              placeholder="Stock"
                              className="w-20 backdrop-blur-sm bg-white/50 border-amber-200"
                            />
                            <label className="flex items-center gap-1 text-sm text-amber-700">
                              <input
                                type="checkbox"
                                checked={size.available}
                                onChange={(e) => {
                                  const newSizes = [...(limitedEditionForm.sizes || [])]
                                  newSizes[index] = { ...size, available: e.target.checked }
                                  setLimitedEditionForm({ ...limitedEditionForm, sizes: newSizes })
                                }}
                                className="rounded"
                              />
                              Available
                            </label>
                            <Button
                              onClick={() => {
                                const newSizes = (limitedEditionForm.sizes || []).filter((_, i) => i !== index)
                                setLimitedEditionForm({ ...limitedEditionForm, sizes: newSizes })
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => {
                            const newSizes = [...(limitedEditionForm.sizes || []), { size: "", stock: 0, available: true }]
                            setLimitedEditionForm({ ...limitedEditionForm, sizes: newSizes })
                          }}
                          variant="outline"
                          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Size
                        </Button>
                      </div>
                    </div>

                    {/* Color Management */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-amber-800 mb-2">Product Colors</label>
                      <div className="space-y-3">
                        {(limitedEditionForm.colors || []).map((color, index) => (
                          <div key={index} className="flex gap-2 items-center p-3 bg-white/30 rounded-lg border border-amber-200">
                            <Input
                              value={color.name}
                              onChange={(e) => {
                                const newColors = [...(limitedEditionForm.colors || [])]
                                newColors[index] = { ...color, name: e.target.value }
                                setLimitedEditionForm({ ...limitedEditionForm, colors: newColors })
                              }}
                              placeholder="Color Name (e.g., Red, Blue, Black)"
                              className="flex-1 backdrop-blur-sm bg-white/50 border-amber-200"
                            />
                            <Input
                              value={color.code}
                              onChange={(e) => {
                                const newColors = [...(limitedEditionForm.colors || [])]
                                newColors[index] = { ...color, code: e.target.value }
                                setLimitedEditionForm({ ...limitedEditionForm, colors: newColors })
                              }}
                              placeholder="Color Code (e.g., #FF0000)"
                              className="w-24 backdrop-blur-sm bg-white/50 border-amber-200"
                            />
                            <div
                              className="w-8 h-8 rounded border border-amber-200"
                              style={{ backgroundColor: color.code }}
                            />
                            <label className="flex items-center gap-1 text-sm text-amber-700">
                              <input
                                type="checkbox"
                                checked={color.available}
                                onChange={(e) => {
                                  const newColors = [...(limitedEditionForm.colors || [])]
                                  newColors[index] = { ...color, available: e.target.checked }
                                  setLimitedEditionForm({ ...limitedEditionForm, colors: newColors })
                                }}
                                className="rounded"
                              />
                              Available
                            </label>
                            <Button
                              onClick={() => {
                                const newColors = (limitedEditionForm.colors || []).filter((_, i) => i !== index)
                                setLimitedEditionForm({ ...limitedEditionForm, colors: newColors })
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => {
                            const newColors = [...(limitedEditionForm.colors || []), { name: "", code: "#000000", available: true }]
                            setLimitedEditionForm({ ...limitedEditionForm, colors: newColors })
                          }}
                          variant="outline"
                          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Color
                        </Button>
                      </div>
                    </div>

                    {/* Orchid Color Management */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-amber-800 mb-2">Orchid Flower Colors</label>
                      <div className="space-y-3">
                        {(limitedEditionForm.orchidColors || []).map((orchidColor, index) => (
                          <div key={index} className="flex gap-2 items-center p-3 bg-white/30 rounded-lg border border-amber-200">
                            <Input
                              value={orchidColor.name}
                              onChange={(e) => {
                                const newOrchidColors = [...(limitedEditionForm.orchidColors || [])]
                                newOrchidColors[index] = { ...orchidColor, name: e.target.value }
                                setLimitedEditionForm({ ...limitedEditionForm, orchidColors: newOrchidColors })
                              }}
                              placeholder="Orchid Color Name (e.g., Pink, White, Purple)"
                              className="flex-1 backdrop-blur-sm bg-white/50 border-amber-200"
                            />
                            <Input
                              value={orchidColor.value}
                              onChange={(e) => {
                                const newOrchidColors = [...(limitedEditionForm.orchidColors || [])]
                                newOrchidColors[index] = { ...orchidColor, value: e.target.value }
                                setLimitedEditionForm({ ...limitedEditionForm, orchidColors: newOrchidColors })
                              }}
                              placeholder="Color Value (e.g., #FF69B4)"
                              className="w-24 backdrop-blur-sm bg-white/50 border-amber-200"
                            />
                            <div
                              className="w-8 h-8 rounded border border-amber-200"
                              style={{ backgroundColor: orchidColor.value }}
                            />
                            <label className="flex items-center gap-1 text-sm text-amber-700">
                              <input
                                type="checkbox"
                                checked={orchidColor.available}
                                onChange={(e) => {
                                  const newOrchidColors = [...(limitedEditionForm.orchidColors || [])]
                                  newOrchidColors[index] = { ...orchidColor, available: e.target.checked }
                                  setLimitedEditionForm({ ...limitedEditionForm, orchidColors: newOrchidColors })
                                }}
                                className="rounded"
                              />
                              Available
                            </label>
                            <Button
                              onClick={() => {
                                const newOrchidColors = (limitedEditionForm.orchidColors || []).filter((_, i) => i !== index)
                                setLimitedEditionForm({ ...limitedEditionForm, orchidColors: newOrchidColors })
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => {
                            const newOrchidColors = [...(limitedEditionForm.orchidColors || []), { name: "", value: "#FF69B4", available: true }]
                            setLimitedEditionForm({ ...limitedEditionForm, orchidColors: newOrchidColors })
                          }}
                          variant="outline"
                          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Orchid Color
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <Button onClick={handleSaveLimitedEdition} className="bg-green-600 hover:bg-green-700 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Save Limited Edition
                    </Button>
                    <Button
                      onClick={handleCancelLimitedEditionEdit}
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {/* Limited Edition List */}
              {limitedEditionError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                  {limitedEditionError}
                </div>
              )}
              <div className="grid gap-6">
                {limitedEdition.length === 0 && !limitedEditionError && (
                  <div className="text-center text-amber-700 py-8">
                    No limited edition products found. Add some to get started.
                  </div>
                )}
                {limitedEdition.map((item) => {
                  const limitedImage =
                    Array.isArray(item.images) && item.images.length > 0
                      ? typeof item.images[0] === "string"
                        ? item.images[0]
                        : "/placeholder.svg"
                      : "/placeholder.svg"
                  return (
                    <Card key={item.id} className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                      <div className="flex items-center gap-6">
                        <SafeImage
                          src={limitedImage}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-amber-900">{item.name}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${((item as any).status ?? (item.isActive ? "active" : "inactive")) === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {((item as any).status ?? (item.isActive ? "active" : "inactive")) === "active"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>
                          <p className="text-amber-600 text-sm mb-2">{item.description}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-amber-900">
                              Rs. {(item.price ?? 0).toLocaleString()}
                            </span>
                            <span className="text-sm text-amber-600 line-through">
                              Rs. {(item.originalPrice ?? 0).toLocaleString()}
                            </span>
                            <span className="text-sm text-amber-700">Stock: {item.stock}</span>
                            <span className="text-sm text-amber-700">Ends: {(item as any).endDate || "-"}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleToggleLimitedEditionStatus(item.id)}
                            size="sm"
                            className={`${((item as any).status ?? (item.isActive ? "active" : "inactive")) === "active"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                              } text-white`}
                          >
                            {((item as any).status ?? (item.isActive ? "active" : "inactive")) === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </Button>
                          <Button
                            onClick={() => handleEditLimitedEdition(item)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteLimitedEdition(item.id)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {activeSection === "feedback" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-amber-900">Feedback Management</h2>
                <div className="flex gap-2">
                  <select className="px-4 py-2 rounded-lg backdrop-blur-sm bg-white/50 border border-amber-200 text-amber-800">
                    <option value="">All Feedback</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Feedback Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-4 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-900">{feedback.length}</p>
                    <p className="text-sm text-amber-600">Total Feedback</p>
                  </div>
                </Card>
                <Card className="p-4 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {feedback.filter((fb) => fb.status === "pending").length}
                    </p>
                    <p className="text-sm text-amber-600">Pending Review</p>
                  </div>
                </Card>
                <Card className="p-4 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {feedback.filter((fb) => fb.status === "approved").length}
                    </p>
                    <p className="text-sm text-amber-600">Approved</p>
                  </div>
                </Card>
                <Card className="p-4 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-900">
                      {feedback.length
                        ? (feedback.reduce((sum, fb) => sum + fb.rating, 0) / feedback.length).toFixed(1)
                        : "0.0"}
                    </p>
                    <p className="text-sm text-amber-600">Average Rating</p>
                  </div>
                </Card>
              </div>

              {/* Feedback List */}
              <div className="grid gap-6">
                {feedbackLoading && (
                  <div className="text-center text-amber-700 py-8">Loading feedbacks...</div>
                )}
                {!feedbackLoading && feedback.length === 0 && (
                  <div className="text-center text-amber-700 py-8">No feedback received yet.</div>
                )}
                {feedback.map((fb) => (
                  <Card key={fb.id} className="p-6 backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-amber-900">{fb.customerName}</h3>
                          <span className="text-lg">{getRatingStars(fb.rating)}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getFeedbackStatusColor(fb.status)}`}
                          >
                            {fb.status.charAt(0).toUpperCase() + fb.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-amber-700 text-sm mb-2">
                          {fb.customerEmail} • {fb.date}
                          {fb.productName && <span> • {fb.productName}</span>}
                        </p>
                        <p className="text-amber-800 mb-4">{fb.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {fb.status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleUpdateFeedbackStatus(fb.id, "approved")}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleUpdateFeedbackStatus(fb.id, "rejected")}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {fb.status !== "pending" && (
                        <Button
                          onClick={() => handleUpdateFeedbackStatus(fb.id, "pending")}
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Mark as Pending
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                            setSelectedFeedback(fb)
                            setFeedbackReplyText(fb.storeResponse ?? "")
                          }}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleDeleteFeedback(fb.id)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Feedback Details Modal */}
              {selectedFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl bg-white shadow-2xl border border-stone-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80">
                      <h3 className="text-lg font-semibold text-stone-900">Feedback Details</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFeedback(null)
                          setFeedbackReplyText("")
                        }}
                        className="p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/80 transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                      {/* Top row: Customer info + Rating & Status */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-3">Customer</p>
                          <div className="space-y-2 text-sm">
                            <p className="text-stone-800 font-medium">{selectedFeedback.customerName}</p>
                            <p className="text-stone-600">{selectedFeedback.customerEmail}</p>
                            <p className="text-stone-500 text-xs">{selectedFeedback.date}</p>
                            {selectedFeedback.fit && (
                              <p className="text-stone-500 text-xs pt-1 border-t border-stone-200 mt-2">Fit: {selectedFeedback.fit}</p>
                            )}
                            {selectedFeedback.productName && (
                              <p className="text-stone-500 text-xs">Product: {selectedFeedback.productName}</p>
                            )}
                          </div>
                        </div>
                        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-3">Rating & Status</p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">{getRatingStars(selectedFeedback.rating)}</span>
                            <span className="text-sm text-stone-600">({selectedFeedback.rating}/5)</span>
                          </div>
                          <span
                            className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${getFeedbackStatusColor(
                              selectedFeedback.status,
                            )}`}
                          >
                            {selectedFeedback.status.charAt(0).toUpperCase() + selectedFeedback.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Customer message (read-only) */}
                      <div className="rounded-xl border border-stone-200 bg-amber-50/30 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800/80 mb-2">Customer Message</p>
                        <p className="text-sm text-stone-700 leading-relaxed">{selectedFeedback.message}</p>
                      </div>

                      {/* Evora Team Reply */}
                      <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">Evora Team Reply</p>
                          <p className="text-xs text-stone-400">Shown under this review on the home page.</p>
                        </div>
                        <Textarea
                          placeholder="Write a reply as Evora Team..."
                          value={feedbackReplyText}
                          onChange={(e) => setFeedbackReplyText(e.target.value)}
                          className="min-h-[100px] resize-y text-sm border-stone-200 focus:border-amber-400 focus:ring-amber-400/20 placeholder:text-stone-400"
                          disabled={feedbackReplySaving}
                        />
                        <Button
                          onClick={handleSaveFeedbackReply}
                          disabled={feedbackReplySaving}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium"
                        >
                          {feedbackReplySaving ? "Saving..." : "Save Reply"}
                        </Button>
                      </div>

                      {/* Status actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
                        {selectedFeedback.status === "pending" && (
                          <>
                            <Button
                              onClick={() => {
                                handleUpdateFeedbackStatus(selectedFeedback.id, "approved")
                                setSelectedFeedback(null)
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white text-sm"
                            >
                              Approve Feedback
                            </Button>
                            <Button
                              onClick={() => {
                                handleUpdateFeedbackStatus(selectedFeedback.id, "rejected")
                                setSelectedFeedback(null)
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-sm"
                            >
                              Reject Feedback
                            </Button>
                          </>
                        )}
                        {selectedFeedback.status !== "pending" && (
                          <Button
                            onClick={() => {
                              handleUpdateFeedbackStatus(selectedFeedback.id, "pending")
                              setSelectedFeedback(null)
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-sm"
                          >
                            Mark as Pending Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "live-chat" && (
            <div>
              <AdminChatDashboard />
            </div>
          )}

          {activeSection !== "overview" &&
            activeSection !== "products" &&
            activeSection !== "orders" &&
            activeSection !== "categories" &&
            activeSection !== "limited-edition" &&
            activeSection !== "feedback" &&
            activeSection !== "live-chat" && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">
                  {menuItems.find((item) => item.id === activeSection)?.label} Management
                </h2>
                <p className="text-amber-700 mb-8">This section will be implemented in the next steps.</p>
                <Button
                  onClick={() => setActiveSection("overview")}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Back to Overview
                </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
