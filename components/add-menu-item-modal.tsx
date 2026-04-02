"use client"

import { useState } from "react"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import { CreateMenuItemDTO, MENU_CATEGORIES } from "@/lib/types/menu"

interface FormErrors {
  name?: string
  description?: string
  price?: string
  category?: string
  imageUrl?: string
  general?: string
}

interface AddMenuItemModalProps {
  onSuccess?: () => void
  isAdmin?: boolean
}

/**
 * Modal component for adding new menu items
 * Implements proper form validation and error handling
 * 
 * Features:
 * - Form validation with real-time error display
 * - Category selection dropdown
 * - Image URL preview
 * - Loading state during submission
 * - Success/error notifications
 */
export function AddMenuItemModal({ onSuccess, isAdmin = false }: AddMenuItemModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateMenuItemDTO>({
    name: "",
    description: "",
    price: 0,
    category: "Espresso",
    imageUrl: "",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value as typeof formData.category,
    }))
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters"
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must not exceed 100 characters"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters"
    }

    if (!formData.price || formData.price < 10) {
      newErrors.price = "Price must be at least ₹10"
    } else if (formData.price > 10000) {
      newErrors.price = "Price must not exceed ₹10,000"
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = "Image URL is required"
    } else {
      try {
        new URL(formData.imageUrl)
      } catch {
        newErrors.imageUrl = "Please enter a valid URL"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.errors) {
          const fieldErrors: FormErrors = {}
          for (const [field, messages] of Object.entries(result.errors)) {
            fieldErrors[field as keyof FormErrors] = (messages as string[])[0]
          }
          setErrors(fieldErrors)
        } else {
          setErrors({ general: result.message || "Failed to add menu item" })
        }
      } else {
        setSuccessMessage(`${result.data.name} added successfully!`)
        setFormData({
          name: "",
          description: "",
          price: 0,
          category: "Espresso",
          imageUrl: "",
        })
        setErrors({})

        // Close modal after 2 seconds
        setTimeout(() => {
          setOpen(false)
          onSuccess?.()
        }, 2000)
      }
    } catch (error) {
      setErrors({
        general:
          error instanceof Error ? error.message : "An error occurred while adding the menu item",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Menu Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new item to your menu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                ✓ {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Caramel Macchiato"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your menu item..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Price Field */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="10"
                max="10000"
                step="10"
                placeholder="299"
                value={formData.price || ""}
                onChange={handleInputChange}
                disabled={isLoading}
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            {/* Category Field */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {MENU_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Image URL Field */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL *</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={handleInputChange}
              disabled={isLoading}
              className={errors.imageUrl ? "border-red-500" : ""}
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-500">{errors.imageUrl}</p>
            )}

            {/* Image Preview */}
            {formData.imageUrl && !errors.imageUrl && (
              <div className="mt-2 border rounded overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="h-32 w-full object-cover"
                  onError={() =>
                    setErrors((prev) => ({
                      ...prev,
                      imageUrl: "Unable to load image from URL",
                    }))
                  }
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
