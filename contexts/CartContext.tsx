"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"

export interface CartItem {
  orchidColor?: string
  id: string
  productId?: string
  name: string
  price: number
  originalPrice?: number
  image?: string
  quantity: number
  size?: string
  color?: string
  colorCode?: string
  /** Human-readable size for display (e.g. "36") */
  sizeLabel?: string
  /** Human-readable color for display (e.g. "White") */
  colorLabel?: string
  category?: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, "id"> & { id?: string }) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  getTotalItems: () => number
  getTotalPrice: () => number
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const isFirstSaveRun = useRef(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("evora_cart")
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (error) {
          console.error("Error loading cart from localStorage:", error)
        }
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes (skip first run so we don't overwrite with [] on refresh)
  useEffect(() => {
    if (typeof window === "undefined") return
    if (isFirstSaveRun.current) {
      isFirstSaveRun.current = false
      return
    }
    localStorage.setItem("evora_cart", JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item: Omit<CartItem, "id"> & { id?: string }) => {
    const itemId = item.id || item.productId || `item-${Date.now()}-${Math.random()}`
    
    setCartItems((prevItems) => {
      // Check if item with same id, size, and color already exists
      const existingItemIndex = prevItems.findIndex(
        (existingItem) =>
          (existingItem.id === itemId || existingItem.productId === item.productId) &&
          existingItem.size === item.size &&
          existingItem.color === item.color
      )

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += item.quantity || 1
        return updatedItems
      } else {
        const newItem = { ...item, id: itemId, quantity: item.quantity || 1 }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cartItemAdded", { detail: newItem }))
        }
        return [...prevItems, newItem]
      }
    })
  }

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.originalPrice || item.price
      return total + price * item.quantity
    }, 0)
  }

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
