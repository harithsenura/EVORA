"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

const sampleImages = [
  "/1.jpeg",
  "/2.jpeg",
  "/4.jpeg",
  "/3.jpeg",
  "/6.jpeg"
];

export default function LensoraPolaroidCollection() {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isMobile, setIsMobile] = useState(false);

  // Screen size eka detect karala mobile offset eka hadaganna
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile(); // Check on initial load
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getStackStyles = (index: number) => {
    if (index === activeIndex) {
      return {
        transform: `rotate(0deg) translate(0px, 0px) scale(1)`,
        zIndex: 20,
        opacity: 1,
        filter: 'brightness(1)',
      };
    }

    let diff = index - activeIndex;

    const rotation = diff * 8;
    // Mobile ekedi gap eka (offset) thawa adu kala 16 ta (edges walin eliyata yana eka nawaththanna)
    const xOffset = diff * (isMobile ? 16 : 35);
    const yOffset = Math.abs(diff) * (isMobile ? 2 : 5);
    const scale = 1 - Math.abs(diff) * 0.05;
    const zIndex = 10 - Math.abs(diff);

    return {
      transform: `rotate(${rotation}deg) translate(${xOffset}px, ${yOffset}px) scale(${scale})`,
      zIndex: zIndex,
      opacity: 1,
      filter: 'brightness(0.9)',
    };
  };

  return (
    <section className="w-full pt-4 pb-8 md:pt-6 md:pb-10 px-4 md:px-8 2xl:px-16 overflow-visible mt-4 md:mt-2 relative z-10">

      <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-4 2xl:gap-8">

        <div className="lg:col-span-3 text-center lg:text-left z-10 order-1 mt-6 md:mt-0">
          <h2 className="text-5xl md:text-6xl 2xl:text-7xl font-serif text-[#1a2e1a] leading-none">
            Lensora <br />
            Collection
          </h2>
        </div>

        {/* Height eka thawa tikak adu kala mobile ekata */}
        <div className="lg:col-span-6 relative flex justify-center items-center h-[280px] sm:h-[340px] md:h-[400px] 2xl:h-[500px] order-2 perspective-1000 overflow-visible mt-2 md:mt-0">

          {/* Wrapper eke size eka mobile ekata thawa podi kala */}
          <div className="relative w-[200px] h-[280px] md:w-[340px] md:h-[320px] 2xl:w-[420px] 2xl:h-[520px] flex justify-center items-center overflow-visible">
            {sampleImages.map((imgUrl, index) => (
              <motion.div
                key={index}
                onClick={() => setActiveIndex(index)}

                initial={{
                  opacity: 0,
                  transform: "rotate(0deg) translate(0px, 100px) scale(0.5)"
                }}

                whileInView={getStackStyles(index)}

                viewport={{ once: true, amount: 0.3 }}

                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  type: "spring",
                  bounce: 0.4
                }}
                
                // Cards thawa tikak podi kala (w-[170px] h-[230px]) ethakota margins walata wadinne na
                className="absolute top-4 w-[190px] h-[250px] sm:w-[200px] sm:h-[260px] md:w-[300px] md:h-[380px] 2xl:w-[380px] 2xl:h-[480px] bg-white p-2 md:p-3 2xl:p-4 pb-8 sm:pb-10 md:pb-14 2xl:pb-16 rounded-lg cursor-pointer origin-bottom shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05),0_0_22px_8px_rgba(255,255,255,0.35)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15),0_0_26px_10px_rgba(255,255,255,0.4)]"
              >
                <div className="w-full h-full bg-gray-100 overflow-hidden relative rounded-sm">
                  <img
                    src={imgUrl}
                    alt={`Style ${index + 1}`}
                    className="w-full h-full object-cover pointer-events-none select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-40 pointer-events-none"></div>
                </div>

                <div className="absolute bottom-2 md:bottom-4 2xl:bottom-6 left-0 w-full text-center">
                  <span className="font-serif text-gray-700 text-[11px] sm:text-xs md:text-sm 2xl:text-base italic">Lensora Look #{index + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col items-center lg:items-end text-center lg:text-right gap-6 2xl:gap-8 z-10 order-3 mt-4 md:mt-0">
          <p className="text-[#4a4a4a] text-sm 2xl:text-base leading-relaxed max-w-xs lg:max-w-none bg-white/50 p-4 2xl:p-6 rounded-xl lg:bg-transparent lg:p-0">
            Click on any card in the stack to bring it to the front.
            Experience our latest styles with a single touch.
          </p>
          <button className="bg-[#1a2e1a] text-white px-8 2xl:px-10 py-3 2xl:py-4 rounded-full text-xs 2xl:text-sm font-semibold tracking-wider uppercase hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg">
            Try Now
          </button>
        </div>

      </div>
    </section>
  )
}