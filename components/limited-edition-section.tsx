"use client"

import React, { useState, useEffect, useRef, memo } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { ArrowRight, X, Leaf, Wand2, Sparkles } from "lucide-react"

// --- TYPES ---
type CategoryType = 'heels' | 'flats' | 'platforms';

interface CategoryContent {
    id: CategoryType;
    title: string;
    subtitle: string;
    description: string;
    priceRange: string;
    mainImage: string;
    gallery: string[];
    features: string[];
    tags: string[];
}

// --- DATA: EVORA ORCHIDELLE COLLECTION ---
const ORCHID_DATA: Record<CategoryType, CategoryContent> = {
    heels: {
        id: 'heels',
        title: "Heels Orchidelle",
        subtitle: "Elevation meets Nature",
        description: "Experience the perfect fusion of floral delicacy and architectural height. Our Orchidelle Heels feature hand-sculpted petals and ergonomic arches for all-night comfort.",
        priceRange: "LKR 8,500 - 12,000",
        mainImage: "/4.jpeg", 
        gallery: ["/4.jpeg", "/3.jpeg", "/1.jpeg", "/6.jpeg"],
        features: ["Memory foam insoles", "Hand-painted motifs", "Non-slip sole", "3-inch comfort heel"],
        tags: ["Evening Wear", "Wedding", "Luxury"]
    },
    flats: {
        id: 'flats',
        title: "Flat Orchidelle",
        subtitle: "Grounding Beauty",
        description: "Walk through life as if walking on a bed of petals. The Flat Orchidelle collection brings the intricate details of rare orchids to your everyday stride.",
        priceRange: "LKR 4,500 - 7,500",
        mainImage: "/1.jpeg", 
        gallery: ["/1.jpeg", "/2.jpeg", "/6.jpeg", "/3.jpeg"],
        features: ["Breathable lining", "Flexible construction", "Durable craftsmanship", "Lightweight"],
        tags: ["Casual", "Office", "Daily"]
    },
    platforms: {
        id: 'platforms',
        title: "Platform Orchidelle",
        subtitle: "Bold Botanical Statement",
        description: "Rise above with confidence. The Platform Orchidelle collection offers a modern, chunky aesthetic softened by the organic curves of nature's finest blooms.",
        priceRange: "LKR 6,500 - 9,500",
        mainImage: "/2.jpeg", 
        gallery: ["/2.jpeg", "/4.jpeg", "/1.jpeg", "/3.jpeg"],
        features: ["Ultra-light sole", "Ankle support", "Vibrant colors", "Height boost"],
        tags: ["Trendy", "Street Style", "Party"]
    }
};

const FLOWERS = ["/orchid-1.png", "/orchid-2.png", "/orchid-3.png", "/orchid-4.png", "/orchid-5.png"];

// --- COMPONENTS ---

