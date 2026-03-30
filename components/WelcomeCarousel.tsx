'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, ChevronRight } from 'lucide-react'

interface Promotion {
  id: string
  brand: string
  bgColor: string
  title: string
  subtitle: string
  savings: string
  price: string
  ctaText: string
  nicheFilter: string
}

const PROMOTIONS: Promotion[] = [
  {
    id: 'cinepolis',
    brand: 'Cinépolis',
    bgColor: '#E63946',
    title: '2x1 en cualquier\nfunción',
    subtitle: 'Válido de lunes a domingo. Aplica restricciones.',
    savings: 'Ahorra hasta $180 MXN',
    price: '$199',
    ctaText: 'Obtener CinePass',
    nicheFilter: 'Cine',
  },
  {
    id: 'dominos',
    brand: "Domino's Pizza",
    bgColor: '#1a6b5a',
    title: 'Lleva 2,\npaga 1',
    subtitle: 'En pizzas grandes masa original.',
    savings: 'Ahorra hasta $250 MXN',
    price: '$199',
    ctaText: 'Obtener BurgerPass', // As requested, though BurgerPass for Domino's is weird, I'll follow the exact text
    nicheFilter: 'Restaurantes',
  },
  {
    id: 'mcdonalds',
    brand: "McDonald's",
    bgColor: '#2d5fa6',
    title: 'Combo gratis\nen tu cumpleaños',
    subtitle: 'Presentando tu identificación oficial.',
    savings: 'Ahorra hasta $150 MXN',
    price: '$199',
    ctaText: 'Obtener RestaurantPass',
    nicheFilter: 'Restaurantes',
  },
]

export function WelcomeCarousel() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto rotate every 3.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMOTIONS.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const handleCtaClick = (nicheFilter: string) => {
    // Redirige a /passes con filtro
    router.push(`/passes?niche=${encodeURIComponent(nicheFilter)}`)
  }

  const currentPromo = PROMOTIONS[currentIndex]

  return (
    <div className="relative w-full h-[400px] sm:h-[420px] rounded-3xl overflow-hidden shadow-2xl isolate mb-8">
      {/* Background with color transition */}
      <div 
        className="absolute inset-0 transition-colors duration-700 ease-in-out -z-20"
        style={{ backgroundColor: currentPromo.bgColor }}
      />
      
      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white opacity-15 blur-2xl -z-10 animate-pf-fade-in" key={`circle1-${currentIndex}`} />
      <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-black opacity-15 blur-3xl -z-10 animate-pf-fade-in" key={`circle2-${currentIndex}`} />

      {/* Content wrapper with slide animations keyed by index to re-trigger */}
      <div 
        key={currentPromo.id} 
        className="w-full h-full p-6 sm:p-8 flex flex-col justify-between animate-pf-slide-up"
      >
        {/* Top Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-bold uppercase tracking-wider">
              {currentPromo.brand}
            </span>
          </div>

          <h2 className="pf-display text-4xl sm:text-5xl text-white font-extrabold leading-[1.1] whitespace-pre-line">
            {currentPromo.title}
          </h2>
          
          <p className="text-white/90 text-sm font-medium">
            {currentPromo.subtitle}
          </p>

          <div className="inline-flex mt-2 items-center gap-1.5 bg-[#E7C268] text-[#251A00] px-3 py-1.5 rounded-full w-max animate-pf-badge-pop shadow-pf-amber">
            <Star className="w-3.5 h-3.5 fill-[#251A00]" />
            <span className="text-xs font-bold uppercase tracking-wide">
              {currentPromo.savings}
            </span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between gap-4 mt-auto">
          <button 
            onClick={() => handleCtaClick(currentPromo.nicheFilter)}
            className="flex-1 bg-white text-black rounded-full py-4 px-6 font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors animate-pf-btn-pulse shadow-lg"
          >
            {currentPromo.ctaText}
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col items-end">
            <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Por solo</span>
            <span className="pf-display text-2xl font-bold text-white">{currentPromo.price}</span>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {PROMOTIONS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-white' : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
