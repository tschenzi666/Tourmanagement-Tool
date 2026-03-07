"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  CreditCard,
  Banknote,
  ArrowLeft,
  Undo2,
} from "lucide-react"
import { createMerchSale, deleteMerchSale } from "@/lib/actions/merch-actions"
import { getMerchCategoryEmoji } from "@/lib/validations/merch"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  category: string
  price: number
  sizes: string | null
  stock: number | null
  isActive: boolean
}

interface TourDay {
  id: string
  date: string
  city: string | null
}

interface RecentSale {
  id: string
  productName: string
  quantity: number
  totalPrice: number
  size: string | null
  createdAt: string
}

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  size?: string
}

export function PosClient({
  products,
  tourId,
  tourDays,
  currentDayId,
  currencySymbol,
  recentSales: initialRecentSales,
}: {
  products: Product[]
  tourId: string
  tourDays: TourDay[]
  currentDayId?: string
  currencySymbol: string
  recentSales: RecentSale[]
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH")
  const [selectedDay, setSelectedDay] = useState(currentDayId || "")
  const [sizeSelecting, setSizeSelecting] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [recentSales, setRecentSales] = useState(initialRecentSales)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  function addToCart(product: Product, size?: string) {
    setSizeSelecting(null)
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.size === size
      )
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          size,
        },
      ]
    })
  }

  function removeFromCart(productId: string, size?: string) {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === productId && item.size === size
      )
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prev.filter(
        (item) => !(item.productId === productId && item.size === size)
      )
    })
  }

  function handleProductClick(product: Product) {
    if (product.sizes) {
      setSizeSelecting(product.id)
    } else {
      addToCart(product)
    }
  }

  function checkout() {
    if (cart.length === 0) return

    startTransition(async () => {
      try {
        const salePromises = cart.map((item) =>
          createMerchSale(tourId, {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
            size: item.size,
            paymentMethod,
            tourDayId: selectedDay || undefined,
          })
        )

        const results = await Promise.all(salePromises)

        // Add to recent sales display
        const newSales: RecentSale[] = cart.map((item, i) => ({
          id: results[i].id,
          productName: item.name,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          size: item.size || null,
          createdAt: new Date().toISOString(),
        }))
        setRecentSales((prev) => [...newSales, ...prev])

        setCart([])
        toast.success(`Sale completed: ${currencySymbol}${total.toFixed(2)}`)
      } catch {
        toast.error("Error processing sale")
      }
    })
  }

  function undoSale(saleId: string) {
    startTransition(async () => {
      try {
        await deleteMerchSale(tourId, saleId)
        setRecentSales((prev) => prev.filter((s) => s.id !== saleId))
        toast.success("Sale reversed")
      } catch {
        toast.error("Error reversing sale")
      }
    })
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Product Grid - Main Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Day Selector */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm bg-background"
          >
            <option value="">No day selected</option>
            {tourDays.map((day) => (
              <option key={day.id} value={day.id}>
                {new Date(day.date).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                })}
                {day.city ? ` - ${day.city}` : ""}
              </option>
            ))}
          </select>
          <div className="flex gap-2 ml-auto">
            <Button
              variant={paymentMethod === "CASH" ? "default" : "outline"}
              size="sm"
              onClick={() => setPaymentMethod("CASH")}
            >
              <Banknote className="mr-1 h-4 w-4" />
              Cash
            </Button>
            <Button
              variant={paymentMethod === "CARD" ? "default" : "outline"}
              size="sm"
              onClick={() => setPaymentMethod("CARD")}
            >
              <CreditCard className="mr-1 h-4 w-4" />
              Card
            </Button>
          </div>
        </div>

        {/* Product Buttons */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                disabled={product.stock !== null && product.stock <= 0}
                className="relative flex flex-col items-center justify-center p-4 rounded-xl border-2 bg-card hover:bg-accent hover:border-primary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed min-h-[100px]"
              >
                <span className="text-3xl mb-1">
                  {getMerchCategoryEmoji(product.category)}
                </span>
                <span className="font-semibold text-sm text-center leading-tight">
                  {product.name}
                </span>
                <span className="text-lg font-bold mt-1">
                  {currencySymbol}{Number(product.price).toFixed(2)}
                </span>
                {product.stock !== null && (
                  <Badge
                    variant={product.stock <= 5 ? "destructive" : "secondary"}
                    className="absolute top-1 right-1 text-[10px] px-1.5"
                  >
                    {product.stock}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Size Selection Overlay */}
          {sizeSelecting && (
            <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4">
              <Card className="w-full max-w-sm">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4 text-center">Select Size</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {products
                      .find((p) => p.id === sizeSelecting)
                      ?.sizes?.split(",")
                      .map((size) => (
                        <Button
                          key={size}
                          variant="outline"
                          className="h-14 text-lg font-bold"
                          onClick={() =>
                            addToCart(
                              products.find((p) => p.id === sizeSelecting)!,
                              size.trim()
                            )
                          }
                        >
                          {size.trim()}
                        </Button>
                      ))}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-3"
                    onClick={() => setSizeSelecting(null)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Cart & Recent Sales - Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4 min-h-0">
        {/* Cart */}
        <Card className="flex flex-col min-h-0">
          <CardContent className="pt-4 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-5 w-5" />
              <h3 className="font-semibold">Cart</h3>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-7 text-xs"
                  onClick={() => setCart([])}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Tap products to add
              </p>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.size || "none"}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {item.name}
                        {item.size && (
                          <span className="text-muted-foreground"> ({item.size})</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeFromCart(item.productId, item.size)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          addToCart(
                            { id: item.productId, name: item.name, price: item.price } as Product,
                            item.size
                          )
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-semibold tabular-nums w-16 text-right">
                      {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Total & Checkout */}
            {cart.length > 0 && (
              <div className="border-t mt-3 pt-3 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full h-14 text-lg font-bold"
                  onClick={checkout}
                  disabled={isPending}
                >
                  {isPending ? "Processing..." : (
                    <>
                      {paymentMethod === "CASH" ? (
                        <Banknote className="mr-2 h-5 w-5" />
                      ) : (
                        <CreditCard className="mr-2 h-5 w-5" />
                      )}
                      {currencySymbol}{total.toFixed(2)} - {paymentMethod === "CASH" ? "Cash" : "Card"}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="pt-4 flex flex-col min-h-0">
            <h3 className="font-semibold mb-3 text-sm">Recent Sales</h3>
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {recentSales.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No sales yet
                </p>
              ) : (
                recentSales.slice(0, 20).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center gap-2 text-xs py-1 border-b last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate">
                        {sale.quantity}x {sale.productName}
                        {sale.size && ` (${sale.size})`}
                      </p>
                      <p className="text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleTimeString("de-DE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums">
                      {currencySymbol}{sale.totalPrice.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => undoSale(sale.id)}
                      disabled={isPending}
                      title="Undo sale"
                    >
                      <Undo2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
