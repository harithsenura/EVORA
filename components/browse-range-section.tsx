"use client"

import Link from "next/link"
import { ArrowRight, MoveRight, Sparkles } from "lucide-react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { useRef, useState, type MouseEvent } from "react"

// --- Data ---
type Category = {
  id: number
  image: string
  subtitle: string
  title: string
  description: string
  count: string
  accent: string
  tag: string
}

const categories: Category[] = [
  {
    id: 1,
    image: "/Ca4.jpg",
    subtitle: "Everyday",
    title: "Heels",
    description: "Effortless style for your daily rhythm.",
    count: "42",
    accent: "#c9a46e",
    tag: "Most Popular",
  },
  {
    id: 2,
    image: "/ca2.jpg",
    subtitle: "Slippers",
    title: "Elegance",
    description: "Sophisticated designs for special nights.",
    count: "28",
    accent: "#b87fa3",
    tag: "New Arrivals",
  },
  {
    id: 3,
    image: "/ca1.jpg",
    subtitle: "Active",
    title: "Platforms",
    description: "High-performance gear for city life.",
    count: "35",
    accent: "#6e9dbf",
    tag: "Trending",
  },
]

// --- Ambient Orb ---
type FloatingOrbProps = {
  delay: number
  x: number | string
  y: number | string
  size: number | string
  color: string
}

function FloatingOrb({ delay, x, y, size, color }: FloatingOrbProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: color,
        filter: "blur(70px)",
        opacity: 0.2,
        zIndex: 0,
      }}
      animate={{ y: [0, -28, 0], x: [0, 14, 0], scale: [1, 1.12, 1], opacity: [0.2, 0.3, 0.2] }}
      transition={{ duration: 9 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  )
}

// --- Liquid Glass Card ---
type CategoryCardProps = {
  item: Category
  index: number
}

