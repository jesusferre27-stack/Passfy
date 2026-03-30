'use client'

import * as React from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { type Pass, type NichoFilter } from '@/lib/types'
import { Input } from '@/components/ui/Input'
import { PassCard } from '@/components/ui/PassCard'

const CATEGORIES: { id: NichoFilter; label: string; icon: string }[] = [
  { id: 'todos',        label: 'Todos',        icon: '✨' },
  { id: 'cines',        label: 'Cines',        icon: '🍿' },
  { id: 'comida',       label: 'Comida',       icon: '🍔' },
  { id: 'cafe',         label: 'Café',         icon: '☕' },
  { id: 'fitness',      label: 'Fitness',      icon: '💪' },
  { id: 'restaurantes', label: 'Restaurantes', icon: '🍽️' },
]

export function CatalogClient({ initialPasses }: { initialPasses: Pass[] }) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<NichoFilter>('todos')
  const [isPending, startTransition] = React.useTransition()

  // Derivar pases filtrados
  const filteredPasses = React.useMemo(() => {
    return initialPasses.filter((pass) => {
      const matchesSearch = pass.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            pass.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === 'todos' || pass.nicho === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [initialPasses, searchQuery, activeCategory])

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    startTransition(() => {
      setSearchQuery(e.target.value)
    })
  }

  // El pass más "popular" (hardcoded por ahora: el primero que tenga más usuarios o hardcoded "BurgerPass")
  const popularPassId = initialPasses.length > 0 ? initialPasses[0].id : null

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-pf-on-surface-var" />
        </div>
        <Input
          type="search"
          placeholder="Busca marcas, pases o nichos..."
          className="pl-12 pr-12 bg-pf-surface-high border-pf-surface-highest focus:border-pf-primary-ctn h-12 rounded-pf-lg"
          onChange={handleSearch}
        />
        <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-pf-on-surface-var hover:text-pf-primary-ctn">
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="-mx-6 px-6 overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 pb-2 w-max">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-pf-full whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? 'bg-pf-primary-ctn border-pf-primary-ctn text-white shadow-pf-glow'
                    : 'bg-pf-surface-high border-pf-surface-highest text-pf-on-surface hover:bg-pf-surface-top'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="font-semibold text-sm">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Pass Grid */}
      <div className="grid gap-5 mt-2">
        {filteredPasses.length === 0 ? (
          <div className="text-center py-12 px-6 pf-card">
            <div className="w-16 h-16 bg-pf-surface-high rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-pf-on-surface-var" />
            </div>
            <h3 className="pf-title text-lg mb-2">No se encontraron passes</h3>
            <p className="text-sm text-pf-on-surface-var text-pretty">
              Intenta cambiar los filtros o los términos de búsqueda.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('todos') }}
              className="mt-6 text-pf-primary font-semibold text-sm hover:underline"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          filteredPasses.map((pass) => (
            <PassCard 
              key={pass.id} 
              pass={pass} 
              isPopular={pass.id === popularPassId} 
            />
          ))
        )}
      </div>
    </div>
  )
}
