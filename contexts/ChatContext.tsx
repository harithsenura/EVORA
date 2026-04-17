"use client"

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react"

interface ChatContextType {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  unreadCount: number
  setUnreadCount: Dispatch<SetStateAction<number>>
  user: any | null
  login: (user: any) => void
  logout: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [user, setUser] = useState<any | null>(null)

  const login = (userData: any) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    window.dispatchEvent(new CustomEvent('userLogin'))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    window.dispatchEvent(new CustomEvent('userLogout'))
  }

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        unreadCount,
        setUnreadCount,
        user,
        login,
        logout,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
