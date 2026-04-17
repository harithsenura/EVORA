"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail } from "lucide-react"
import { notFound } from "next/navigation"

// Sample tracking data - in real app this would come from API
const trackingData = {
  TRK123456789: {
    orderId: "#EVORA2024",
    status: "Delivered",
    estimatedDelivery: "2024-08-22",
    actualDelivery: "2024-08-22 3:30 PM",
    carrier: "Express Delivery Service",
    trackingNumber: "TRK123456789",
    shippingAddress: "123 Main Street, Colombo 03, Sri Lanka",
    timeline: [
      {
        status: "Order Placed",
        date: "2024-08-20",
        time: "10:30 AM",
        location: "EVORA Warehouse",
        completed: true,
        description: "Your order has been confirmed and is being prepared for shipment.",
      },
      {
        status: "Payment Confirmed",
        date: "2024-08-20",
        time: "10:35 AM",
        location: "Payment Gateway",
        completed: true,
        description: "Payment has been successfully processed.",
      },
      {
        status: "Processing",
        date: "2024-08-20",
        time: "2:00 PM",
        location: "EVORA Warehouse",
        completed: true,
        description: "Your items are being picked and packed for shipment.",
      },
      {
        status: "Shipped",
        date: "2024-08-21",
        time: "9:00 AM",
        location: "Colombo Distribution Center",
        completed: true,
        description: "Your package has left our facility and is on its way to you.",
      },
      {
        status: "Out for Delivery",
        date: "2024-08-22",
        time: "8:00 AM",
        location: "Local Delivery Hub",
        completed: true,
        description: "Your package is out for delivery and will arrive today.",
      },
      {
        status: "Delivered",
        date: "2024-08-22",
        time: "3:30 PM",
        location: "123 Main Street, Colombo 03",
        completed: true,
        description: "Package delivered successfully. Signed by: Sarah J.",
      },
    ],
    items: [
      { name: "Designer Heel Sandals", quantity: 1, size: "7", color: "Black" },
      { name: "Evening Elegance Heels", quantity: 1, size: "6", color: "Silver" },
    ],
  },
  TRK987654321: {
    orderId: "#EVORA2023",
    status: "Processing",
    estimatedDelivery: "2024-08-25",
    actualDelivery: null,
    carrier: "Express Delivery Service",
    trackingNumber: "TRK987654321",
    shippingAddress: "456 Business Ave, Colombo 02, Sri Lanka",
    timeline: [
      {
        status: "Order Placed",
        date: "2024-08-15",
        time: "2:15 PM",
        location: "EVORA Warehouse",
        completed: true,
        description: "Your order has been confirmed and is being prepared for shipment.",
      },
      {
        status: "Payment Confirmed",
        date: "2024-08-15",
        time: "2:20 PM",
        location: "Payment Gateway",
        completed: true,
        description: "Payment has been successfully processed.",
      },
      {
        status: "Processing",
        date: "2024-08-16",
        time: "10:00 AM",
        location: "EVORA Warehouse",
        completed: true,
        description: "Your items are being picked and packed for shipment.",
      },
      {
        status: "Shipped",
        date: "",
        time: "",
        location: "",
        completed: false,
        description: "Your package will be shipped soon.",
      },
      {
        status: "Out for Delivery",
        date: "",
        time: "",
        location: "",
        completed: false,
        description: "Your package will be out for delivery.",
      },
      {
        status: "Delivered",
        date: "",
        time: "",
        location: "",
        completed: false,
        description: "Your package will be delivered.",
      },
    ],
    items: [
      { name: "Comfort Plus Slides", quantity: 2, size: "8", color: "Beige" },
      { name: "Memory Foam Slippers", quantity: 1, size: "7", color: "Gray" },
    ],
  },
}

