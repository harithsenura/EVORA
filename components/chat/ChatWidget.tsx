"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Minimize2, Smile, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { io, Socket } from "socket.io-client"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/api-config"
import { useChat } from "@/contexts/ChatContext"

interface Message {
  _id?: string
  message: string
  sender: 'user' | 'admin'
  senderName: string
  timestamp: Date | string
}

interface ChatSession {
  sessionId: string
  deviceId: string
  status: string
  messages: Message[]
}

export function ChatWidget() {
  const { isOpen, setIsOpen, unreadCount, setUnreadCount } = useChat()
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  // Listen for login/logout to re-initialize chat
  useEffect(() => {
    const handleAuthChange = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        setUser(null)
      }
      
      // CRITICAL: Clear the session ID from localStorage on every login/logout
      // This forces the initChat logic to negotiate a fresh, correct session
      localStorage.removeItem("evora_chat_session")
      
      setSessionId(null)
      setMessages([])
    }

    handleAuthChange() // Initial check
    window.addEventListener("userLogin", handleAuthChange)
    window.addEventListener("userLogout", handleAuthChange)

    return () => {
      window.removeEventListener("userLogin", handleAuthChange)
      window.removeEventListener("userLogout", handleAuthChange)
    }
  }, [])

  // Initialize Socket.io
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5
    })

    newSocket.on("connect", () => {
      console.log("Chat connected to server")
      setIsConnected(true)
      
      // If we have a session, authenticate
      const storedSessionId = localStorage.getItem("evora_chat_session")
      if (storedSessionId) {
        newSocket.emit("authenticate", {
          userId: storedSessionId,
          userName: "Customer",
          isAdmin: false
        })
      }
    })

    newSocket.on("disconnect", () => {
      console.log("Chat disconnected")
      setIsConnected(false)
    })

    newSocket.on("message", (msg: Message) => {
      console.log("New message from admin:", msg)
      setMessages(prev => [...prev, msg])
      if (!isOpen || isMinimized) {
        setUnreadCount(prev => prev + 1)
      }
    })

    setSocket(newSocket)
    socketRef.current = newSocket

    return () => {
      newSocket.close()
    }
  }, [])

  // Load session from localStorage on mount or user change
  useEffect(() => {
    const initChat = async () => {
      // Priority 1: If logged in, get specific chat for this user
      // Priority 2: Fallback to stored session ID (guest or current)
      
      const storedUser = localStorage.getItem("user")
      const currentUser = storedUser ? JSON.parse(storedUser) : null
      
      try {
        const url = currentUser 
          ? `${API_BASE_URL}/api/support-chat/start` // POST /start to get/create user chat
          : `${API_BASE_URL}/api/support-chat/session/${localStorage.getItem("evora_chat_session")}`
        
        if (currentUser) {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceId: localStorage.getItem("evora_device_id"),
              userId: currentUser.id, // Corrected from _id to id
              userInfo: {
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                email: currentUser.email
              }
            })
          })
          const data = await response.json()
          if (data && data.sessionId) {
            setSessionId(data.sessionId)
            setMessages(data.messages || [])
            localStorage.setItem("evora_chat_session", data.sessionId)
          }
        } else {
          const storedSessionId = localStorage.getItem("evora_chat_session")
          if (storedSessionId && storedSessionId !== "null") {
            const response = await fetch(`${API_BASE_URL}/api/support-chat/session/${storedSessionId}`)
            if (response.ok) {
              const data = await response.json()
              setSessionId(data.sessionId)
              setMessages(data.messages || [])
            }
          }
        }
      } catch (error) {
        console.error("Failed to load chat history:", error)
      }
    }
    initChat()
  }, [user]) // Re-run when user logs in/out

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const startNewSession = async () => {
    try {
      const storedUser = localStorage.getItem("user")
      const currentUser = storedUser ? JSON.parse(storedUser) : null
      
      const deviceId = localStorage.getItem("evora_device_id") || `dev_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("evora_device_id", deviceId)

      const response = await fetch(`${API_BASE_URL}/api/support-chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          userId: currentUser?.id || null, // Corrected from _id to id
          userInfo: {
            name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Customer Guest",
            email: currentUser?.email || "guest@example.com"
          }
        })
      })
      const data = await response.json()
      if (data.sessionId) {
        setSessionId(data.sessionId)
        localStorage.setItem("evora_chat_session", data.sessionId)
        
        // Authenticate socket
        if (socketRef.current) {
          socketRef.current.emit("authenticate", {
            userId: data.sessionId,
            userName: "Customer",
            isAdmin: false
          })
        }
        return data.sessionId
      }
    } catch (error) {
      console.error("Failed to start chat session:", error)
      toast.error("Could not start chat. Please try again.")
    }
    return null
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    let currentSessionId = sessionId
    if (!currentSessionId) {
      currentSessionId = await startNewSession()
    }

    if (!currentSessionId) return

    const messageData = {
      sessionId: currentSessionId,
      message: message,
      sender: "user" as const,
      senderName: "Customer"
    }

    try {
      // 1. Send to API
      const response = await fetch(`${API_BASE_URL}/api/support-chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData)
      })
      const data = await response.json()
      
      // 2. Update local state
      setMessages(prev => [...prev, data])
      
      // 3. Emit via socket
      if (socketRef.current && isConnected) {
        socketRef.current.emit("message", {
          text: message,
          sessionId: currentSessionId,
          sender: "user",
          senderName: "Customer"
        })
      }

      setMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-[9999]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Button
                onClick={toggleChat}
                className="relative h-16 w-16 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-2xl transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <MessageCircle className="h-7 w-7 text-white" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white border-2 border-white animate-bounce-short">
                    {unreadCount}
                  </Badge>
                )}
                <div className="absolute inset-0 rounded-full bg-amber-400 opacity-20 animate-ping pointer-events-none" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            className={`fixed bottom-6 right-6 z-[10000] w-[380px] bg-white dark:bg-gray-950 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col transition-all duration-300 ${
              isMinimized ? "h-[70px]" : "h-[600px]"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 p-5 text-white flex items-center justify-between cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-amber-500/30">
                    <AvatarFallback className="bg-amber-600 text-white font-bold">E</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-stone-800 ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">EVORA LIVE SUPPORT</h3>
                  <p className="text-[10px] text-stone-400 font-medium tracking-widest uppercase">
                    {isConnected ? "Direct Line • Online" : "Connecting..."}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 rounded-full" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 rounded-full" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Chat Body */}
                <div className="flex-1 overflow-hidden relative bg-stone-50/30 dark:bg-transparent">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      <div className="text-center py-4">
                        <div className="inline-block px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2">
                          Today
                        </div>
                        <p className="text-xs text-gray-400 max-w-[200px] mx-auto">
                          Welcome to EVORA. Feel free to ask any questions about our luxury collection.
                        </p>
                      </div>

                      {messages.map((msg, i) => (
                        <motion.div
                          key={msg._id || i}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[80%] ${msg.sender === "user" ? "order-2" : "order-1"}`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                              msg.sender === "user"
                                ? "bg-stone-900 text-white rounded-tr-none"
                                : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-tl-none text-gray-800 dark:text-gray-200"
                            }`}>
                              {msg.message}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1.5 px-1 font-medium">
                                {msg.senderName} • {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={scrollRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Input Area */}
                <div className="p-5 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1 bg-stone-100 dark:bg-stone-900 rounded-2xl px-4 py-2 focus-within:ring-2 ring-amber-500/20 transition-all">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="Message EVORA..."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none py-1 min-h-[24px] max-h-[120px] dark:text-white"
                        rows={1}
                      />
                      <div className="flex items-center justify-between mt-1 pb-1">
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-amber-600 transition-colors">
                            <Smile className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-amber-600 transition-colors">
                            <Paperclip className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                          Shift+Enter for multi-line
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="h-11 w-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:shadow-none"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .animate-bounce-short {
          animation: bounce-short 1s infinite;
        }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  )
}
