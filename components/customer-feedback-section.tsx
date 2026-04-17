"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Star, X, Plus, CheckCircle2, ThumbsUp, ChevronDown } from "lucide-react"
import { API_BASE_URL } from "@/lib/api-config"

// --- 1. Types & API ---

const API_BASE = API_BASE_URL

type FitType = "Small" | "True to Size" | "Large"

const FIT_VALUES: FitType[] = ["Small", "True to Size", "Large"]

function normalizeFit(fit: string | undefined | null): FitType {
  if (fit == null || String(fit).trim() === "") return "True to Size"
  const raw = String(fit).trim()
  const lower = raw.toLowerCase()
  if (lower === "small") return "Small"
  if (lower === "large") return "Large"
  if (lower === "true to size" || lower === "truetosize") return "True to Size"
  if (FIT_VALUES.includes(raw as FitType)) return raw as FitType
  return "True to Size"
}

const GUEST_ID_KEY = "evora_feedback_guest_id"

function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return ""
  try {
    let id = localStorage.getItem(GUEST_ID_KEY)
    if (!id) {
      id = "g_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36)
      localStorage.setItem(GUEST_ID_KEY, id)
    }
    return id
  } catch {
    return "g_session_" + Math.random().toString(36).slice(2)
  }
}

interface Feedback {
  id: string
  name: string
  role: string
  rating: number
  date: string
  comment: string
  fit: FitType
  images?: string[]
  helpfulCount: number
  liked: boolean
  storeResponse?: string
  isVerified: boolean
}

