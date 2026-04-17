"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Users, Clock, CheckCircle, AlertCircle, Send, Minimize2, X, RefreshCw, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { io, Socket } from 'socket.io-client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { API_BASE_URL } from "@/lib/api-config"

interface Message {
  _id?: string
  message: string
  sender: 'user' | 'admin'
  senderName: string
  timestamp: string | Date
}

interface SupportChat {
  _id: string
  sessionId: string
  deviceId: string
  userInfo: {
  name: string
  email: string
    phone: string
  }
  status: 'active' | 'closed' | 'pending'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'general' | 'project' | 'other'
  messages: Message[]
  lastActivity: string | Date
  assignedTo: string
  isRead: boolean
}

// API Client for admin operations
class AdminApiClient {
  private baseUrl = `${API_BASE_URL}/api/support-chat`

  async getAllChats(status = 'active', page = 1, limit = 20) {
    const response = await fetch(`${this.baseUrl}/admin/chats?status=${status}&page=${page}&limit=${limit}`)
    return response.json()
  }

  async getChat(sessionId: string) {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}`)
    return response.json()
  }

  async sendMessage(sessionId: string, message: string) {
    const response = await fetch(`${this.baseUrl}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId, 
        message, 
        sender: 'admin', 
        senderName: 'EVORA Support' 
      })
    })
    return response.json()
  }

  async updateChatStatus(sessionId: string, status: string, priority?: string, category?: string) {
    const response = await fetch(`${this.baseUrl}/admin/chat/${sessionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, priority, category })
    })
    return response.json()
  }

  async markAsRead(sessionId: string) {
    const response = await fetch(`${this.baseUrl}/admin/chat/${sessionId}/read`, {
      method: 'PUT'
    })
    return response.json()
  }
}

const adminApiClient = new AdminApiClient()

export function AdminChatDashboard() {
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null)
  const [chats, setChats] = useState<SupportChat[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('active')
  const [refreshing, setRefreshing] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize WebSocket connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL
    const newSocket = io(socketUrl, {
      transports: ['websocket']
    })

    newSocket.on('connect', () => {
      console.log('Admin connected to WebSocket')
      setIsConnected(true)
      
      // Authenticate as admin
      newSocket.emit('authenticate', {
        userId: 'admin',
        userName: 'EVORA Admin',
        isAdmin: true
      })
    })

    newSocket.on('disconnect', () => {
      console.log('Admin disconnected from WebSocket')
      setIsConnected(false)
    })

    newSocket.on('customer_message', (messageData) => {
      console.log('New customer message received:', messageData)
      // Refresh chats to get updated messages
      loadChats()
      if (selectedChat) {
        loadSelectedChat()
      }
    })

    newSocket.on('message', (messageData) => {
      console.log('New message received:', messageData)
      // Refresh chats to get updated messages
      loadChats()
      if (selectedChat) {
        loadSelectedChat()
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Load chats on component mount
  useEffect(() => {
    loadChats()
  }, [statusFilter])

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedChat?.messages])

  const loadChats = async () => {
    try {
      setIsLoading(true)
      const response = await adminApiClient.getAllChats(statusFilter)
      // Backend returns { chats, total, page, limit } directly
      const list = response.chats ?? response.data ?? []
      setChats(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSelectedChat = async () => {
    if (!selectedChat) return
    
    try {
      const response = await adminApiClient.getChat(selectedChat.sessionId)
      // Backend returns chat object directly (or response.data)
      const chat = response?.data ?? response
      if (chat?.sessionId) {
        setSelectedChat(chat)
      }
    } catch (error) {
      console.error('Error loading chat:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    try {
      await adminApiClient.sendMessage(selectedChat.sessionId, newMessage)
      
      // Emit message through WebSocket for real-time delivery
      if (socket && isConnected) {
        socket.emit('message', {
          sessionId: selectedChat.sessionId,
          message: newMessage,
          sender: 'admin',
          senderName: 'EVORA Support'
        })
      }
      
      setNewMessage("")
      // Reload the chat to get updated messages
      loadSelectedChat()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleChatSelect = async (chat: SupportChat) => {
    setSelectedChat(chat)
    // Mark as read when selected
    try {
      await adminApiClient.markAsRead(chat.sessionId)
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadChats()
    if (selectedChat) {
      await loadSelectedChat()
    }
    setRefreshing(false)
  }

  const handleChangeStatus = async (chat: SupportChat, nextStatus: 'active' | 'pending' | 'closed') => {
    try {
      await adminApiClient.updateChatStatus(chat.sessionId, nextStatus)
      // Optimistically update UI
      setChats(prev => prev.map(c => c._id === chat._id ? { ...c, status: nextStatus } as SupportChat : c))
      if (selectedChat?._id === chat._id) {
        setSelectedChat({ ...(selectedChat as SupportChat), status: nextStatus })
      }
      // If current filter hides this chat, remove from list
      if (statusFilter !== 'all' && statusFilter !== nextStatus) {
        setChats(prev => prev.filter(c => c._id !== chat._id))
        if (selectedChat?._id === chat._id) setSelectedChat(null)
      }
    } catch (e) {
      console.error('Error updating chat status:', e)
    }
  }

  const handleDeleteChat = async (chat: SupportChat) => {
    // Soft-delete by setting status to closed and removing from current view
    await handleChangeStatus(chat, 'closed')
  }

  const formatTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatRelativeTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getLastMessage = (chat: SupportChat) => {
    if (chat.messages.length === 0) return 'No messages yet'
    const lastMessage = chat.messages[chat.messages.length - 1]
    return lastMessage.message.length > 50 
      ? lastMessage.message.substring(0, 50) + '...' 
      : lastMessage.message
  }

  const getUnreadCount = (chat: SupportChat) => {
    return chat.messages.filter(msg => msg.sender === 'user' && !chat.isRead).length
  }

  const totalUnreadMessages = chats.reduce((sum, chat) => sum + getUnreadCount(chat), 0)
  const activeChats = chats.filter(chat => chat.status === 'active').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                EVORA Support Dashboard
              </h1>
              <p className="text-gray-600 text-sm">
                Manage customer inquiries and provide real-time support
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 rounded-full"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <Card className="liquid-glass-subtle">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Chats</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{chats.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass-subtle">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Active Chats</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{activeChats}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass-subtle">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Unread Messages</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalUnreadMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass-subtle">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">2m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Chat List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Support Chats</span>
                <Badge variant="secondary">{activeChats} active</Badge>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'closed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('closed')}
                >
                  Closed
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[540px]">
                <div className="space-y-2 p-3 sm:p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    </div>
                  ) : chats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No chats found</p>
                    </div>
                  ) : (
                    chats.map((chat) => (
                    <motion.div
                        key={chat._id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all shadow-sm ${
                          selectedChat?._id === chat._id
                          ? 'bg-amber-50 border border-amber-300'
                          : 'bg-white hover:bg-amber-50 border border-gray-100'
                      }`}
                        onClick={() => handleChatSelect(chat)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                            <AvatarFallback className="bg-amber-500 text-white text-xs sm:text-sm">
                                {chat.userInfo.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                            {chat.status === 'active' && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {chat.userInfo.name}
                            </p>
                              {getUnreadCount(chat) > 0 && (
                              <Badge className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                  {getUnreadCount(chat)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">
                              {getLastMessage(chat)}
                          </p>
                            <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-gray-400">
                                {formatRelativeTime(chat.lastActivity)}
                              </p>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] px-2 ${
                                  chat.priority === 'urgent' ? 'border-red-500 text-red-500' :
                                  chat.priority === 'high' ? 'border-orange-500 text-orange-500' :
                                  chat.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                  'border-gray-500 text-gray-500'
                                }`}
                              >
                                {chat.priority}
                              </Badge>
                            </div>
                          </div>
                        <div className="ml-1" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel>Change status</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleChangeStatus(chat, 'active')}>Active</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(chat, 'pending')}>Pending</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(chat, 'closed')}>Closed</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteChat(chat)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete chat
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-amber-500 text-white text-sm font-semibold">
                      {selectedChat ? selectedChat.userInfo.name.split(' ').map(n => n[0]).join('') : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {selectedChat ? selectedChat.userInfo.name : 'Select a chat'}
                    </h3>
                    <p className="text-xs text-amber-100">
                      {selectedChat ? `${selectedChat.userInfo.email} • ${selectedChat.status}` : 'Admin Panel'}
                    </p>
                  </div>
                </div>
                {selectedChat && (
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs border-white text-white ${
                        selectedChat.priority === 'urgent' ? 'bg-red-500' :
                        selectedChat.priority === 'high' ? 'bg-orange-500' :
                        selectedChat.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}
                    >
                      {selectedChat.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-white text-white">
                      {selectedChat.category}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {selectedChat ? (
                <>
                  {/* Messages */}
                  <ScrollArea className="h-[420px] p-3 sm:p-4">
                    <div className="space-y-3 sm:space-y-4">
                      {selectedChat.messages.map((message, index) => (
                        <motion.div
                          key={message._id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[82%] ${message.sender === 'admin' ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-2xl px-4 py-2 shadow ${
                              message.sender === 'admin' 
                                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-200/30' 
                                : 'bg-white border border-gray-200 text-gray-900'
                            }`}>
                              <p className="text-sm whitespace-pre-line">{message.message}</p>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1 px-2">
                              {message.senderName} • {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-3 sm:p-4 border-t border-gray-200 sticky bottom-0 bg-white/80 backdrop-blur-xl">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 rounded-full border-gray-300 focus:ring-2 focus:ring-amber-500"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 h-10 w-10 p-0 shadow"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[500px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
