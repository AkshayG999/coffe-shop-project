"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Coffee, ShoppingBag, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useModals } from "@/contexts/modals-context"
import { useScroll } from "@/contexts/scroll-context"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { Z_INDEX } from "@/lib/z-index"

const navLinks = [
  { label: "Home", target: "home" as const },
  { label: "About", target: "about" as const },
  { label: "Menu", target: "menu" as const },
  { label: "Contact", target: "contact" as const },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { totalItems, setIsCartOpen } = useCart()
  const { user, logout, isAuthenticated, isAdmin, isLoginModalOpen, setIsLoginModalOpen, isSignupModalOpen, setIsSignupModalOpen } = useAuth()
  const { openModal } = useModals()
  const { scrollToSection } = useScroll()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="h-8 w-8 text-accent" />
            <span className="font-serif text-xl lg:text-2xl font-bold tracking-tight text-foreground">
              BREW & CO.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => scrollToSection(link.target)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Cart & CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-muted rounded-full transition-colors text-foreground"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            {isAuthenticated && user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors uppercase tracking-wide flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => openModal('profile')}
                  className="p-2 hover:bg-muted rounded-full transition-colors text-foreground"
                  aria-label="Open profile"
                  title="View Profile"
                >
                  <User className="h-5 w-5" />
                </button>
                <span className="text-sm text-muted-foreground">
                  {user.name}
                </span>
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  className="border-border hover:bg-muted text-black hover:text-black"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsLoginModalOpen(true)}
                  variant="outline"
                  className="border-border hover:bg-muted text-black hover:text-black"
                  size="sm"
                >
                  Login
                </Button>
              </>
            )}
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="#menu">Order Now</Link>
            </Button>
          </div>

          {/* Mobile Cart & Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-muted rounded-full transition-colors text-foreground"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              className="p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.target}
                  onClick={() => {
                    scrollToSection(link.target)
                    setIsOpen(false)
                  }}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide text-left"
                >
                  {link.label}
                </button>
              ))}
              {isAuthenticated && user ? (
                <>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="text-base font-medium text-accent hover:text-accent/80 transition-colors uppercase tracking-wide flex items-center gap-2 mb-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">
                      Logged in as: <span className="text-foreground font-medium">{user.name}</span>
                    </p>
                    <Button
                      onClick={() => {
                        openModal('profile')
                        setIsOpen(false)
                      }}
                      variant="outline"
                      className="w-full border-border hover:bg-muted text-foreground mb-2"
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Button>
                    <Button
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      variant="outline"
                      className="w-full border-border hover:bg-muted text-foreground"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="pt-2 border-t border-border flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      setIsLoginModalOpen(true)
                      setIsOpen(false)
                    }}
                    variant="outline"
                    className="w-full border-border hover:bg-muted text-foreground"
                  >
                    Login
                  </Button>
                </div>
              )}
              <Button
                asChild
                className="w-full mt-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setIsOpen(false)}
              >
                <Link href="#menu">
                  Order Now
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignupClick={() => {
          setIsLoginModalOpen(false)
          setIsSignupModalOpen(true)
        }}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onLoginClick={() => {
          setIsSignupModalOpen(false)
          setIsLoginModalOpen(true)
        }}
      />
    </header>
  )
}
