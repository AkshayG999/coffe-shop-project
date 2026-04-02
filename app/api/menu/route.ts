import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { MenuItemRepository } from '@/lib/services/menu-repository'
import { MenuItemValidator } from '@/lib/services/menu-validator'
import { CreateMenuItemDTO, MenuItemResponse } from '@/lib/types/menu'

/**
 * GET /api/menu
 * Retrieves menu items with optional category filter
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    const db = getDatabase()
    const repository = new MenuItemRepository(db)

    const items = category && category !== 'all' 
      ? repository.getByCategory(category, true)
      : repository.getAll(true)

    const formattedItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
    }))

    return NextResponse.json(
      {
        success: true,
        items: formattedItems,
        message: 'Menu items retrieved successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Menu API error:', error)
    return NextResponse.json(
      {
        success: false,
        items: [],
        message: `Error fetching menu: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/menu
 * Creates a new menu item (requires authentication)
 */
export async function POST(request: NextRequest): Promise<NextResponse<MenuItemResponse>> {
  try {
    const body: CreateMenuItemDTO = await request.json()

    // Validate input using validator service
    const validator = new MenuItemValidator()
    const validationResult = validator.validate(body)

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.errors,
        },
        { status: 400 }
      )
    }

    // Create menu item using repository
    const db = getDatabase()
    const repository = new MenuItemRepository(db)
    const newItem = repository.create(body)

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newItem.id,
          name: newItem.name,
          description: newItem.description,
          price: newItem.price,
          category: newItem.category,
          image: newItem.image,
          isAvailable: newItem.isAvailable,
        },
        message: 'Menu item created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Menu creation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: `Error creating menu item: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/menu/[id]
 * Updates an existing menu item
 */
export async function PUT(request: NextRequest): Promise<NextResponse<MenuItemResponse>> {
  try {
    const url = new URL(request.url)
    const id = parseInt(url.pathname.split('/').pop() || '0')

    if (!id || isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid menu item ID',
        },
        { status: 400 }
      )
    }

    const body: Partial<CreateMenuItemDTO> = await request.json()

    const db = getDatabase()
    const repository = new MenuItemRepository(db)

    const success = repository.update(id, body)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Menu item not found',
        },
        { status: 404 }
      )
    }

    const updatedItem = repository.getById(id)

    return NextResponse.json(
      {
        success: true,
        data: updatedItem || undefined,
        message: 'Menu item updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Menu update error:', error)
    return NextResponse.json(
      {
        success: false,
        message: `Error updating menu item: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/menu/[id]
 * Deletes a menu item
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<MenuItemResponse>> {
  try {
    const url = new URL(request.url)
    const id = parseInt(url.pathname.split('/').pop() || '0')

    if (!id || isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid menu item ID',
        },
        { status: 400 }
      )
    }

    const db = getDatabase()
    const repository = new MenuItemRepository(db)

    const success = repository.delete(id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Menu item not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Menu item deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Menu deletion error:', error)
    return NextResponse.json(
      {
        success: false,
        message: `Error deleting menu item: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    )
  }
}
