"use client"

import { useState, useEffect } from "react"

export function SizeChartSection() {
  const [selectedCategory, setSelectedCategory] = useState("slippers")
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [activeStep, setActiveStep] = useState<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const section = document.getElementById("size-chart-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const sizeCharts = {
    slippers: [
      { size: "5", us: "5", uk: "3", eu: "35-36", cm: "22.5" },
      { size: "6", us: "6", uk: "4", eu: "37", cm: "23.5" },
      { size: "7", us: "7", uk: "5", eu: "38", cm: "24.5" },
      { size: "8", us: "8", uk: "6", eu: "39", cm: "25.5" },
      { size: "9", us: "9", uk: "7", eu: "40-41", cm: "26.5" },
      { size: "10", us: "10", uk: "8", eu: "42", cm: "27.5" },
    ],
    heels: [
      { size: "5", us: "5", uk: "3", eu: "35", cm: "22" },
      { size: "6", us: "6", uk: "4", eu: "36", cm: "23" },
      { size: "7", us: "7", uk: "5", eu: "37", cm: "24" },
      { size: "8", us: "8", uk: "6", eu: "38", cm: "25" },
      { size: "9", us: "9", uk: "7", eu: "39", cm: "26" },
      { size: "10", us: "10", uk: "8", eu: "40", cm: "27" },
    ],
  }

  const measurementSteps = [
    { step: "01", title: "Prepare", description: "Place your foot on paper against a wall", icon: "📄" },
    { step: "02", title: "Mark", description: "Mark toe and heel positions", icon: "✏️" },
    { step: "03", title: "Measure", description: "Measure the distance in cm", icon: "📏" },
    { step: "04", title: "Compare", description: "Match with our chart", icon: "✓" },
  ]

  return (
    <section
      id="size-chart-section"
      className="relative py-24 2xl:py-32 overflow-hidden"
    >
      {/* Elegant Light Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-50 via-amber-50/40 to-white"></div>

      {/* Decorative Gradient Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-100/60 via-orange-50/40 to-transparent rounded-full blur-3xl animate-[pulse_15s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-rose-100/40 via-amber-50/30 to-transparent rounded-full blur-3xl animate-[pulse_12s_ease-in-out_infinite_2s]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-transparent via-amber-100/30 to-transparent rounded-full blur-3xl"></div>

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #92400e 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }}></div>

      <div className="relative z-10 max-w-6xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">

        {/* Section Header */}
        <div className={`text-center mb-16 2xl:mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/60 mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-amber-700 text-sm font-medium tracking-wide">Size Guide</span>
          </div>
          <h2 className="text-4xl md:text-5xl 2xl:text-6xl font-serif font-bold text-stone-800 mb-5 2xl:mb-6">
            Find Your <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 bg-clip-text text-transparent">Perfect Fit</span>
          </h2>
          <p className="text-lg 2xl:text-xl text-stone-500 max-w-2xl 2xl:max-w-3xl mx-auto leading-relaxed">
            Accurate sizing for the perfect comfort and style
          </p>
        </div>

        {/* Category Tabs */}
        <div className={`flex justify-center mb-14 2xl:mb-18 transition-all duration-1000 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative p-1.5 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg shadow-amber-100/50 border border-amber-100">
            {[
              { key: "slippers", label: "Slippers & Flats", icon: "👟" },
              { key: "heels", label: "Heels & Sandals", icon: "👠" }
            ].map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`relative px-7 2xl:px-9 py-3.5 2xl:py-4 rounded-xl font-medium text-sm 2xl:text-base transition-all duration-400 ${selectedCategory === category.key
                    ? "text-white"
                    : "text-stone-500 hover:text-stone-700"
                  }`}
              >
                {selectedCategory === category.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 rounded-xl shadow-lg shadow-amber-300/40 transition-all duration-400"></div>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-base">{category.icon}</span>
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Size Chart Card */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-stone-200/50 border border-white/80 overflow-hidden">

            {/* Table Header */}
            <div className="grid grid-cols-5 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 border-b border-amber-100/60">
              {["Size", "US", "UK", "EU", "CM"].map((header, i) => (
                <div
                  key={header}
                  className="py-5 2xl:py-6 text-center font-semibold text-amber-800/90 text-sm 2xl:text-base tracking-wide"
                >
                  {header}
                </div>
              ))}
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-stone-100/80">
              {sizeCharts[selectedCategory as keyof typeof sizeCharts].map((size, index) => (
                <div
                  key={`${selectedCategory}-${index}`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`grid grid-cols-5 transition-all duration-300 cursor-pointer ${hoveredRow === index
                      ? 'bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90'
                      : 'bg-transparent hover:bg-stone-50/50'
                    }`}
                  style={{
                    animationDelay: `${index * 80}ms`,
                  }}
                >
                  {/* Size Column - Highlighted */}
                  <div className="py-5 2xl:py-6 flex items-center justify-center">
                    <span className={`text-lg 2xl:text-xl font-bold transition-all duration-300 ${hoveredRow === index
                        ? 'text-amber-600 scale-110'
                        : 'text-amber-700'
                      }`}>
                      {size.size}
                    </span>
                  </div>

                  {/* Other Columns */}
                  {[size.us, size.uk, size.eu, size.cm].map((value, i) => (
                    <div key={i} className="py-5 2xl:py-6 flex items-center justify-center">
                      <span className={`text-base 2xl:text-lg transition-all duration-300 ${hoveredRow === index
                          ? 'text-stone-800 font-medium'
                          : 'text-stone-600'
                        }`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Measurement Steps - Horizontal Cards */}
        <div className={`mt-14 2xl:mt-18 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-8">
            <h3 className="text-2xl 2xl:text-3xl font-serif font-semibold text-stone-800">How to Measure</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 2xl:gap-6">
            {measurementSteps.map((item, index) => (
              <div
                key={index}
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
                className={`group relative p-6 2xl:p-7 rounded-2xl bg-white/60 backdrop-blur-sm border transition-all duration-500 cursor-pointer ${activeStep === index
                    ? 'border-amber-300 shadow-xl shadow-amber-100/60 scale-[1.03] bg-gradient-to-br from-white to-amber-50/50'
                    : 'border-stone-200/60 shadow-lg shadow-stone-100/40 hover:shadow-xl hover:border-amber-200'
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Step Badge */}
                <div className={`absolute -top-3 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${activeStep === index
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white scale-110 shadow-amber-300/50'
                    : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-amber-100/30'
                  }`}>
                  {item.step}
                </div>

                {/* Icon */}
                <div className={`text-3xl mb-3 transition-transform duration-300 ${activeStep === index ? 'scale-110' : ''
                  }`}>
                  {item.icon}
                </div>

                <h4 className={`font-semibold mb-2 transition-colors duration-300 ${activeStep === index ? 'text-amber-700' : 'text-stone-800'
                  }`}>
                  {item.title}
                </h4>
                <p className="text-sm 2xl:text-base text-stone-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tip */}
        <div className={`mt-10 2xl:mt-12 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative flex items-start gap-4 p-6 2xl:p-7 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50 border border-amber-200/50 overflow-hidden group hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-500">
            {/* Decorative Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="relative z-10">
              <p className="text-amber-800 font-semibold mb-1">Pro Tip</p>
              <p className="text-stone-600 text-sm 2xl:text-base">
                Measure your feet in the evening when they&apos;re at their largest. If you&apos;re between sizes, we recommend sizing up for comfort.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}