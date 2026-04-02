/**
 * Menu Item Types and Interfaces
 * Defines contracts for menu operations following SOLID principles
 */

export type MenuCategory = 'Espresso' | 'Brewed' | 'Specialty' | 'Cold'

export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: MenuCategory
  image: string
  isAvailable: boolean
  createdAt?: string
}

export interface CreateMenuItemDTO {
  name: string
  description: string
  price: number
  category: MenuCategory
  imageUrl: string
}

export interface MenuItemResponse {
  success: boolean
  data?: MenuItem
  items?: MenuItem[]
  message: string
  errors?: Record<string, string[]>
}

export interface IMenuItemValidator {
  validate(dto: CreateMenuItemDTO): ValidationResult
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
}

export const MENU_CATEGORIES: MenuCategory[] = ['Espresso', 'Brewed', 'Specialty', 'Cold']

// Validation constraints
export const MENU_ITEM_CONSTRAINTS = {
  name: { minLength: 3, maxLength: 100 },
  description: { minLength: 10, maxLength: 500 },
  price: { min: 10, max: 10000 },
  imageUrl: { maxLength: 500 },
} as const
