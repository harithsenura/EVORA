"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { API_BASE_URL } from "@/lib/api-config"

interface Message {
  id: string
  text: string
  sender: 'user' | 'admin'
  timestamp: Date
  senderName: string
  userId?: string
}

interface UseSocketProps {
  userId?: string
  userName?: string
  isAdmin?: boolean
}

export function useSocket({ userId, userName, isAdmin = false }: UseSocketProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL, {
      auth: {
        userId,
        userName,
        isAdmin
      }
    })

    setSocket(newSocket)

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to chat server')
      setIsConnected(true)
      
      // Authenticate with server
      newSocket.emit('authenticate', {
        userId,
        userName,
        isAdmin
      })
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server')
      setIsConnected(false)
    })

    // Message events
    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    newSocket.on('typing', (data: { userId: string, userName: string, isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId])
      } else {
        setTypingUsers(prev => prev.filter(id => id !== data.userId))
      }
    })

    newSocket.on('user_joined', (data: { userId: string, userName: string }) => {
      console.log(`${data.userName} joined the chat`)
    })

    newSocket.on('user_left', (data: { userId: string, userName: string }) => {
      console.log(`${data.userName} left the chat`)
    })

    // Admin specific events
    if (isAdmin) {
      newSocket.on('customer_message', (message: Message) => {
        setMessages(prev => [...prev, message])
      })
    }

    return () => {
      newSocket.close()
    }
  }, [userId, userName, isAdmin])

  const sendMessage = (text: string) => {
    if (socket && text.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
        senderName: userName || 'Customer',
        userId
      }

      socket.emit('message', message)
    }
  }

  const sendTyping = (isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { isTyping })
    }
  }

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('join_room', roomId)
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leave_room', roomId)
    }
  }

  return {
    socket,
    messages,
    setMessages,
    isConnected,
    isTyping,
    typingUsers,
    sendMessage,
    sendTyping,
    joinRoom,
    leaveRoom
  }
}