function CategoryCard({ item, index }: CategoryCardProps) {
  const [hovered, setHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const cardRef = useRef<HTMLDivElement | null>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 120, damping: 18 })
  const springY = useSpring(rotateY, { stiffness: 120, damping: 18 })

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(x * 10)
    rotateX.set(-y * 10)
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    setHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d", perspective: "1200px" }}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-full"
    >
      {/* Glow halo */}
      <motion.div
        className="absolute -inset-4 rounded-[2.5rem] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${item.accent}, transparent 70%)`, zIndex: 0 }}
        animate={{ opacity: hovered ? 0.3 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Card body */}
      <div
        className="relative rounded-[2rem] overflow-hidden"
        style={{
          height: 470,
          boxShadow: hovered
            ? `0 0 0 1.5px rgba(255,255,255,0.85) inset, 0 1px 0 rgba(255,255,255,1) inset`
            : `0 0 0 1px rgba(255,255,255,0.6) inset`,
          transition: "box-shadow 0.5s ease",
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          zIndex: 1,
        }}
      >
        {/* Image */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: hovered ? 1.1 : 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        </motion.div>

        {/* Frosted light gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              to top,
              rgba(255,255,255,0.97) 0%,
              rgba(255,255,255,0.65) 38%,
              rgba(255,255,255,0.15) 62%,
              rgba(255,255,255,0.0) 100%
            )`,
          }}
        />

        {/* Mouse-follow shimmer */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[2rem]"
          style={{
            background: `radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.4), transparent)`,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* --- TOP LEFT: Tag badge --- */}
        <motion.div
          className="absolute top-5 left-5 z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 + 0.5, duration: 0.5 }}
        >
          <div
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.95)",
              boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
            }}
          >
            <Sparkles className="w-3 h-3" style={{ color: item.accent }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">{item.tag}</span>
          </div>
        </motion.div>

        {/* --- TOP RIGHT: Count pill on hover --- */}
        <motion.div
          className="absolute top-5 right-5 z-20 flex flex-col items-center justify-center w-13 h-13"
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.7, y: hovered ? 0 : -10 }}
          transition={{ duration: 0.35 }}
        >
          <div
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full"
            style={{
              background: item.accent,
              boxShadow: `0 6px 22px ${item.accent}55`,
            }}
          >
            <span className="text-white text-sm font-bold leading-none">{item.count}</span>
            <span className="text-white/75 text-[8px] uppercase tracking-wide">items</span>
          </div>
        </motion.div>

        {/* ─── Bottom Content ─── */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 z-10">

          {/* Subtitle row */}
          <motion.div
            className="flex items-center gap-2.5 mb-2"
            animate={{ opacity: hovered ? 1 : 0.65, x: hovered ? 0 : -4 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="h-px rounded-full"
              style={{ background: item.accent }}
              animate={{ width: hovered ? 30 : 14 }}
              transition={{ duration: 0.4 }}
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">{item.subtitle}</span>
          </motion.div>

          {/* Title */}
          <motion.h3
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "2rem",
              color: "#1a1a1a",
              fontWeight: 400,
              lineHeight: 1.15,
              marginBottom: 4,
            }}
            animate={{ y: hovered ? 0 : 6 }}
            transition={{ duration: 0.4 }}
          >
            {item.title}
          </motion.h3>

          {/* Description + CTA slide-up on hover */}
          <motion.div
            animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: "hidden" }}
          >
            <p className="text-stone-400 text-[13px] leading-relaxed max-w-[88%] pt-2 mb-4">
              {item.description}
            </p>

            {/* CTA button */}
            <motion.button
              className="flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white"
              style={{
                background: item.accent,
                boxShadow: `0 8px 24px ${item.accent}55`,
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Collection
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.span>
            </motion.button>
          </motion.div>

          {/* Default arrow (when not hovered) */}
          <motion.div
            className="mt-2"
            animate={{ opacity: hovered ? 0 : 1, y: hovered ? 6 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.95)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <ArrowRight className="w-4 h-4 -rotate-45" style={{ color: "#888" }} />
            </div>
          </motion.div>
        </div>

        {/* Glass border */}
        <div
          className="absolute inset-0 rounded-[2rem] pointer-events-none"
          style={{
            border: "1.5px solid rgba(255,255,255,0.8)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(255,255,255,0.4)",
          }}
        />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────
export function BrowseRangeSection() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [24, -24])

  return (
    <section
      ref={containerRef}
      className="relative pt-6 md:pt-16 pb-10 md:pb-16 px-6 overflow-hidden"
    >
      {/* Ambient orbs */}
      <FloatingOrb delay={0} x="2%" y="30%" size="420px" color="#f0d9b5" />
      <FloatingOrb delay={5} x="38%" y="55%" size="320px" color="#c0d8e8" />

      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
          zIndex: 0,
        }}
      />

      <div className="max-w-[1200px] mx-auto relative z-10">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-xl">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="flex items-center gap-3 mb-4"
            >
              <motion.div
                className="h-px"
                style={{ background: "linear-gradient(to right, #c9a46e, transparent)", width: 0 }}
                whileInView={{ width: 40 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-stone-400">
                Collections
              </span>
            </motion.div>

            {/* Title — unchanged */}
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.1 }}
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                fontWeight: 400,
                color: "#1a1a1a",
                lineHeight: 1.18,
              }}
            >
              Curated{" "}
              <em style={{ color: "#b0a89c", fontStyle: "italic" }}>Essentials</em>
            </motion.h2>

            {/* Stat pills */}
            <motion.div
              className="flex items-center gap-6 mt-3 flex-wrap"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.28 }}
            >
              {[
                { label: "Styles", value: "105+" },
                { label: "Brands", value: "18" },
                { label: "New Weekly", value: "12+" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 + i * 0.1 }}
                >
                  <span
                    className="text-xl font-semibold"
                    style={{ fontFamily: "Georgia, serif", color: "#1a1a1a" }}
                  >
                    {s.value}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-stone-400 mt-0.5">
                    {s.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* View All CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.32 }}
          >
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 hover:shadow-lg"
              style={{
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1.5px solid rgba(255,255,255,0.9)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                color: "#3a3a3a",
              }}
            >
              View All Categories
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: "#1a1a1a" }}
              >
                <MoveRight className="w-3.5 h-3.5 text-white" />
              </span>
            </Link>
          </motion.div>
        </div>

        {/* ── Cards Grid ── */}
        <motion.div
          style={{ y }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 55, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.75,
                delay: idx * 0.16,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <CategoryCard item={category} index={idx} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Decorative dots row ── */}
        <motion.div
          className="flex items-center justify-center gap-2.5 mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                background: i === 1 ? "#c9a46e" : "#e2d8cf",
                height: 6,
                width: i === 1 ? 28 : 6,
              }}
              animate={{ scale: [1, 1.22, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
            />
          ))}
        </motion.div>

      </div>
    </section>
  )
}