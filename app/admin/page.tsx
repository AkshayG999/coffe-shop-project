"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { AlertCircle, ArrowLeft, LogIn } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MenuManagementPage } from "@/components/menu-management"

/**
 * Admin Dashboard Page
 * Restricted to authenticated admin users only
 */
export default function AdminPage() {
  const { user, isAuthenticated, isAdmin, isLoading, setIsLoginModalOpen } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show loading state
  if (!isMounted || isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </main>
    )
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <Button asChild variant="outline" className="mb-4 gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to access the admin panel.
            </AlertDescription>
          </Alert>
          <div className="bg-card border rounded-lg p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold">Admin Access Required</h1>
            <p className="text-muted-foreground">
              Please log in with your admin account to continue.
            </p>
            <Button 
              onClick={() => setIsLoginModalOpen(true)}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Login to Admin Panel
            </Button>
            <p className="text-sm text-muted-foreground">
              <strong>Demo Admin Credentials:</strong><br />
              Email: admin@gmail.com<br />
              Password: admin123
            </p>
          </div>
        </div>
      </main>
    )
  }

  // Authenticated but not admin - show access denied
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <Button asChild variant="outline" className="mb-4 gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access Denied: You do not have admin privileges.
            </AlertDescription>
          </Alert>
          <div className="bg-card border rounded-lg p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold">Admin Access Denied</h1>
            <p className="text-muted-foreground">
              Only administrators can access this panel. Your account ({user.name}) does not have admin permissions.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // User is authenticated and admin - show admin panel
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="outline" className="w-fit gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Logged in as: <span className="font-medium text-foreground">{user.name}</span> (Admin)
          </p>
        </div>
        <MenuManagementPage isAdmin={true} />
      </div>
    </main>
  )
}
