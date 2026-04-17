"use client"

import React from 'react'
import { TruckButton } from '@/components/ui/truck-button'

export default function TruckButtonTest() {
  const handleTestClick = () => {
    console.log('Truck button clicked!')
    // Simulate order processing
    setTimeout(() => {
      console.log('Order processed successfully!')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-stone-800 mb-8">
          Animated Truck Button Test
        </h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-stone-700 mb-4">Default Button</h2>
            <TruckButton onClick={handleTestClick}>
              Complete Order
            </TruckButton>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-stone-700 mb-4">Custom Text</h2>
            <TruckButton onClick={handleTestClick}>
              Place Order (Cash on Delivery)
            </TruckButton>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-stone-700 mb-4">Disabled Button</h2>
            <TruckButton onClick={handleTestClick} disabled>
              Complete Order
            </TruckButton>
          </div>
        </div>
        
        <div className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
          <h3 className="text-lg font-semibold text-stone-800 mb-2">Instructions</h3>
          <p className="text-stone-600 text-sm">
            Click the buttons above to see the animated truck delivery animation. 
            The truck will load a package and drive across the button to complete the order.
          </p>
        </div>
      </div>
    </div>
  )
}
