/**
 * Orders API Route - POST /api/orders
 * Handles order creation with customer, order items, and delivery address
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

interface OrderRequest {
    customer: {
        firstName: string
        lastName: string
        email: string
        phone: string
    }
    orderType: 'pickup' | 'delivery'
    paymentMethod: 'cod' | 'upi' | 'netbanking' | 'card'
    items: Array<{
        id: number
        quantity: number
        price: number
    }>
    subtotal: number
    tax: number
    deliveryFee: number
    total: number
    specialInstructions?: string
    deliveryAddress?: {
        address: string
        city: string
        state: string
        pinCode: string
    }
}

interface OrderResponse {
    success: boolean
    orderId?: number
    message: string
}

export async function POST(request: NextRequest): Promise<NextResponse<OrderResponse>> {
    try {
        const body: OrderRequest = await request.json()

        // Validate required fields
        if (!body.customer || !body.items || body.items.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Invalid order data' },
                { status: 400 }
            )
        }

        const {
            customer,
            orderType,
            paymentMethod,
            items,
            subtotal,
            tax,
            deliveryFee,
            total,
            specialInstructions,
            deliveryAddress,
        } = body

        // Validate customer data
        if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
            return NextResponse.json(
                { success: false, message: 'Missing customer information' },
                { status: 400 }
            )
        }

        // Validate delivery address if delivery order
        if (orderType === 'delivery' && !deliveryAddress) {
            return NextResponse.json(
                { success: false, message: 'Delivery address required for delivery orders' },
                { status: 400 }
            )
        }

        const db = getDatabase()

        try {
            // Begin transaction
            const transaction = db.transaction((data: {
                customer: typeof customer
                items: typeof items
                deliveryAddress?: typeof deliveryAddress
                orderType: typeof orderType
                paymentMethod: typeof paymentMethod
                subtotal: typeof subtotal
                tax: typeof tax
                deliveryFee: typeof deliveryFee
                total: typeof total
                specialInstructions?: typeof specialInstructions
            }) => {
                // Get or create customer
                const findCustomerStmt = db.prepare('SELECT id FROM customers WHERE email = ?')
                let existingCustomer = findCustomerStmt.get(data.customer.email) as { id: number } | undefined

                let customerId: number

                if (existingCustomer) {
                    customerId = existingCustomer.id
                    // Update customer info
                    const updateStmt = db.prepare(
                        'UPDATE customers SET first_name = ?, last_name = ?, phone = ? WHERE id = ?'
                    )
                    updateStmt.run(data.customer.firstName, data.customer.lastName, data.customer.phone, customerId)
                } else {
                    // Create new customer
                    const insertCustomerStmt = db.prepare(
                        'INSERT INTO customers (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)'
                    )
                    const result = insertCustomerStmt.run(
                        data.customer.firstName,
                        data.customer.lastName,
                        data.customer.email,
                        data.customer.phone
                    )
                    customerId = Number(result.lastInsertRowid)
                }

                // Create order
                const insertOrderStmt = db.prepare(
                    `INSERT INTO orders (customer_id, order_type, payment_method, subtotal, tax, delivery_fee, total, special_instructions, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
                )
                const orderResult = insertOrderStmt.run(
                    customerId,
                    data.orderType,
                    data.paymentMethod,
                    data.subtotal,
                    data.tax,
                    data.deliveryFee,
                    data.total,
                    data.specialInstructions || '',
                    'confirmed'
                )
                const orderId = Number(orderResult.lastInsertRowid)

                // Create order items
                const insertOrderItemStmt = db.prepare(
                    'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)'
                )
                for (const item of data.items) {
                    insertOrderItemStmt.run(orderId, item.id, item.quantity, item.price)
                }

                // Create delivery address if needed
                if (data.orderType === 'delivery' && data.deliveryAddress) {
                    const insertAddressStmt = db.prepare(
                        'INSERT INTO delivery_addresses (order_id, address, city, state, pin_code) VALUES (?, ?, ?, ?, ?)'
                    )
                    insertAddressStmt.run(
                        orderId,
                        data.deliveryAddress.address,
                        data.deliveryAddress.city,
                        data.deliveryAddress.state,
                        data.deliveryAddress.pinCode
                    )
                }

                return orderId
            })

            const orderId = transaction({
                customer,
                items,
                deliveryAddress,
                orderType,
                paymentMethod,
                subtotal,
                tax,
                deliveryFee,
                total,
                specialInstructions,
            })

            return NextResponse.json(
                {
                    success: true,
                    orderId,
                    message: 'Order placed successfully',
                },
                { status: 201 }
            )
        } catch (dbError) {
            console.error('Database error:', dbError)
            return NextResponse.json(
                {
                    success: false,
                    message: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Order creation error:', error)
        return NextResponse.json(
            {
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
            { status: 500 }
        )
    }
}
