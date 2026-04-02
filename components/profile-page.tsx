"use client"

import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/contexts/orders-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Z_INDEX } from "@/lib/z-index"

interface ProfilePageProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfilePage({ isOpen, onClose }: ProfilePageProps) {
  const { user } = useAuth()
  const { getUserOrders, getOrderStats } = useOrders()

  if (!isOpen || !user) return null

  const userOrders = getUserOrders(user.id)
  const stats = getOrderStats(user.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-purple-100 text-purple-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-green-200 text-green-900"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40"
        onClick={onClose}
        style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      />

      {/* Profile Panel */}
      <div 
        className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-card shadow-2xl overflow-y-auto" 
        style={{ zIndex: Z_INDEX.MODAL }}
      >  {/* Header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">My Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${user.email}`}
                  alt={user.name}
                />
                <AvatarFallback className="text-lg font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {user.name}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-background border-border">
              <p className="text-xs text-muted-foreground font-medium uppercase">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats.totalOrders}
              </p>
            </Card>
            <Card className="p-4 bg-background border-border">
              <p className="text-xs text-muted-foreground font-medium uppercase">
                Total Spent
              </p>
              <p className="text-xl font-bold text-accent mt-1">
                ₹{stats.totalSpent.toFixed(2)}
              </p>
            </Card>
          </div>

          {/* Order History */}
          <div className="space-y-3">
            <h4 className="font-bold text-foreground">Order History</h4>
            {userOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start placing orders to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="p-4 bg-background border-border hover:border-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Order {order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs mb-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-muted-foreground"
                        >
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-border space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">₹{order.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax:</span>
                        <span className="font-medium">₹{order.tax.toFixed(2)}</span>
                      </div>
                      {order.deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery:</span>
                          <span className="font-medium">₹{order.deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-border font-bold">
                        <span>Total:</span>
                        <span className="text-accent">₹{order.finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {order.orderType === "pickup" ? "Pickup" : "Delivery"}
                      </p>
                      {order.address && (
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {order.address}, {order.city}, {order.state}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
