# EVORA Live Chat System

A modern, real-time chat system for the EVORA luxury slippers e-commerce website.

## Features

- 🎨 **Modern Design**: Matches EVORA's luxury design language with amber/gold color scheme
- 💬 **Real-time Chat**: Socket.io powered live messaging
- 👤 **User Authentication**: Integrated with existing user system
- 🔄 **Smooth Animations**: Framer Motion powered transitions
- 📱 **Responsive**: Works on all device sizes
- 👨‍💼 **Admin Dashboard**: Customer support management interface
- 🎯 **Typing Indicators**: Real-time typing status
- 🔔 **Notifications**: Unread message counters

## Components

### ChatBubble
- Bottom-right corner chat bubble
- Smooth animations and transitions
- Unread message notifications
- Minimizable chat window

### AdminChatDashboard
- Customer list with online status
- Real-time message handling
- Statistics dashboard
- Professional admin interface

### Socket Integration
- Real-time message delivery
- User authentication
- Room management (admin/customer)
- Typing indicators

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install socket.io socket.io-client --legacy-peer-deps
   cd backend && npm install socket.io --legacy-peer-deps
   ```

2. **Environment Variables**
   Create `.env.local` (frontend) and `backend/.env`:
   ```
   NEXT_PUBLIC_SOCKET_URL=http://localhost:9700
   NEXT_PUBLIC_API_URL=http://localhost:9700/api
   ```
   **Email notifications (backend `.env`)** – optional; when set, admins get emails for new chats and new user messages:
   ```
   ADMIN_EMAIL=admin@yourdomain.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=EVORA Support
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

4. **Start Frontend**
   ```bash
   npm run dev
   ```

## Usage

### For Customers
1. Login to your account
2. Chat bubble appears in bottom-right corner
3. Click to open chat window
4. Start chatting with support

### For Admins
1. Login with admin account
2. Navigate to `/admin/support`
3. View customer list and messages
4. Respond to customer inquiries

## Technical Details

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Express.js, Socket.io
- **Styling**: Tailwind CSS with custom animations
- **Animations**: Framer Motion
- **Real-time**: Socket.io WebSocket connections

## Design Language

The chat system follows EVORA's luxury design:
- **Colors**: Amber/Gold gradients (#d97706, #b45309)
- **Typography**: Montserrat font family
- **Animations**: Smooth, elegant transitions
- **Glass Effects**: Liquid glass morphism
- **Shadows**: Subtle depth and elevation

## File Structure

```
components/
├── chat/
│   └── ChatBubble.tsx
├── admin/
│   └── AdminChatDashboard.tsx
└── auth/
    └── LoginForm.tsx

contexts/
└── ChatContext.tsx

hooks/
└── useSocket.ts

backend/
├── server.js (updated with Socket.io)
└── socketServer.js
```

## Features Implemented

✅ Chat bubble component with modern animations
✅ User authentication integration
✅ Real-time Socket.io communication
✅ Admin dashboard for customer support
✅ Smooth animations and transitions
✅ Responsive design
✅ Typing indicators
✅ Unread message notifications
✅ Professional admin interface

The chat system is now fully integrated and ready for use!
