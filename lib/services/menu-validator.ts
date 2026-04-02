/**
 * Menu Item Validation Service
 * Implements single responsibility principle for input validation
 */

import { CreateMenuItemDTO, IMenuItemValidator, ValidationResult, MENU_ITEM_CONSTRAINTS, MENU_CATEGORIES } from '../types/menu'

export class MenuItemValidator implements IMenuItemValidator {
  /**
   * Validates a CreateMenuItemDTO object
   * Returns validation errors if any field is invalid
   */
  validate(dto: CreateMenuItemDTO): ValidationResult {
    const errors: Record<string, string[]> = {}

    // Validate name
    if (!dto.name || typeof dto.name !== 'string') {
      errors.name = ['Name is required']
    } else if (dto.name.trim().length < MENU_ITEM_CONSTRAINTS.name.minLength) {
      errors.name = [`Name must be at least ${MENU_ITEM_CONSTRAINTS.name.minLength} characters`]
    } else if (dto.name.length > MENU_ITEM_CONSTRAINTS.name.maxLength) {
      errors.name = [`Name must not exceed ${MENU_ITEM_CONSTRAINTS.name.maxLength} characters`]
    }

    // Validate description
    if (!dto.description || typeof dto.description !== 'string') {
      errors.description = ['Description is required']
    } else if (dto.description.trim().length < MENU_ITEM_CONSTRAINTS.description.minLength) {
      errors.description = [`Description must be at least ${MENU_ITEM_CONSTRAINTS.description.minLength} characters`]
    } else if (dto.description.length > MENU_ITEM_CONSTRAINTS.description.maxLength) {
      errors.description = [`Description must not exceed ${MENU_ITEM_CONSTRAINTS.description.maxLength} characters`]
    }

    // Validate price
    if (typeof dto.price !== 'number' || dto.price === null) {
      errors.price = ['Price is required and must be a number']
    } else if (dto.price < MENU_ITEM_CONSTRAINTS.price.min) {
      errors.price = [`Price must be at least ₹${MENU_ITEM_CONSTRAINTS.price.min}`]
    } else if (dto.price > MENU_ITEM_CONSTRAINTS.price.max) {
      errors.price = [`Price must not exceed ₹${MENU_ITEM_CONSTRAINTS.price.max}`]
    }

    // Validate category
    if (!dto.category || !MENU_CATEGORIES.includes(dto.category)) {
      errors.category = [`Category must be one of: ${MENU_CATEGORIES.join(', ')}`]
    }

    // Validate imageUrl
    if (!dto.imageUrl || typeof dto.imageUrl !== 'string') {
      errors.imageUrl = ['Image URL is required']
    } else if (dto.imageUrl.length > MENU_ITEM_CONSTRAINTS.imageUrl.maxLength) {
      errors.imageUrl = ['Image URL is too long']
    } else if (!this.isValidUrl(dto.imageUrl)) {
      errors.imageUrl = ['Image URL must be a valid URL']
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  /**
   * Helper method to validate URL format
   */
  private isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }
}