function mapBackendToFeedback(fb: {
  _id: string
  name: string
  role?: string
  rating: number
  comment: string
  fit?: string
  storeResponse?: string
  createdAt: string
  helpfulCount?: number
  liked?: boolean
  images?: string[]
}): Feedback {
  return {
    id: fb._id,
    name: fb.name,
    role: fb.role || "Verified Buyer",
    rating: fb.rating,
    date: new Date(fb.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    comment: fb.comment,
    fit: normalizeFit(fb.fit),
    images: Array.isArray(fb.images) ? fb.images : [],
    helpfulCount: typeof fb.helpfulCount === "number" ? fb.helpfulCount : 0,
    liked: Boolean(fb.liked),
    storeResponse: fb.storeResponse,
    isVerified: true,
  }
}

// --- 2. Helper Functions ---

// Premium subtle avatar colors
const avatarColors = [
  "bg-[#FDF8F5] text-[#A67B5B]",
  "bg-[#F5F7FA] text-[#5C6B73]",
  "bg-[#FAF5F7] text-[#9D6B84]",
  "bg-[#F4F9F4] text-[#6B8E7B]",
  "bg-[#FDF9F1] text-[#B59A5A]",
]

const getInitials = (name: string) => name.charAt(0).toUpperCase()

const getColorFromName = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

// --- 3. Sub-Components ---

const FitIndicator = ({ fit }: { fit: FitType }) => {
  return (
    <div className="flex items-center gap-2 mt-auto pt-2">
      <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Fit:</span>
      <div className="flex gap-1.5">
        <div className={`h-1.5 w-4 md:w-5 rounded-full transition-colors ${fit === "Small" ? "bg-stone-800" : "bg-stone-300"}`} />
        <div className={`h-1.5 w-4 md:w-5 rounded-full transition-colors ${fit === "True to Size" ? "bg-stone-800" : "bg-stone-300"}`} />
        <div className={`h-1.5 w-4 md:w-5 rounded-full transition-colors ${fit === "Large" ? "bg-stone-800" : "bg-stone-300"}`} />
      </div>
      <span className="text-[10px] font-semibold text-stone-600 ml-1">{fit}</span>
    </div>
  )
}

// Reusable Feedback Card Component - FINAL CLEAR LUXURY REDESIGN
const FeedbackCard = ({
  feedback,
  onHelpful,
  helpfulLoadingId,
  hasVoted,
  compact = false,
}: {
  feedback: Feedback
  onHelpful: (id: string) => void
  helpfulLoadingId: string | null
  hasVoted: boolean
  index?: number
  compact?: boolean
}) => {
  const isLiked = hasVoted || feedback.liked
  const isDisabled = hasVoted || helpfulLoadingId === feedback.id

  return (
    <div className={`group relative flex flex-col h-full text-left bg-[#F9F8F6] rounded-[20px] border border-[#E5E2DC] shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden isolation-isolate`}>
      <div className={`${compact ? "p-5" : "p-6 md:p-7"} flex flex-col flex-1 relative`}>
        {/* Header */}
        <div className={`flex justify-between items-start ${compact ? "mb-4" : "mb-5"}`}>
          <div className="flex gap-3 items-center">
            <div
              className={`${compact ? "w-9 h-9 text-xs" : "w-11 h-11 text-sm"} rounded-full flex items-center justify-center font-serif font-bold shrink-0 border border-[#E5E2DC]/50 shadow-sm ${getColorFromName(feedback.name)}`}
            >
              {getInitials(feedback.name)}
            </div>
            <div>
              <h4 className={`${compact ? "text-[14px]" : "text-[15px]"} font-semibold text-stone-900 leading-none mb-1.5 flex items-center gap-1.5 tracking-tight`}>
                {feedback.name}
                {feedback.isVerified && <CheckCircle2 className={`${compact ? "w-3 h-3" : "w-3.5 h-3.5"} text-[#C5A059]`} />}
              </h4>
              <p className={`text-[9px] uppercase tracking-widest text-stone-500 font-medium`}>{feedback.date}</p>
            </div>
          </div>

          {/* Rating pill - White background to pop against the cream card */}
          <div className={`flex items-center gap-1 bg-white border border-[#E5E2DC] shadow-sm rounded-full shrink-0 ${compact ? "px-2 py-1" : "px-2.5 py-1"}`}>
            <Star className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} fill-[#C5A059] text-[#C5A059]`} />
            <span className={`${compact ? "text-[10px]" : "text-[11px]"} font-bold text-stone-800`}>{feedback.rating}.0</span>
          </div>
        </div>

        {/* Stars row */}
        <div className={`flex gap-0.5 ${compact ? "mb-2.5" : "mb-3"}`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`${compact ? "w-3 h-3" : "w-3.5 h-3.5"} ${i < feedback.rating ? "fill-[#C5A059] text-[#C5A059]" : "fill-stone-300 text-stone-300"}`}
            />
          ))}
        </div>

        <h5 className={`${compact ? "text-[14px] mb-2" : "text-[16px] mb-2.5"} font-semibold text-stone-900 tracking-tight`}>
          {feedback.rating === 5 ? "Absolutely Perfect" : "Great Slipper"}
        </h5>
        <p className={`text-stone-700 ${compact ? "text-[13px]" : "text-[14px]"} leading-relaxed mb-5 flex-1 font-medium`}>{feedback.comment}</p>

        <FitIndicator fit={feedback.fit} />

        {/* Brand Response - White box to stand out */}
        {feedback.storeResponse && (
          <div className={`${compact ? "mt-4 p-3.5" : "mt-6 p-4 md:p-5"} bg-white rounded-2xl border border-[#E5E2DC] shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`${compact ? "w-4 h-4" : "w-5 h-5"} rounded-full bg-stone-900 flex items-center justify-center shrink-0`}>
                <span className={`${compact ? "text-[7px]" : "text-[8px]"} font-bold text-[#C5A059]`}>E</span>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-stone-900">Evora Team</p>
            </div>
            <p className={`${compact ? "text-[12px]" : "text-[13px]"} text-stone-600 leading-relaxed font-medium`}>{feedback.storeResponse}</p>
          </div>
        )}

        {/* Helpful */}
        <div className={`${compact ? "mt-4 pt-4" : "mt-6 pt-5"} border-t border-[#E5E2DC] flex justify-between items-center select-none relative z-[100]`}>
          <span className={`${compact ? "text-[9px]" : "text-[10px]"} uppercase tracking-widest text-stone-500 font-bold`}>Verified Purchase</span>
          <button
            type="button"
            disabled={isDisabled}
            aria-label={`Mark review as helpful (${feedback.helpfulCount} votes)`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!isDisabled) onHelpful(feedback.id)
            }}
            className={`inline-flex items-center gap-1.5 ${compact ? "text-[10px] min-h-[32px] min-w-[80px]" : "text-xs min-h-[36px] min-w-[100px]"} font-medium justify-center rounded-full px-3 py-1.5 border transition-all focus:outline-none focus:ring-2 focus:ring-stone-400 ${
              isDisabled
                ? "cursor-default bg-stone-100 text-stone-400 border-transparent"
                : isLiked
                  ? "cursor-default bg-stone-100 text-stone-600 border-[#E5E2DC]"
                  : "cursor-pointer bg-white text-stone-600 border-[#E5E2DC] shadow-sm hover:bg-stone-50 hover:text-stone-900 active:scale-95"
            }`}
          >
            <ThumbsUp className={`${compact ? "w-3 h-3" : "w-3.5 h-3.5"} shrink-0 ${isLiked ? "fill-[#C5A059] text-[#C5A059]" : ""}`} />
            {helpfulLoadingId === feedback.id ? "..." : `Helpful (${feedback.helpfulCount})`}
          </button>
        </div>
      </div>
    </div>
  )
}

const FeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<Feedback>) => Promise<void>
}) => {
  const [rating, setRating] = useState(5)
  const [fit, setFit] = useState<FitType>("True to Size")
  const [formData, setFormData] = useState({ name: "", comment: "" })
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.comment) return
    const fitToSend = fit
    setIsSubmitting(true)
    try {
      const body = {
        name: formData.name.trim(),
        role: "Customer",
        rating: Number(rating),
        comment: formData.comment.trim(),
        fit: fitToSend,
      }
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to submit review")
      }
      await onSubmit({
        ...formData,
        rating,
        fit,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        helpfulCount: 0,
        isVerified: false,
        role: "Customer",
      })
      setFormData({ name: "", comment: "" })
      setRating(5)
      setFit("True to Size")
      onClose()
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-stone-100 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-50 transition-colors"
            >
              <X className="w-5 h-5 text-stone-400 hover:text-stone-800" />
            </button>

            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-1">Share Your Experience</h3>
            <p className="text-sm text-stone-500 mb-6">Join the Evora community by leaving a review.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold">Overall Rating</span>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform active:scale-90 hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= rating ? "fill-[#C5A059] text-[#C5A059]" : "fill-stone-50 text-stone-200"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold">How did it fit?</span>
                <div className="flex bg-stone-50 rounded-xl p-1">
                  {(["Small", "True to Size", "Large"] as FitType[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFit(f)}
                      className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${fit === f ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <input
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl bg-stone-50 border border-transparent focus:border-stone-200 focus:bg-white focus:ring-0 transition-all outline-none text-stone-800 text-sm"
                />
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you loved about your purchase..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl bg-stone-50 border border-transparent focus:border-stone-200 focus:bg-white focus:ring-0 transition-all outline-none resize-none text-stone-800 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-900 text-white text-xs tracking-[0.15em] uppercase font-semibold py-4 rounded-xl hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── Staggered card list for the modal ───────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 },
  }),
}

