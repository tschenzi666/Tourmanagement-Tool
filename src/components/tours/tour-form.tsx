"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface TourFormProps {
  action: (formData: FormData) => Promise<void>
  tour?: {
    name: string
    artist?: string | null
    startDate?: Date | null
    endDate?: Date | null
    currency: string
    description?: string | null
    status?: string
  }
  submitLabel?: string
}

function formatDate(date: Date | null | undefined) {
  if (!date) return ""
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function TourForm({ action, tour, submitLabel = "Create Tour" }: TourFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    const startDate = form.get("startDate") as string
    const endDate = form.get("endDate") as string
    const name = form.get("name") as string

    // Client-side validation
    if (!name?.trim()) {
      setError("Tour name is required")
      return
    }

    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      setError("Start date is invalid. Please use the format YYYY-MM-DD.")
      return
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      setError("End date is invalid. Please use the format YYYY-MM-DD.")
      return
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("End date must be after start date.")
      return
    }

    startTransition(async () => {
      try {
        await action(form)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong"
        setError(message)
        toast.error(message)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tour ? "Edit Tour" : "Create New Tour"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Tour Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder='e.g., "Summer 2026 World Tour"'
                defaultValue={tour?.name ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist / Act</Label>
              <Input
                id="artist"
                name="artist"
                placeholder="Artist or band name"
                defaultValue={tour?.artist ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={formatDate(tour?.startDate)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={formatDate(tour?.endDate)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select name="currency" defaultValue={tour?.currency ?? "EUR"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {tour && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={tour.status ?? "DRAFT"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Additional notes about this tour..."
              defaultValue={tour?.description ?? ""}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
