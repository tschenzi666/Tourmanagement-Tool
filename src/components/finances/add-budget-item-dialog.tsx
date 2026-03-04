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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createBudgetItem } from "@/lib/actions/finance-actions"

const budgetCategories = [
  "Production",
  "Travel",
  "Accommodation",
  "Crew",
  "Catering",
  "Equipment Rental",
  "Transport",
  "Insurance",
  "Marketing",
  "Merchandise",
  "Visas & Work Permits",
  "Contingency",
  "Other",
]

export function AddBudgetItemDialog({ tourId }: { tourId: string }) {
  const [open, setOpen] = useState(false)
  const createBudgetItemWithTourId = createBudgetItem.bind(null, tourId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Budget Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Budget Item</DialogTitle>
        </DialogHeader>
        <form action={createBudgetItemWithTourId} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select name="category" defaultValue="Other">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {budgetCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input id="description" name="description" placeholder="e.g. Nightliner rental" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated">Estimated Cost *</Label>
              <Input id="estimated" name="estimated" type="number" step="0.01" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual">Actual Cost</Label>
              <Input id="actual" name="actual" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Any notes..." rows={2} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Budget Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
