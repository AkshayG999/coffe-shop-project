"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

export function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const { signup, isLoading, error, clearError } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    
    if (password !== confirmPassword) {
      setLocalError("Passwords don't match")
      return
    }

    try {
      await signup(name, email, password)
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      onClose()
    } catch (err) {
      // Error is handled by context
    }
  }

  const handleClose = () => {
    clearError()
    setLocalError(null)
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    onClose()
  }

  const displayError = localError || error

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-foreground">
            Join Us
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {displayError && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{displayError}</span>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-foreground">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                handleClose()
                onLoginClick()
              }}
              className="text-primary hover:underline font-medium"
            >
              Sign In
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
