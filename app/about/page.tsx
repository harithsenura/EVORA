"use client"

import { Award, Heart, Shield, Truck } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Crafted with Love",
    description:
      "Every pair is meticulously handcrafted by skilled artisans who pour their passion into creating footwear that tells a story.",
  },
  {
    icon: Shield,
    title: "Premium Quality",
    description:
      "We source only the finest materials from trusted suppliers, ensuring durability and comfort that lasts for years.",
  },
  {
    icon: Award,
    title: "Timeless Design",
    description:
      "Our designs blend contemporary elegance with classic sophistication, creating pieces that transcend seasonal trends.",
  },
  {
    icon: Truck,
    title: "Sustainable Practices",
    description:
      "We're committed to ethical manufacturing and sustainable practices that respect both our craftspeople and the environment.",
  },
]

const milestones = [
  { year: "2018", event: "EVORA was founded with a vision to redefine comfort footwear" },
  { year: "2019", event: "Launched our first signature comfort slipper collection" },
  { year: "2020", event: "Expanded to designer heels and professional footwear" },
  { year: "2022", event: "Opened our flagship boutique and introduced sustainable practices" },
  { year: "2024", event: "Celebrating 50,000+ satisfied customers worldwide" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-amber-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-stone-300/40 rounded-full blur-lg animate-float-delayed"></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-amber-300/20 rounded-full blur-xl animate-float"></div>
      </div>

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black mb-6">
              <span className="text-stone-700">About</span> <span className="text-amber-800">EVORA</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-600 max-w-4xl mx-auto leading-relaxed">
              Born from a passion for exceptional craftsmanship and timeless elegance, EVORA represents the perfect
              fusion of comfort, style, and sophistication in every step you take.
            </p>
          </div>

          {/* Brand Story */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="liquid-glass-subtle rounded-3xl p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-700 mb-6">Our Story</h2>
                <div className="space-y-6 text-stone-600 leading-relaxed">
                  <p>
                    EVORA began as a dream to create footwear that doesn't compromise between style and comfort. Founded
                    by a team of passionate designers and craftspeople, we set out to challenge the notion that
                    beautiful shoes must sacrifice comfort.
                  </p>
                  <p>
                    Our journey started in a small atelier where every design was born from the belief that footwear
                    should be an extension of your personality—elegant, comfortable, and uniquely yours. Today, we
                    continue this tradition with the same dedication to excellence that defined our beginning.
                  </p>
                  <p>
                    Each EVORA piece is a testament to our commitment to quality, featuring premium materials,
                    innovative comfort technology, and designs that celebrate the modern woman's dynamic lifestyle.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden liquid-glass-subtle">
                  <img
                    src="/elegant-comfort-house-slippers.png"
                    alt="EVORA craftsmanship"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-800/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-stone-700 mb-12">
              What We Stand For
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="liquid-glass-subtle rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300"
                >
                  <div className="w-16 h-16 bg-amber-800/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <value.icon className="h-8 w-8 text-amber-800" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-700 mb-4">{value.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-stone-700 mb-12">Our Journey</h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-amber-800/30"></div>
                <div className="space-y-12">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="relative flex items-start">
                      <div className="absolute left-6 w-4 h-4 bg-amber-800 rounded-full border-4 border-stone-50"></div>
                      <div className="ml-20 liquid-glass-subtle rounded-2xl p-6">
                        <div className="text-2xl font-serif font-bold text-amber-800 mb-2">{milestone.year}</div>
                        <p className="text-stone-600 leading-relaxed">{milestone.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Mission Statement */}
          <section className="text-center">
            <div className="liquid-glass-subtle rounded-3xl p-12 md:p-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-700 mb-8">Our Mission</h2>
              <p className="text-xl text-stone-600 leading-relaxed mb-8">
                "To create exceptional footwear that empowers every woman to walk confidently through life, combining
                unparalleled comfort with timeless elegance in every step."
              </p>
              <div className="w-24 h-1 bg-amber-800 mx-auto rounded-full"></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
