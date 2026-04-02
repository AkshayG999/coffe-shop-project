import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { MenuItemRepository } from '@/lib/services/menu-repository'
import { MenuItemValidator } from '@/lib/services/menu-validator'
import { CreateMenuItemDTO, MenuItemResponse } from '@/lib/types/menu'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function parseId(idParam: string): number | null {
  const id = Number.parseInt(idParam, 10)
  return Number.isNaN(id) || id <= 0 ? null : id
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<MenuItemResponse>> {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid menu item ID',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const db = getDatabase()
    const repository = new MenuItemRepository(db)
    const existingItem = repository.getById(id)

    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          message: 'Menu item not found',
        },
        { status: 404 }
      )
    }

    if (body.isAvailable !== undefined && Object.keys(body).length === 1) {
      const success = repository.update(id, { isAvailable: Boolean(body.isAvailable) })

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
          data: repository.getById(id) || undefined,
          message: 'Menu item availability updated successfully',
        },
        { status: 200 }
      )
    }

    const candidate: CreateMenuItemDTO = {
      name: body.name ?? existingItem.name,
      description: body.description ?? existingItem.description,
      price: body.price ?? existingItem.price,
      category: body.category ?? existingItem.category,
      imageUrl: body.imageUrl ?? body.image ?? existingItem.image,
    }

    const validator = new MenuItemValidator()
    const validationResult = validator.validate(candidate)

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

    const success = repository.update(id, {
      ...candidate,
      isAvailable:
        body.isAvailable !== undefined ? Boolean(body.isAvailable) : existingItem.isAvailable,
    })

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
        data: repository.getById(id) || undefined,
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

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<MenuItemResponse>> {
  try {
    const { id: idParam } = await context.params
    const id = parseId(idParam)

    if (!id) {
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
