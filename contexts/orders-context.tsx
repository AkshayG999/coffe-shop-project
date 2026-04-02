"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { CartItem } from "./cart-context"

export type Order = {
  id: string
  userId: string
  orderType: "pickup" | "delivery"
  items: CartItem[]
  totalPrice: number
  tax: number
  deliveryFee: number
  finalTotal: number
  paymentMethod: string
  customerName: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  specialInstructions?: string
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed"
  createdAt: Date
}

type OrdersContextType = {
  orders: Order[]
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void
  getUserOrders: (userId: string) => Order[]
  getOrderStats: (userId: string) => { totalOrders: number; totalSpent: number; lastOrder: Order | null }
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])

  const addOrder = (order: Omit<Order, "id" | "createdAt">) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date(),
    }
    setOrders((prev) => [newOrder, ...prev])
  }

  const getUserOrders = (userId: string) => {
    return orders.filter((order) => order.userId === userId)
  }

  const getOrderStats = (userId: string) => {
    const userOrders = getUserOrders(userId)
    const totalSpent = userOrders.reduce((sum, order) => sum + order.finalTotal, 0)
    const lastOrder = userOrders[0] || null

    return {
      totalOrders: userOrders.length,
      totalSpent,
      lastOrder,
    }
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        getUserOrders,
        getOrderStats,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider")
  }
  return context
}