export default function TrackOrderPage({ params }: { params: { id: string } }) {
  const [trackingInfo, setTrackingInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const data = trackingData[params.id]
      if (data) {
        setTrackingInfo(data)
      }
      setLoading(false)
    }, 1000)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl p-8 shadow-xl text-center">
          <div className="animate-spin w-8 h-8 border-4 border-amber-800 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-stone-600">Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (!trackingInfo) {
    notFound()
  }

  const getStatusIcon = (status, completed) => {
    if (!completed) {
      return { icon: Clock, color: "text-stone-400 bg-stone-200" }
    }

    switch (status) {
      case "Delivered":
        return { icon: CheckCircle, color: "text-white bg-gradient-to-r from-green-500 to-green-600" }
      case "Out for Delivery":
        return { icon: Truck, color: "text-white bg-gradient-to-r from-blue-500 to-blue-600" }
      case "Shipped":
        return { icon: Package, color: "text-white bg-gradient-to-r from-purple-500 to-purple-600" }
      default:
        return { icon: CheckCircle, color: "text-white bg-gradient-to-r from-amber-600 to-amber-700" }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-amber-200/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-stone-300/20 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-amber-300/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-stone-200/20 rounded-full animate-float-delayed"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="liquid-glass-subtle p-3 rounded-full hover:scale-105 transition-transform">
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-800">
              Track <span className="text-amber-800">Order</span>
            </h1>
            <p className="text-stone-600 mt-1">Real-time tracking for {trackingInfo.orderId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl p-8 shadow-xl mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">Order {trackingInfo.status}</h2>
                  <p className="text-stone-600">Tracking Number: {trackingInfo.trackingNumber}</p>
                  <p className="text-stone-600">Carrier: {trackingInfo.carrier}</p>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      trackingInfo.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : trackingInfo.status === "Out for Delivery"
                          ? "bg-blue-100 text-blue-800"
                          : trackingInfo.status === "Shipped"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {trackingInfo.status}
                  </div>
                  {trackingInfo.actualDelivery ? (
                    <p className="text-sm text-stone-600 mt-2">Delivered: {trackingInfo.actualDelivery}</p>
                  ) : (
                    <p className="text-sm text-stone-600 mt-2">Est. Delivery: {trackingInfo.estimatedDelivery}</p>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-stone-600">Order Progress</span>
                  <span className="text-sm font-medium text-amber-800">
                    {Math.round(
                      (trackingInfo.timeline.filter((step) => step.completed).length / trackingInfo.timeline.length) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-amber-700 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(trackingInfo.timeline.filter((step) => step.completed).length / trackingInfo.timeline.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                <h3 className="text-xl font-serif font-bold text-stone-800 mb-6">Tracking Timeline</h3>
                {trackingInfo.timeline.map((step, index) => {
                  const statusInfo = getStatusIcon(step.status, step.completed)
                  const StatusIcon = statusInfo.icon

                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <h4 className={`font-semibold ${step.completed ? "text-stone-800" : "text-stone-500"}`}>
                            {step.status}
                          </h4>
                          {step.date && (
                            <div className="text-sm text-stone-600">
                              {step.date} {step.time && `at ${step.time}`}
                            </div>
                          )}
                        </div>
                        {step.location && (
                          <p className="text-sm text-stone-600 mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {step.location}
                          </p>
                        )}
                        <p className={`text-sm ${step.completed ? "text-stone-600" : "text-stone-400"}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Order Details Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-800" />
                Shipping Address
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">{trackingInfo.shippingAddress}</p>
            </div>

            {/* Order Items */}
            <div className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-800" />
                Order Items
              </h3>
              <div className="space-y-3">
                {trackingInfo.items.map((item, index) => (
                  <div key={index} className="border-b border-stone-200 pb-3 last:border-b-0 last:pb-0">
                    <h4 className="font-medium text-stone-800 text-sm">{item.name}</h4>
                    <p className="text-xs text-stone-600">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-stone-800 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 rounded-xl transition-colors">
                  <Phone className="w-4 h-4 text-amber-800" />
                  <div>
                    <p className="font-medium text-stone-800 text-sm">Call Support</p>
                    <p className="text-xs text-stone-600">+94 11 123 4567</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 rounded-xl transition-colors">
                  <Mail className="w-4 h-4 text-amber-800" />
                  <div>
                    <p className="font-medium text-stone-800 text-sm">Email Support</p>
                    <p className="text-xs text-stone-600">support@evora.lk</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href={`/profile`}
                className="block w-full px-6 py-3 bg-gradient-to-r from-amber-800 to-amber-900 text-white rounded-xl hover:shadow-lg transition-all text-center font-medium"
              >
                View All Orders
              </Link>
              <button className="w-full px-6 py-3 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 transition-all font-medium">
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
