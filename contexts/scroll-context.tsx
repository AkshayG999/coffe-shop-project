"use client"

import { useRef, useEffect } from "react"
import { createContext, useContext, ReactNode } from "react"

/**
 * Scroll Context
 * Provides reliable scroll-to-section functionality
 * Uses React refs instead of fragile hash-based navigation
 * Automatically updates URL hash based on visible section
 */

type ScrollTarget = "menu" | "home" | "about" | "contact"

type ScrollContextType = {
  menuRef: React.RefObject<HTMLElement>
  heroRef: React.RefObject<HTMLElement>
  aboutRef: React.RefObject<HTMLElement>
  contactRef: React.RefObject<HTMLElement>
  scrollToSection: (target: ScrollTarget) => void
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined)

export function ScrollProvider({ children }: { children: ReactNode }) {
  const menuRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)

  const scrollToSection = (target: ScrollTarget) => {
    const refs: Record<ScrollTarget, React.RefObject<HTMLElement>> = {
      menu: menuRef,
      home: heroRef,
      about: aboutRef,
      contact: contactRef,
    }

    const ref = refs[target]
    if (ref?.current) {
      // Use scrollIntoView with smooth behavior
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
      // Update URL hash
      window.history.pushState(null, "", `#${target}`)
    }
  }

  // Set up IntersectionObserver to update hash based on visible section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find which section is most visible
        let mostVisibleEntry = entries[0]
        
        for (const entry of entries) {
          if (entry.isIntersecting) {
            mostVisibleEntry = entry
            // Update hash only for intersecting entries
            const target = entry.target.getAttribute("data-scroll-target")
            if (target) {
              // Use replaceState to not create history entries while scrolling
              window.history.replaceState(null, "", `#${target}`)
            }
            break
          }
        }
      },
      {
        threshold: 0.3, // 30% of section must be visible
        rootMargin: "-64px 0px -66% 0px", // offset for fixed header
      }
    )

    // Observe all sections
    const sections = [
      { ref: heroRef, id: "home" },
      { ref: menuRef, id: "menu" },
      { ref: aboutRef, id: "about" },
      { ref: contactRef, id: "contact" },
    ]

    sections.forEach(({ ref, id }) => {
      if (ref?.current) {
        ref.current.setAttribute("data-scroll-target", id)
        observer.observe(ref.current)
      }
    })

    return () => {
      sections.forEach(({ ref }) => {
        if (ref?.current) {
          observer.unobserve(ref.current)
        }
      })
    }
  }, [])

  return (
    <ScrollContext.Provider
      value={{
        menuRef,
        heroRef,
        aboutRef,
        contactRef,
        scrollToSection,
      }}
    >
      {children}
    </ScrollContext.Provider>
  )
}

export function useScroll() {
  const context = useContext(ScrollContext)
  if (context === undefined) {
    throw new Error("useScroll must be used within a ScrollProvider")
  }
  return context
}