// Modal for viewing all reviews smoothly
const AllReviewsModal = ({
  isOpen,
  onClose,
  feedbacks,
  onHelpful,
  helpfulLoadingId,
  votedIds,
}: {
  isOpen: boolean
  onClose: () => void
  feedbacks: Feedback[]
  onHelpful: (id: string) => void
  helpfulLoadingId: string | null
  votedIds: Set<string>
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col p-4 md:p-6 lg:p-8">
          {/* Blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/90 backdrop-blur-md"
          />

          {/* Floating header */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="relative z-10 flex justify-between items-center mb-8 shrink-0 max-w-7xl mx-auto w-full"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-stone-500">
                REVIEWS
              </span>
              <h3 className="text-2xl md:text-4xl font-serif leading-tight">
                <span className="font-bold text-stone-900">All Customer</span>
                <span className="font-normal italic text-stone-500 ml-2">Reviews</span>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white border border-stone-200 shadow-sm rounded-full hover:bg-stone-50 transition-colors"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </motion.div>

          {/* Scrollable staggered grid - Adjusted for 3 columns and larger gaps */}
          <div className="relative z-10 overflow-y-auto flex-1 pb-8 max-w-7xl mx-auto w-full">
            <motion.div
              className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {feedbacks.map((feedback, index) => (
                <motion.div
                  key={`modal-${feedback.id}`}
                  custom={index}
                  variants={cardVariants}
                >
                  <FeedbackCard
                    feedback={feedback}
                    onHelpful={onHelpful}
                    helpfulLoadingId={helpfulLoadingId}
                    hasVoted={votedIds.has(feedback.id)}
                    index={index}
                    compact={false} // Turned off compact mode so cards look standard size
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// --- 4. Main Component ---

export function CustomerFeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [feedbackLoading, setFeedbackLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"recent" | "highest">("recent")
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [viewAllOpen, setViewAllOpen] = useState(false)

  const fetchApprovedFeedbacks = async () => {
    try {
      setFeedbackLoading(true)
      const guestId = getOrCreateGuestId()
      const url = guestId
        ? `${API_BASE}/api/feedback?guestId=${encodeURIComponent(guestId)}`
        : `${API_BASE}/api/feedback`
      const res = await fetch(url, { cache: "no-store", headers: { "Cache-Control": "no-cache" } })
      if (!res.ok) throw new Error("Failed to fetch reviews")
      const data = await res.json()
      setFeedbacks((data || []).map(mapBackendToFeedback))
    } catch (err) {
      console.error("Error fetching feedbacks:", err)
      setFeedbacks([])
    } finally {
      setFeedbackLoading(false)
    }
  }

  const [helpfulLoadingId, setHelpfulLoadingId] = useState<string | null>(null)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())

  const handleHelpful = async (feedbackId: string) => {
    const fb = feedbacks.find((f) => f.id === feedbackId)
    if (!fb) return
    if (votedIds.has(feedbackId)) return
    setVotedIds((prev) => new Set(prev).add(feedbackId))
    const guestId = getOrCreateGuestId()
    setHelpfulLoadingId(feedbackId)

    // Optimistic update: show liked state and +1 count immediately
    const previousFeedbacks = feedbacks
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.id === feedbackId ? { ...f, helpfulCount: f.helpfulCount + 1, liked: true } : f
      )
    )

    if (!guestId) {
      setHelpfulLoadingId(null)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/feedback/${feedbackId}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      })
      if (!res.ok) throw new Error("Failed to add vote")
      const data = await res.json()
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === feedbackId
            ? { ...f, helpfulCount: data.helpfulCount ?? f.helpfulCount, liked: true }
            : f
        )
      )
    } catch (err) {
      console.error("Error marking helpful:", err)
      setFeedbacks(previousFeedbacks)
      setVotedIds((prev) => {
        const next = new Set(prev)
        next.delete(feedbackId)
        return next
      })
    } finally {
      setHelpfulLoadingId(null)
    }
  }

  useEffect(() => {
    fetchApprovedFeedbacks()
  }, [])

  // Refetch when tab becomes visible so admin reply saves show on home page in real time
  useEffect(() => {
    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchApprovedFeedbacks()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [])

  const handleAddFeedback = async () => {
    await fetchApprovedFeedbacks()
  }

  const averageRating = useMemo(() => {
    if (!feedbacks.length) return 0
    const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0)
    return (sum / feedbacks.length).toFixed(1)
  }, [feedbacks])

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    feedbacks.forEach((f) => {
      if (f.rating >= 1 && f.rating <= 5) {
        counts[f.rating as keyof typeof counts]++
      }
    })
    return counts
  }, [feedbacks])

  const sortedFeedbacks = useMemo(() => {
    return [...feedbacks].sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating
      return 0
    })
  }, [feedbacks, sortBy])

  const INITIAL_DISPLAY_COUNT = 3
  const displayedFeedbacks = sortedFeedbacks.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMoreFeedbacks = sortedFeedbacks.length > INITIAL_DISPLAY_COUNT

  return (
    <section className="py-20 relative bg-transparent w-full text-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header & Stats Summary */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-16">
          <div className="lg:col-span-5 flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            <div className="text-center sm:text-left">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight mb-2">
                Customer <span className="font-light italic text-stone-500">Reviews</span>
              </h2>
              <div className="flex items-center gap-3 mt-4 justify-center sm:justify-start">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? "fill-[#C5A059] text-[#C5A059]" : "fill-stone-200 text-stone-200"}`}
                    />
                  ))}
                </div>
                <span className="text-3xl font-serif text-stone-900">{averageRating}</span>
              </div>
              <p className="text-sm text-stone-500 mt-2">Based on {feedbacks.length} reviews</p>
              {(() => {
                const fromApi = feedbacks
                  .flatMap((f) => f.images ?? [])
                  .filter(Boolean)
                  .slice(0, 4)
                const placeholders = [
                  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=96&h=96&fit=crop",
                  "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=96&h=96&fit=crop",
                  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=96&h=96&fit=crop",
                  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=96&h=96&fit=crop",
                ]
                const customerImages = fromApi.length >= 4 ? fromApi : [...fromApi, ...placeholders].slice(0, 4)
                return (
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                    {customerImages.map((src, i) => (
                      <div
                        key={`customer-img-${i}`}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 flex-shrink-0 ring-0 hover:ring-2 hover:ring-[#C5A059]/40 transition-all"
                      >
                        <img
                          src={src}
                          alt={`Customer review ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Progress Bars */}
          <div className="lg:col-span-4 w-full max-w-sm mx-auto lg:mx-0 space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star as keyof typeof ratingCounts]
              const percentage = feedbacks.length ? (count / feedbacks.length) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-stone-500 font-medium text-left">{star} Stars</span>
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-800 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-8 text-right text-stone-400 text-xs">{count}</span>
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-3 flex justify-center lg:justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-full font-semibold text-xs tracking-[0.15em] uppercase hover:bg-stone-800 transition-all active:scale-95 shadow-xl shadow-stone-900/10"
            >
              <Plus className="w-4 h-4" />
              Write a Review
            </button>
          </div>
        </div>

        <hr className="border-stone-100 mb-8" />

        {/* Sorting */}
        <div className="flex justify-between items-center mb-8 relative z-20">
          <span className="text-sm font-medium text-stone-900">{feedbacks.length} Reviews</span>

          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 bg-stone-50 px-4 py-2.5 rounded-lg transition-colors"
            >
              Sort by: {sortBy === "recent" ? "Most Recent" : "Highest Rated"}
              <ChevronDown className={`w-3 h-3 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-stone-100 rounded-xl shadow-xl shadow-stone-200/20 py-2 overflow-hidden text-left"
                >
                  <button
                    onClick={() => { setSortBy("recent"); setIsSortOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                  >
                    Most Recent
                  </button>
                  <button
                    onClick={() => { setSortBy("highest"); setIsSortOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                  >
                    Highest Rated
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Reviews Grid - horizontal swipe on mobile, grid on md+ */}
        <div className="relative z-10 flex gap-5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory touch-pan-x pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:snap-none lg:grid-cols-3 hide-scrollbar">
          {feedbackLoading && (
            <div className="min-w-full md:col-span-full text-center py-12 text-stone-500">Loading reviews...</div>
          )}
          {!feedbackLoading && sortedFeedbacks.length === 0 && (
            <div className="min-w-full md:col-span-full text-center py-12 text-stone-500">
              No reviews yet. Be the first to share your experience!
            </div>
          )}
          {!feedbackLoading &&
            displayedFeedbacks.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
                className="flex-shrink-0 w-[85vw] max-w-[340px] snap-center md:w-auto md:max-w-none"
              >
                <FeedbackCard
                  feedback={feedback}
                  onHelpful={handleHelpful}
                  helpfulLoadingId={helpfulLoadingId}
                  hasVoted={votedIds.has(feedback.id)}
                  index={index}
                  compact={false}
                />
              </motion.div>
            ))}
        </div>

        {/* View All Button */}
        {hasMoreFeedbacks && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setViewAllOpen(true)}
              className="px-8 py-3.5 border-2 border-stone-200 text-stone-600 rounded-full font-semibold text-xs tracking-[0.1em] uppercase hover:border-stone-900 hover:text-stone-900 transition-all active:scale-95"
            >
              View All Reviews ({feedbacks.length})
            </button>
          </div>
        )}
      </div>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddFeedback}
      />

      <AllReviewsModal
        isOpen={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        feedbacks={sortedFeedbacks}
        onHelpful={handleHelpful}
        helpfulLoadingId={helpfulLoadingId}
        votedIds={votedIds}
      />
    </section>
  )
}