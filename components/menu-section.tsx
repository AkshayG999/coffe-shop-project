"use client"

import { useState, useEffect } from "react"
import { Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCart, type MenuItem } from "@/contexts/cart-context"
import { useScroll } from "@/contexts/scroll-context"

const categories = ["All", "Espresso", "Brewed", "Specialty", "Cold"]

export function MenuSection() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const { addItem } = useCart()
  const { menuRef } = useScroll()

  // Fetch menu items from PHP API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const category = activeCategory === "All" ? "all" : activeCategory
        const response = await fetch(`/api/menu?category=${category}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch menu')
        }
        
        const data = await response.json()
        
        if (data.success && data.items) {
          // Convert to MenuItem format
          const items = data.items.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image: item.image
          }))
          setMenuItems(items)
        } else {
          throw new Error(data.message || 'Failed to load menu')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading menu'
        setError(errorMessage)
        console.error('Menu fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenu()
  }, [activeCategory])

  const filteredItems = activeCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory)

  const handleAddToCart = (item: MenuItem) => {
    addItem(item)
    setAddedItems((prev) => new Set(prev).add(item.id))
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(item.id)
        return newSet
      })
    }, 1500)
  }

  return (
    <section ref={menuRef} id="menu" className="py-24 lg:py-32 bg-secondary scroll-mt-16 lg:scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-accent uppercase tracking-widest text-sm font-medium mb-4">
            Our Menu
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance">
            Crafted With Care
          </h2>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-card/80 hover:text-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        )}

        {/* Menu Grid */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-card rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border flex flex-col h-full"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image Container */}
                <div className="relative w-full h-48 overflow-hidden bg-muted flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=400&fit=crop"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-serif text-lg font-semibold text-foreground leading-tight">
                      {item.name}
                    </h3>
                    <span className="text-accent font-bold text-lg whitespace-nowrap">
                      ₹{item.price}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-3">
                    {item.description}
                  </p>

                  {/* Footer with Category and Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                    <Button
                      onClick={() => handleAddToCart(item)}
                      size="sm"
                      className={cn(
                        "transition-all gap-1",
                        addedItems.has(item.id)
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      )}
                    >
                      {addedItems.has(item.id) ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span className="hidden sm:inline">Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span className="hidden sm:inline">Add</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No items message */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found</p>
          </div>
        )}
      </div>
    </section>
  )
}
