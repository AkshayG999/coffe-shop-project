"use client"

import { useState } from "react"
import { X, CreditCard, MapPin, User, Phone, Mail, Check, Banknote, Smartphone, Building2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/contexts/orders-context"
import { cn } from "@/lib/utils"

type OrderType = "pickup" | "delivery"
type PaymentMethod = "cod" | "upi" | "netbanking" | "card"

export function CheckoutModal() {
  const {
    items,
    totalPrice,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
  } = useCart()
  
  const { isAuthenticated, user, setIsLoginModalOpen } = useAuth()
  const { addOrder } = useOrders()

  const [orderType, setOrderType] = useState<OrderType>("pickup")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    upiId: "",
    bankName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    specialInstructions: "",
  })

  if (!isCheckoutOpen) return null

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-foreground/40 z-50"
          onClick={() => setIsCheckoutOpen(false)}
        />

        {/* Modal */}
        <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card z-50 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-serif text-xl font-semibold text-foreground">Checkout</h2>
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors text-foreground"
              aria-label="Close checkout"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
              <LogIn className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground text-lg">Authentication Required</h3>
            <p className="text-muted-foreground text-sm">
              Please log in to your account to proceed with checkout and track your orders.
            </p>

            <div className="pt-4 space-y-3 w-full">
              <Button
                onClick={() => {
                  setIsCheckoutOpen(false)
                  setIsLoginModalOpen(true)
                }}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                Close & Login
              </Button>
              <Button
                onClick={() => setIsCheckoutOpen(false)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const tax = totalPrice * 0.18
  const deliveryFee = orderType === "delivery" ? 49 : 0
  const finalTotal = totalPrice + tax + deliveryFee

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const tax = totalPrice * 0.18
      const deliveryFee = orderType === "delivery" ? 49 : 0
      const finalTotal = totalPrice + tax + deliveryFee

      // Prepare order data
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        orderType,
        paymentMethod,
        items: items.map(item => ({
          id: parseInt(item.id),
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: Math.round(totalPrice * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        deliveryFee,
        total: Math.round(finalTotal * 100) / 100,
        specialInstructions: formData.specialInstructions,
        ...(orderType === "delivery" && {
          deliveryAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pinCode: formData.zipCode,
          }
        })
      }

      // Send to Next.js API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to place order')
      }

      // Save order to context
      if (isAuthenticated && user) {
        addOrder({
          userId: user.id,
          orderType,
          items: items.map(item => ({
            ...item,
            price: item.price,
          })),
          totalPrice,
          tax: Math.round(totalPrice * 0.18 * 100) / 100,
          deliveryFee: orderType === "delivery" ? 49 : 0,
          finalTotal: Math.round((totalPrice + (totalPrice * 0.18) + (orderType === "delivery" ? 49 : 0)) * 100) / 100,
          paymentMethod,
          customerName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          specialInstructions: formData.specialInstructions,
          status: "confirmed",
        })
      }

      setIsSubmitting(false)
      setIsSuccess(true)

      // Reset after showing success
      setTimeout(() => {
        clearCart()
        setIsSuccess(false)
        setIsCheckoutOpen(false)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          upiId: "",
          bankName: "",
          cardNumber: "",
          expiry: "",
          cvv: "",
          specialInstructions: "",
        })
      }, 3000)
    } catch (error) {
      console.error('Order submission error:', error)
      alert(error instanceof Error ? error.message : 'Failed to place order')
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <>
        <div
          className="fixed inset-0 bg-foreground/40 z-50"
          onClick={() => setIsCheckoutOpen(false)}
        />
        <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card z-50 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h2>
          <p className="text-muted-foreground text-center">
            Thank you for your order. {orderType === "pickup" 
              ? "Your coffee will be ready for pickup in 10-15 minutes."
              : "Your order will be delivered in 30-45 minutes."}
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/40 z-50"
        onClick={() => setIsCheckoutOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-card z-50 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Checkout
          </h2>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 hover:bg-muted rounded-full transition-colors text-foreground"
            aria-label="Close checkout"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Order Type */}
          <div className="mb-6">
            <Label className="text-foreground font-medium mb-3 block">Order Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType("pickup")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  orderType === "pickup"
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                }`}
              >
                <MapPin className={`h-5 w-5 mx-auto mb-2 ${
                  orderType === "pickup" ? "text-accent" : "text-muted-foreground"
                }`} />
                <span className={`text-sm font-medium ${
                  orderType === "pickup" ? "text-foreground" : "text-muted-foreground"
                }`}>
                  Pickup
                </span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  orderType === "delivery"
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                }`}
              >
                <CreditCard className={`h-5 w-5 mx-auto mb-2 ${
                  orderType === "delivery" ? "text-accent" : "text-muted-foreground"
                }`} />
                <span className={`text-sm font-medium ${
                  orderType === "delivery" ? "text-foreground" : "text-muted-foreground"
                }`}>
                  Delivery (+₹49)
                </span>
              </button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-accent" />
              <h3 className="font-medium text-foreground">Personal Information</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-muted-foreground">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-muted-foreground">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="text-muted-foreground">Phone</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {orderType === "delivery" && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-accent" />
                <h3 className="font-medium text-foreground">Delivery Address</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address" className="text-muted-foreground">Street Address / Locality</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required={orderType === "delivery"}
                    className="mt-1"
                    placeholder="House No, Building, Street, Area"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-muted-foreground">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required={orderType === "delivery"}
                      className="mt-1"
                      placeholder="New Delhi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-muted-foreground">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required={orderType === "delivery"}
                      className="mt-1"
                      placeholder="Delhi"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-muted-foreground">PIN Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required={orderType === "delivery"}
                    className="mt-1"
                    placeholder="110001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-accent" />
              <h3 className="font-medium text-foreground">Payment Method</h3>
            </div>
            
            {/* Payment Options */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                  paymentMethod === "cod"
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                )}
              >
                <Banknote className={cn(
                  "h-5 w-5",
                  paymentMethod === "cod" ? "text-accent" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  paymentMethod === "cod" ? "text-foreground" : "text-muted-foreground"
                )}>
                  Cash on Delivery
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                  paymentMethod === "upi"
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                )}
              >
                <Smartphone className={cn(
                  "h-5 w-5",
                  paymentMethod === "upi" ? "text-accent" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  paymentMethod === "upi" ? "text-foreground" : "text-muted-foreground"
                )}>
                  UPI Payment
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod("netbanking")}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                  paymentMethod === "netbanking"
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                )}
              >
                <Building2 className={cn(
                  "h-5 w-5",
                  paymentMethod === "netbanking" ? "text-accent" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  paymentMethod === "netbanking" ? "text-foreground" : "text-muted-foreground"
                )}>
                  Net Banking
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                  paymentMethod === "card"
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                )}
              >
                <CreditCard className={cn(
                  "h-5 w-5",
                  paymentMethod === "card" ? "text-accent" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  paymentMethod === "card" ? "text-foreground" : "text-muted-foreground"
                )}>
                  Credit/Debit Card
                </span>
              </button>
            </div>

            {/* Payment Details based on selected method */}
            <div className="space-y-4">
              {paymentMethod === "cod" && (
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Pay with cash when your order is delivered. Please keep exact change ready.
                  </p>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div>
                  <Label htmlFor="upiId" className="text-muted-foreground">UPI ID</Label>
                  <Input
                    id="upiId"
                    name="upiId"
                    placeholder="yourname@upi or 9876543210@paytm"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    required={paymentMethod === "upi"}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported: GPay, PhonePe, Paytm, BHIM, and all UPI apps
                  </p>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div>
                  <Label htmlFor="bankName" className="text-muted-foreground">Select Bank</Label>
                  <select
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    required={paymentMethod === "netbanking"}
                    className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select your bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                    <option value="pnb">Punjab National Bank</option>
                    <option value="bob">Bank of Baroda</option>
                    <option value="yes">Yes Bank</option>
                    <option value="idbi">IDBI Bank</option>
                    <option value="other">Other Banks</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">
                    You will be redirected to your bank&apos;s secure payment page
                  </p>
                </div>
              )}

              {paymentMethod === "card" && (
                <>
                  <div>
                    <Label htmlFor="cardNumber" className="text-muted-foreground">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required={paymentMethod === "card"}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-muted-foreground">Expiry Date</Label>
                      <Input
                        id="expiry"
                        name="expiry"
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        required={paymentMethod === "card"}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-muted-foreground">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required={paymentMethod === "card"}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We accept Visa, Mastercard, Rupay, and American Express
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="mb-6">
            <Label htmlFor="specialInstructions" className="text-muted-foreground">
              Special Instructions (Optional)
            </Label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any special requests for your order..."
              className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-secondary rounded-lg p-4 mb-6">
            <h3 className="font-medium text-foreground mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-muted-foreground">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (18%)</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-foreground text-base pt-2 border-t border-border mt-2">
                  <span>Total</span>
                  <span className="text-accent">₹{finalTotal.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Place Order - ₹${finalTotal.toFixed(0)}`
            )}
          </Button>
        </form>
      </div>
    </>
  )
}
