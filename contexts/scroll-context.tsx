"use client"

import { useEffect, useRef } from "react"
import { createContext, useContext, ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

/**
 * Scroll Context
 * Provides reliable scroll-to-section functionality
 * Uses React refs instead of fragile hash-based navigation
 * Automatically updates URL hash based on visible section
 */

export type ScrollTarget = "menu" | "home" | "about" | "contact"

type ScrollContextType = {
  menuRef: React.RefObject<HTMLElement | null>
  heroRef: React.RefObject<HTMLElement | null>
  aboutRef: React.RefObject<HTMLElement | null>
  contactRef: React.RefObject<HTMLElement | null>
  scrollToSection: (target: ScrollTarget) => void
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined)

function isScrollTarget(value: string): value is ScrollTarget {
  return value === "home" || value === "about" || value === "menu" || value === "contact"
}

export function ScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const menuRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)

  const getSectionRefs = (): Record<ScrollTarget, React.RefObject<HTMLElement | null>> => ({
    menu: menuRef,
    home: heroRef,
    about: aboutRef,
    contact: contactRef,
  })

  const scrollWithinPage = (target: ScrollTarget, historyMode: "push" | "replace" | "none" = "push") => {
    const refs = getSectionRefs()
    const ref = refs[target]

    if (!ref.current) {
      return false
    }

    ref.current.scrollIntoView({ behavior: "smooth", block: "start" })

    if (historyMode === "push") {
      window.history.pushState(null, "", `/#${target}`)
    } else if (historyMode === "replace") {
      window.history.replaceState(null, "", `/#${target}`)
    }

    return true
  }

  const scrollToSection = (target: ScrollTarget) => {
    if (pathname !== "/") {
      router.push(`/#${target}`)
      return
    }

    const didScroll = scrollWithinPage(target)
    if (!didScroll) {
      router.push(`/#${target}`)
    }
  }

  useEffect(() => {
    if (pathname !== "/") {
      return
    }

    const hash = window.location.hash.replace("#", "")
    if (!isScrollTarget(hash)) {
      return
    }

    scrollWithinPage(hash, "none")
  }, [pathname])

  useEffect(() => {
    const refs: Record<ScrollTarget, React.RefObject<HTMLElement | null>> = {
      menu: menuRef,
      home: heroRef,
      about: aboutRef,
      contact: contactRef,
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target.getAttribute("data-scroll-target")
            if (target && isScrollTarget(target)) {
              window.history.replaceState(null, "", `/#${target}`)
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
        if (ref.current) {
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
