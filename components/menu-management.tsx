"use client"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Eye, EyeOff, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MenuItem } from "@/lib/types/menu"
import { AddMenuItemModal } from "./add-menu-item-modal"

interface MenuManagementPageProps {
  isAdmin?: boolean
}

/**
 * Admin Menu Management Component
 * Allows viewing, editing, and deleting menu items
 * 
 * Responsibilities:
 * - Display all menu items in a table
 * - Handle item deletion with confirmation
 * - Toggle item availability
 * - Refresh menu list
 * - Error handling and loading states
 */
export function MenuManagementPage({ isAdmin = false }: MenuManagementPageProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchMenuItems = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/menu?category=all")
      const data = await response.json()

      if (data.success) {
        setMenuItems(
          data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image: item.image,
            isAvailable: item.is_available !== false,
          }))
        )
      } else {
        setError(data.message || "Failed to load menu items")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const handleToggleAvailability = async (itemId: number) => {
    try {
      const item = menuItems.find((i) => i.id === itemId)
      if (!item) return

      const response = await fetch(`/api/menu/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      })

      if (response.ok) {
        setMenuItems((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
          )
        )
      } else {
        setError("Failed to update item availability")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleDeleteItem = async () => {
    if (deleteConfirm === null) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/menu/${deleteConfirm}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMenuItems((prev) => prev.filter((i) => i.id !== deleteConfirm))
        setDeleteConfirm(null)
      } else {
        setError("Failed to delete menu item")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Menu Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your coffee shop menu items
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMenuItems}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <AddMenuItemModal isAdmin={isAdmin} onSuccess={fetchMenuItems} />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && menuItems.length === 0 && !error && (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-4">No menu items found</p>
          <AddMenuItemModal isAdmin={isAdmin} onSuccess={fetchMenuItems} />
        </div>
      )}

      {/* Menu Items Table */}
      {!isLoading && menuItems.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell>₹{item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAvailability(item.id)}
                      className="w-24"
                    >
                      {item.isAvailable ? (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Available
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Hidden
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Menu Item</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{item.name}"? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline">Cancel</Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setDeleteConfirm(item.id)
                              handleDeleteItem()
                            }}
                            disabled={isDeleting}
                          >
                            {isDeleting && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Stats */}
      {!isLoading && menuItems.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold">{menuItems.length}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold">
              {menuItems.filter((i) => i.isAvailable).length}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Hidden</p>
            <p className="text-2xl font-bold">
              {menuItems.filter((i) => !i.isAvailable).length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
