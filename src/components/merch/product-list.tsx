"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Eye, EyeOff } from "lucide-react"
import { deleteMerchProduct, toggleMerchProductActive } from "@/lib/actions/merch-actions"
import { getMerchCategoryEmoji, formatMerchCategory } from "@/lib/validations/merch"

interface Product {
  id: string
  name: string
  category: string
  price: number
  cost: number | null
  sizes: string | null
  stock: number | null
  isActive: boolean
}

export function ProductList({
  products,
  tourId,
  currencySymbol,
}: {
  products: Product[]
  tourId: string
  currencySymbol: string
}) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No products yet. Add your first merch product to get started.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div
          key={product.id}
          className={`flex items-center gap-3 p-3 rounded-lg border ${!product.isActive ? "opacity-50" : ""}`}
        >
          <span className="text-2xl">{getMerchCategoryEmoji(product.category)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{product.name}</p>
              {!product.isActive && (
                <Badge variant="secondary" className="text-xs">Inactive</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatMerchCategory(product.category)}</span>
              {product.sizes && <span>· {product.sizes}</span>}
              {product.stock !== null && (
                <span className={product.stock <= 5 ? "text-red-600 font-medium" : ""}>
                  · {product.stock} in stock
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold tabular-nums">{currencySymbol}{product.price.toFixed(2)}</p>
            {product.cost !== null && (
              <p className="text-xs text-muted-foreground tabular-nums">
                EK: {currencySymbol}{product.cost.toFixed(2)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <form action={toggleMerchProductActive.bind(null, tourId, product.id)}>
              <Button variant="ghost" size="icon" className="h-8 w-8" type="submit" title={product.isActive ? "Deactivate" : "Activate"}>
                {product.isActive ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </form>
            <form action={deleteMerchProduct.bind(null, tourId, product.id)}>
              <Button variant="ghost" size="icon" className="h-8 w-8" type="submit">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}
