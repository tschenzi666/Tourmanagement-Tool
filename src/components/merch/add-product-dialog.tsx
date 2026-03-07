"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createMerchProduct } from "@/lib/actions/merch-actions"
import { merchProductCategories, formatMerchCategory, getMerchCategoryEmoji } from "@/lib/validations/merch"

export function AddProductDialog({ tourId }: { tourId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Merch Product</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await createMerchProduct(tourId, formData)
            setOpen(false)
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required placeholder="e.g. Tour T-Shirt 2026" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="OTHER">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {merchProductCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getMerchCategoryEmoji(cat)} {formatMerchCategory(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" required placeholder="25.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (EK)</Label>
              <Input id="cost" name="cost" type="number" step="0.01" min="0" placeholder="10.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" min="0" placeholder="100" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sizes">Sizes (comma-separated)</Label>
            <Input id="sizes" name="sizes" placeholder="S,M,L,XL,XXL" />
          </div>

          <Button type="submit" className="w-full">Add Product</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
