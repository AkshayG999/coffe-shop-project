/**
 * Menu Item Repository Service
 * Abstracts database operations following Repository pattern
 */

import Database from 'better-sqlite3'
import { MenuItem, CreateMenuItemDTO } from '@/lib/types/menu'

export interface IMenuItemRepository {
  create(item: CreateMenuItemDTO): MenuItem
  getById(id: number): MenuItem | null
  getAll(isAvailableOnly?: boolean): MenuItem[]
  getByCategory(category: string, isAvailableOnly?: boolean): MenuItem[]
  update(id: number, item: Partial<CreateMenuItemDTO>): boolean
  delete(id: number): boolean
  toggleAvailability(id: number): boolean
}

export class MenuItemRepository implements IMenuItemRepository {
  constructor(private db: Database.Database) {}

  /**
   * Creates a new menu item in the database
   */
  create(item: CreateMenuItemDTO): MenuItem {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO menu_items (name, description, price, category, image_url, is_available, created_at)
        VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      `)

      const result = stmt.run(item.name, item.description, item.price, item.category, item.imageUrl)

      return {
        id: result.lastInsertRowid as number,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category as any,
        image: item.imageUrl,
        isAvailable: true,
      }
    } catch (error) {
      throw new Error(`Failed to create menu item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Retrieves a menu item by ID
   */
  getById(id: number): MenuItem | null {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, description, price, category, image_url, is_available, created_at
        FROM menu_items
        WHERE id = ?
      `)

      const result = stmt.get(id) as any

      if (!result) return null

      return this.mapRowToMenuItem(result)
    } catch (error) {
      throw new Error(`Failed to retrieve menu item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Retrieves all menu items
   */
  getAll(isAvailableOnly = false): MenuItem[] {
    try {
      const query = isAvailableOnly
        ? `SELECT id, name, description, price, category, image_url, is_available, created_at FROM menu_items WHERE is_available = 1`
        : `SELECT id, name, description, price, category, image_url, is_available, created_at FROM menu_items`

      const stmt = this.db.prepare(query)
      const results = stmt.all() as any[]

      return results.map((row) => this.mapRowToMenuItem(row))
    } catch (error) {
      throw new Error(`Failed to retrieve menu items: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Retrieves menu items by category
   */
  getByCategory(category: string, isAvailableOnly = false): MenuItem[] {
    try {
      const query = isAvailableOnly
        ? `SELECT id, name, description, price, category, image_url, is_available, created_at FROM menu_items WHERE category = ? AND is_available = 1`
        : `SELECT id, name, description, price, category, image_url, is_available, created_at FROM menu_items WHERE category = ?`

      const stmt = this.db.prepare(query)
      const results = stmt.all(category) as any[]

      return results.map((row) => this.mapRowToMenuItem(row))
    } catch (error) {
      throw new Error(
        `Failed to retrieve menu items by category: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Updates a menu item
   */
  update(id: number, item: Partial<CreateMenuItemDTO>): boolean {
    try {
      const updates: string[] = []
      const values: any[] = []

      if (item.name !== undefined) {
        updates.push('name = ?')
        values.push(item.name)
      }
      if (item.description !== undefined) {
        updates.push('description = ?')
        values.push(item.description)
      }
      if (item.price !== undefined) {
        updates.push('price = ?')
        values.push(item.price)
      }
      if (item.category !== undefined) {
        updates.push('category = ?')
        values.push(item.category)
      }
      if (item.imageUrl !== undefined) {
        updates.push('image_url = ?')
        values.push(item.imageUrl)
      }

      if (updates.length === 0) return false

      values.push(id)

      const query = `UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`
      const stmt = this.db.prepare(query)
      const result = stmt.run(...values)

      return (result.changes as number) > 0
    } catch (error) {
      throw new Error(`Failed to update menu item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Deletes a menu item
   */
  delete(id: number): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM menu_items WHERE id = ?')
      const result = stmt.run(id)

      return (result.changes as number) > 0
    } catch (error) {
      throw new Error(`Failed to delete menu item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Toggles availability status of a menu item
   */
  toggleAvailability(id: number): boolean {
    try {
      const stmt = this.db.prepare(
        'UPDATE menu_items SET is_available = CASE WHEN is_available = 1 THEN 0 ELSE 1 END WHERE id = ?'
      )
      const result = stmt.run(id)

      return (result.changes as number) > 0
    } catch (error) {
      throw new Error(`Failed to toggle menu item availability: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Maps database row to MenuItem interface
   */
  private mapRowToMenuItem(row: any): MenuItem {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      category: row.category,
      image: row.image_url,
      isAvailable: row.is_available === 1,
      createdAt: row.created_at,
    }
  }
}
