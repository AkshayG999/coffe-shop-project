"use client"

import { useEffect, useState } from "react"
import { Trash2, Edit2, Eye, EyeOff, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MenuItem } from "@/lib/types/menu"
import { apiUrl } from "@/lib/api-client"
import { AddMenuItemModal } from "./add-menu-item-modal"

interface MenuManagementPageProps {
  isAdmin?: boolean
}

export function MenuManagementPage({ isAdmin = false }: MenuManagementPageProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<MenuItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchMenuItems = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(apiUrl("/api/menu?category=all&includeUnavailable=true"))
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
            isAvailable: item.isAvailable !== false,
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
    const item = menuItems.find((entry) => entry.id === itemId)
    if (!item) {
      return
    }

    setError(null)

    try {
      const response = await fetch(apiUrl(`/api/menu/${itemId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || "Failed to update item availability")
        return
      }

      setMenuItems((prev) =>
        prev.map((entry) =>
          entry.id === itemId
            ? { ...entry, isAvailable: result.data?.isAvailable ?? !entry.isAvailable }
            : entry
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleDeleteItem = async () => {
    if (!deleteConfirm) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(apiUrl(`/api/menu/${deleteConfirm.id}`), {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || "Failed to delete menu item")
        return
      }

      setMenuItems((prev) => prev.filter((entry) => entry.id !== deleteConfirm.id))
      setDeleteConfirm(null)
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && menuItems.length === 0 && !error && (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-4">No menu items found</p>
          <AddMenuItemModal isAdmin={isAdmin} onSuccess={fetchMenuItems} />
        </div>
      )}

      {!isLoading && menuItems.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
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
                    <div className="flex items-center">
                      <AddMenuItemModal
                        isAdmin={isAdmin}
                        mode="edit"
                        item={item}
                        onSuccess={fetchMenuItems}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Dialog
                        open={deleteConfirm?.id === item.id}
                        onOpenChange={(open) => setDeleteConfirm(open ? item : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Menu Item</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{item.name}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteItem}
                              disabled={isDeleting}
                            >
                              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && menuItems.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold">{menuItems.length}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold">
              {menuItems.filter((item) => item.isAvailable).length}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Hidden</p>
            <p className="text-2xl font-bold">
              {menuItems.filter((item) => !item.isAvailable).length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
