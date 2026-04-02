"use client"

import { createContext, useContext, useState, ReactNode } from "react"

/**
 * Centralized modal state management
 * Instead of each component managing its own modal state,
 * this context provides a single source of truth for all modals
 */

export type ModalState = {
  profile: boolean
  checkout: boolean
}

type ModalsContextType = {
  modals: ModalState
  openModal: (modal: keyof ModalState) => void
  closeModal: (modal: keyof ModalState) => void
  toggleModal: (modal: keyof ModalState) => void
}

const ModalsContext = createContext<ModalsContextType | undefined>(undefined)

export function ModalsProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalState>({
    profile: false,
    checkout: false,
  })

  const openModal = (modal: keyof ModalState) => {
    setModals((prev) => ({ ...prev, [modal]: true }))
  }

  const closeModal = (modal: keyof ModalState) => {
    setModals((prev) => ({ ...prev, [modal]: false }))
  }

  const toggleModal = (modal: keyof ModalState) => {
    setModals((prev) => ({ ...prev, [modal]: !prev[modal] }))
  }

  return (
    <ModalsContext.Provider value={{ modals, openModal, closeModal, toggleModal }}>
      {children}
    </ModalsContext.Provider>
  )
}

export function useModals() {
  const context = useContext(ModalsContext)
  if (context === undefined) {
    throw new Error("useModals must be used within a ModalsProvider")
  }
  return context
}
