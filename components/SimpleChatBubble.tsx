"use client"

export default function SimpleChatBubble() {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto">
      <button
        onClick={() => alert('Chat feature coming soon!')}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-105"
      >
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-amber-400 opacity-30 animate-ping"></div>
        
        {/* Online indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500 animate-pulse"></div>
      </button>
    </div>
  )
}
