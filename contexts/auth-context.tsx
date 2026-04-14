"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { apiUrl } from "@/lib/api-client"

export type User = {
  id: string
  email: string
  name: string
  role?: string
  isAdmin?: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  clearError: () => void
  isLoginModalOpen: boolean
  setIsLoginModalOpen: (open: boolean) => void
  isSignupModalOpen: boolean
  setIsSignupModalOpen: (open: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Storage keys
const AUTH_TOKEN_KEY = "authToken"
const AUTH_USER_KEY = "authUser"

// Helper functions for localStorage
const getStoredSession = (): { user: User | null; token: string | null } => {
  if (typeof window === "undefined") return { user: null, token: null }
  
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const userJson = localStorage.getItem(AUTH_USER_KEY)
    const user = userJson ? JSON.parse(userJson) : null
    return { user, token }
  } catch (err) {
    console.error("Error reading stored session:", err)
    return { user: null, token: null }
  }
}

const clearStoredSession = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  }
}

const storeSession = (user: User, token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  // Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = () => {
      const { user: storedUser, token } = getStoredSession()
      
      if (storedUser && token) {
        setUser(storedUser)
      }
      
      setIsHydrated(true)
      setIsLoading(false)
    }

    restoreSession()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const { user: userData, token } = await response.json()
      
      // Store both user data and token in localStorage
      storeSession(userData, token)
      setUser(userData)
      setIsLoginModalOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(apiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Signup failed")
      }

      const { user: userData, token } = await response.json()
      
      // Store both user data and token in localStorage
      storeSession(userData, token)
      setUser(userData)
      setIsSignupModalOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      if (token) {
        try {
          await fetch(apiUrl("/api/auth/logout"), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        } catch (err) {
          // Logout endpoint error doesn't prevent local logout
          console.error("Logout endpoint error:", err)
        }
      }
    } finally {
      clearStoredSession()
      setUser(null)
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  // Don't render children until hydration is complete, but still wrap with provider
  return (
    <AuthContext.Provider
      value={{
        user: isHydrated ? user : null,
        isLoading,
        isAuthenticated: isHydrated ? !!user : false,
        isAdmin: isHydrated ? (user?.isAdmin ?? false) : false,
        login,
        signup,
        logout,
        error,
        clearError,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isSignupModalOpen,
        setIsSignupModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
