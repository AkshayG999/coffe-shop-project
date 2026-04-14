"use client"

import { useEffect, useState } from "react"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import { CreateMenuItemDTO, MENU_CATEGORIES, MenuItem } from "@/lib/types/menu"
import { apiUrl } from "@/lib/api-client"

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
  mode?: "create" | "edit"
  item?: MenuItem
  trigger?: React.ReactNode
}

const defaultFormData: CreateMenuItemDTO = {
  name: "",
  description: "",
  price: 0,
  category: "Espresso",
  imageUrl: "",
}

function getFormDataFromItem(item?: MenuItem): CreateMenuItemDTO {
  if (!item) {
    return defaultFormData
  }

  return {
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    imageUrl: item.image,
  }
}

export function AddMenuItemModal({
  onSuccess,
  isAdmin = false,
  mode = "create",
  item,
  trigger,
}: AddMenuItemModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateMenuItemDTO>(getFormDataFromItem(item))

  useEffect(() => {
    if (open) {
      setFormData(getFormDataFromItem(item))
      setErrors({})
      setSuccessMessage(null)
    }
  }, [item, open])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }))

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
      const response = await fetch(apiUrl(mode === "edit" && item ? `/api/menu/${item.id}` : "/api/menu"), {
        method: mode === "edit" ? "PUT" : "POST",
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
          setErrors({
            general: result.message || (mode === "edit" ? "Failed to update menu item" : "Failed to add menu item"),
          })
        }
      } else {
        setSuccessMessage(
          mode === "edit"
            ? `${result.data.name} updated successfully!`
            : `${result.data.name} added successfully!`
        )
        setErrors({})

        if (mode === "create") {
          setFormData(defaultFormData)
        }

        setTimeout(() => {
          setOpen(false)
          onSuccess?.()
        }, 1200)
      }
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : `An error occurred while ${mode === "edit" ? "updating" : "adding"} the menu item`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  const title = mode === "edit" ? "Edit Menu Item" : "Add New Menu Item"
  const description =
    mode === "edit"
      ? "Update the details for this menu item"
      : "Fill in the details to add a new item to your menu"
  const submitLabel = mode === "edit" ? "Save Changes" : "Add Item"
  const submitLoadingLabel = mode === "edit" ? "Saving..." : "Adding..."

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Menu Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

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
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

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
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>

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
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>
          </div>

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
            {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl}</p>}

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
              {isLoading ? submitLoadingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
