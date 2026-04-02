"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useModals } from "@/contexts/modals-context"
import { useAuth } from "@/contexts/auth-context"
import { ProfilePage } from "@/components/profile-page"
import { Z_INDEX } from "@/lib/z-index"

/**
 * Modals Container
 * 
 * This component renders all modals using React portals at the app root level.
 * Benefits:
 * - Modals are not nested in component hierarchy
 * - Centralized z-index management
 * - No positioning conflicts with other fixed elements
 * - Single source of truth for modal visibility
 * 
 * Portal renders modals directly to document.body, outside the DOM hierarchy
 * of the main app, preventing stacking context issues.
 */

export function ModalsContainer() {
  const [mounted, setMounted] = useState(false)
  const { modals, closeModal } = useModals()
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <>
      {/* Profile Modal - Only render if user is authenticated */}
      {user && (
        <ProfilePage
          isOpen={modals.profile}
          onClose={() => closeModal("profile")}
        />
      )}
    </>,
    document.body
  )
}