// 1. FLOWER RAIN (Original Unchanged)
const FlowerRain = memo(({ isActive }: { isActive: boolean }) => {
    const [flowers, setFlowers] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const newFlowers = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 4 + Math.random() * 6,
            size: 0.8 + Math.random() * 0.5,
            emoji: FLOWERS[Math.floor(Math.random() * FLOWERS.length)]
        }));
        setFlowers(newFlowers);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 pointer-events-none z-[40] overflow-hidden"
                >
                    {flowers.map((flower) => (
                        <motion.div
                            key={flower.id}
                            initial={{ y: -100, x: `${flower.x}vw`, opacity: 0, rotate: 0 }}
                            animate={{
                                y: "110vh",
                                opacity: [0, 1, 1, 0],
                                rotate: 360
                            }}
                            transition={{
                                duration: flower.duration,
                                repeat: Infinity,
                                delay: flower.delay,
                                ease: "linear",
                            }}
                            style={{ scale: flower.size }}
                            className="absolute top-0 text-xl md:text-3xl filter drop-shadow-sm opacity-80"
                        >
                            {typeof flower.emoji === "string" && flower.emoji.startsWith("/") ? (
                                <img src={flower.emoji} alt="" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                            ) : (
                                flower.emoji
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
});
FlowerRain.displayName = 'FlowerRain';

// 2. LUXURY MODAL (Mobile layout updated)
const OrchidDetailModal = ({ selectedData, onClose }: { selectedData: CategoryContent | null; onClose: () => void; }) => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => setMounted(true), []);
    useEffect(() => {
        if (!mounted || typeof document === 'undefined') return;
        if (selectedData) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedData, mounted]);

    if (!mounted || typeof document === 'undefined') return null;

    // Animation variants for staggered elegant reveals
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    return createPortal(
        <AnimatePresence>
            {selectedData && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 lg:p-12 overflow-y-auto custom-scrollbar">
                    {/* White Liquid Glass Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-white/40 backdrop-blur-lg backdrop-saturate-150 cursor-pointer"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 20 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-5xl bg-[#FCFCFB] rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 flex flex-col md:flex-row my-auto md:max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button 
                            onClick={onClose} 
                            className="absolute top-4 right-4 md:top-5 md:right-5 z-50 p-3 bg-white/80 hover:bg-white rounded-full transition-all duration-300 backdrop-blur-md shadow-sm border border-stone-100 group"
                        >
                            <X className="w-4 h-4 text-stone-600 group-hover:text-stone-900 group-hover:rotate-90 transition-all duration-300" />
                        </button>

                        {/* Left Side: Editorial Image Layout (Mobile & Desktop) */}
                        <div className="w-full md:w-1/2 relative bg-stone-100/50 p-8 pb-14 md:p-10 flex items-center justify-center min-h-[45vh] md:min-h-0">
                            {/* Decorative background element */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-stone-200/40 via-transparent to-transparent opacity-60" />
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                                className="relative w-[85%] sm:max-w-sm aspect-[4/5] z-10 mt-6 md:mt-0"
                            >
                                <img 
                                    src={selectedData.mainImage} 
                                    alt={selectedData.title} 
                                    className="w-full h-full object-cover rounded-2xl shadow-xl" 
                                />
                                {/* Overlapping secondary image for editorial feel - VISIBLE ON MOBILE TOO WITH WHITE BORDER */}
                                <motion.div 
                                    initial={{ opacity: 0, x: 20, y: 20 }}
                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                                    className="absolute -bottom-8 -right-6 md:-bottom-8 md:-right-8 w-[60%] md:w-2/5 aspect-[3/4] p-2 bg-white rounded-2xl shadow-2xl z-20"
                                >
                                    <img 
                                        src={selectedData.gallery[1]} 
                                        alt="Detail" 
                                        className="w-full h-full object-cover rounded-xl" 
                                    />
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Right Side: Content Area */}
                        <div className="w-full md:w-1/2 p-6 pt-10 md:p-12 flex flex-col h-auto md:h-full overflow-y-auto custom-scrollbar bg-white/50 relative">
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="flex flex-col h-full"
                            >
                                {/* MOBILE ONLY: Action Button (View Collection) at the top */}
                                <motion.div variants={itemVariants} className="flex md:hidden flex-col items-center gap-2 mb-8 w-full border-b border-stone-100 pb-8">
                                    <Link href="/products/orchid-trend" onClick={onClose} className="w-full px-8 py-3.5 bg-stone-900 text-white text-sm rounded-full font-medium tracking-wide hover:bg-stone-800 transition-all flex items-center justify-center gap-3 group shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)]">
                                        View Collection
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-stone-400 uppercase tracking-widest">Starting from</span>
                                        <span className="text-sm font-serif text-stone-900">{selectedData.priceRange.split('-')[0]}</span>
                                    </div>
                                </motion.div>

                                {/* Headers */}
                                <motion.div variants={itemVariants}>
                                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                                        <span className="text-pink-600/80 text-[10px] font-bold tracking-[0.25em] uppercase">Evora Masterpiece</span>
                                    </div>
                                    {/* TITLE: Single line on mobile */}
                                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif text-stone-900 mb-2 leading-tight flex items-center flex-wrap gap-x-2">
                                        {selectedData.title.split(' ')[0]} 
                                        <span className="italic font-light text-stone-500">{selectedData.title.split(' ').slice(1).join(' ')}</span>
                                    </h2>
                                    <p className="text-stone-400 font-serif italic mb-6 text-sm md:text-lg md:border-b md:border-stone-100 md:pb-6">"{selectedData.subtitle}"</p>
                                </motion.div>

                                {/* Description */}
                                <motion.div variants={itemVariants} className="mb-8">
                                    <p className="text-stone-600 leading-relaxed text-sm md:text-base font-light">
                                        {selectedData.description}
                                    </p>
                                </motion.div>

                                {/* Features Tags */}
                                <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-8 md:mb-10">
                                    {selectedData.features.map((feature, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-stone-100 text-stone-600 text-[10px] uppercase tracking-wider rounded-full border border-stone-200/60">
                                            {feature}
                                        </span>
                                    ))}
                                </motion.div>

                                <div className="mt-auto">
                                    {/* DESKTOP ONLY: Action Button (View Collection) at the bottom */}
                                    <motion.div variants={itemVariants} className="hidden md:flex flex-row items-center gap-4 mb-6">
                                        <Link href="/products/orchid-trend" onClick={onClose} className="px-8 py-4 bg-stone-900 text-white text-sm rounded-full font-medium tracking-wide hover:bg-stone-800 transition-all flex items-center justify-center gap-3 group shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)]">
                                            View Collection
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                        <div className="flex flex-col items-start">
                                            <span className="text-[10px] text-stone-400 uppercase tracking-widest">Starting from</span>
                                            <span className="text-lg font-serif text-stone-900">{selectedData.priceRange.split('-')[0]}</span>
                                        </div>
                                    </motion.div>

                                    {/* WhatsApp Customization Box (Mobile & Desktop) */}
                                    <motion.div variants={itemVariants}>
                                        <a href="#" className="group block p-4 rounded-2xl border border-stone-200/60 bg-gradient-to-r from-stone-50 to-white hover:border-pink-200 transition-colors duration-300">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-stone-800 mb-1 font-serif">Bespoke Customization</h4>
                                                    <p className="text-xs text-stone-500 leading-relaxed">
                                                        Looking for a personal touch? Connect with our artisans via WhatsApp to customize colors, fit, and floral arrangements.
                                                    </p>
                                                </div>
                                            </div>
                                        </a>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

// 3. BESPOKE CUSTOMIZATION SECTION (Adjusted Gap)
const BespokeCustomization = memo(() => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { amount: 0.3, once: true });

    const socialLinks = [
        { name: "WhatsApp", icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>, href: "#" },
        { name: "Instagram", icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>, href: "#" },
        { name: "TikTok", icon: <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.39-2.03 1.73-4.86 2.45-7.46 1.84-2.67-.62-4.94-2.48-5.91-5.01-.9-2.34-.73-5.08.51-7.27 1.34-2.35 3.92-3.87 6.64-4.07v4.11c-1.65.17-3.21 1.24-3.85 2.79-.62 1.49-.37 3.32.65 4.58 1.04 1.28 2.83 1.8 4.4 1.43 1.55-.37 2.76-1.57 3.12-3.14.15-.65.2-1.32.2-1.99V0h-3.93l4.9.02z"/>, href: "#" },
        { name: "Facebook", icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>, href: "#" }
    ];

    return (
        <section ref={sectionRef} className="pt-4 pb-12 md:pb-16 relative z-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-3xl mx-auto px-4 sm:px-6 text-center"
            >
                <div className="flex justify-center mb-6">
                    <motion.div 
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center relative"
                    >
                        <Wand2 className="w-5 h-5 text-stone-700" />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-1 -right-1"
                        >
                            <Sparkles className="w-4 h-4 text-pink-400" />
                        </motion.div>
                    </motion.div>
                </div>

                <h3 className="text-2xl md:text-3xl font-serif text-stone-900 mb-3">
                    Customize Your Own
                </h3>
                <p className="text-stone-500 text-sm md:text-base mb-8 max-w-lg mx-auto leading-relaxed">
                    Work directly with our artisans to design your dream Orchidelle heel or flat. 
                    Choose your silhouette, petal arrangements, and colors.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
                    <button className="group flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-stone-800 hover:text-pink-600 transition-colors">
                        View Custom Gallery
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="hidden sm:block w-px h-8 bg-stone-300" />

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-widest mr-2">Contact Us:</span>
                        {socialLinks.map((social) => (
                            <motion.a
                                key={social.name}
                                href={social.href}
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-600 transition-colors shadow-sm"
                                aria-label={social.name}
                            >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    {social.icon}
                                </svg>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
});
BespokeCustomization.displayName = 'BespokeCustomization';

// 4. MODERN LUXURY MARQUEE (Ultra-Premium Redesign)
const StylingMarquee = memo(() => {
    const tips = [
        { text: "Artisanal Hand-Painted Petals", highlight: "Artisanal" },
        { text: "How to pair Orchidelle with Silk", highlight: "Orchidelle" },
        { text: "Ergonomic Arches for Comfort", highlight: "Comfort" },
        { text: "Maintaining your Evora blooms", highlight: "Evora" },
        { text: "Step into the Garden of Elegance", highlight: "Elegance" }
    ];

    const marqueeItems = [...tips, ...tips, ...tips, ...tips];

    return (
        <div className="w-full overflow-hidden bg-white/60 backdrop-blur-xl py-4 border-y border-stone-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] relative">
            <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-[#FAFAF9] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-[#FAFAF9] to-transparent z-10 pointer-events-none" />

            <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                    repeat: Infinity,
                    duration: 40,
                    ease: "linear"
                }}
                className="flex whitespace-nowrap items-center w-max"
            >
                {marqueeItems.map((item, i) => (
                    <div key={i} className="flex items-center">
                        <span className="text-[11px] md:text-sm tracking-[0.25em] uppercase text-stone-500 font-medium px-8 flex items-center">
                            {item.text.split(item.highlight).map((part, idx, arr) => (
                                <React.Fragment key={idx}>
                                    {part}
                                    {idx < arr.length - 1 && (
                                        <span className="font-serif italic text-pink-500/80 lowercase text-base md:text-lg mx-1.5 tracking-normal">
                                            {item.highlight}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-stone-300" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
});
StylingMarquee.displayName = 'StylingMarquee';

// 5. MAIN SECTION
export function LimitedEditionSection() {
    const [selectedCard, setSelectedCard] = useState<CategoryContent | null>(null);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { amount: 0.1, once: false });

    const categories = [ORCHID_DATA.heels, ORCHID_DATA.flats, ORCHID_DATA.platforms];

    return (
        <>
            <FlowerRain isActive={isInView} />

            <section ref={sectionRef} className="relative pt-10 md:pt-2 pb-8 md:pb-12 overflow-hidden bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    
                    <div className="flex flex-col lg:flex-row gap-6 lg:items-end justify-between mb-16">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="lg:w-3/5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Leaf className="w-4 h-4 text-pink-400" />
                                <span className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase">
                                    Evora Spring Collection
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-stone-900 leading-[1.15]">
                                The <span className="italic text-pink-600/90 pr-2">Orchidelle</span><br/>
                                Edition.
                            </h2>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="lg:w-2/5 pb-2"
                        >
                            <p className="text-stone-500 text-base md:text-lg leading-relaxed font-serif border-l-[1.5px] border-pink-200 pl-5">
                                Discover artisanal flower customization. 
                                Where botanical artistry meets modern footwear engineering. 
                                Step into timeless elegance.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                        {categories.map((category, index) => (
                            <div 
                                key={category.id} 
                                className={`flex flex-col items-center group cursor-pointer ${
                                    index === 1 ? 'md:mt-12' : '' 
                                }`}
                                onClick={() => setSelectedCard(category)}
                            >
                                <div className="relative w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-stone-50">
                                    <img
                                        src={category.mainImage}
                                        alt={category.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    
                                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-white/95 via-white/40 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                                        <span className="text-[9px] tracking-[0.25em] uppercase text-white/80 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                            View Details
                                        </span>
                                        <h3 
                                            className="text-xl lg:text-2xl font-serif text-stone-900 group-hover:text-white transition-colors duration-500 mb-5"
                                            style={{ textShadow: "0px 2px 12px rgba(255, 255, 255, 0.9)" }}
                                        >
                                            {category.title}
                                        </h3>
                                        <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm border border-stone-300/60 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500">
                                            <ArrowRight className="w-4 h-4 text-stone-800 group-hover:text-stone-900 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 text-center">
                                    <p className="text-stone-500 font-serif italic text-base mb-1">{category.subtitle}</p>
                                    <p className="text-stone-800 text-[10px] font-bold tracking-[0.2em] uppercase">{category.priceRange}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <OrchidDetailModal selectedData={selectedCard} onClose={() => setSelectedCard(null)} />

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent mt-12 md:mt-16 mb-4 opacity-60" />

                    <BespokeCustomization />

                </div>
                
                <div className="mt-2">
                    <StylingMarquee />
                </div>
            </section>
        </>
    );
}