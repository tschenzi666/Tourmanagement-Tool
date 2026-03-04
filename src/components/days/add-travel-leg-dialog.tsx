"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { createTravelLeg } from "@/lib/actions/tour-day-actions"

const travelModes = [
  { value: "FLY", label: "Flight" },
  { value: "BUS", label: "Bus / Coach" },
  { value: "DRIVE", label: "Drive" },
  { value: "TRAIN", label: "Train" },
  { value: "FERRY", label: "Ferry" },
  { value: "OTHER", label: "Other" },
]

export function AddTravelLegDialog({
  tourDayId,
  tourId,
}: {
  tourDayId: string
  tourId: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("DRIVE")
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createTravelLeg(tourDayId, tourId, formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to create travel leg:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-3 w-3" />
          Add Travel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Travel Leg</DialogTitle>
            <DialogDescription>
              Add a travel segment to this day.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mode">Mode of Travel</Label>
              <Select name="mode" defaultValue="DRIVE" onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {travelModes.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureCity">From</Label>
                <Input id="departureCity" name="departureCity" placeholder="Departure city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalCity">To</Label>
                <Input id="arrivalCity" name="arrivalCity" placeholder="Arrival city" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input id="departureTime" name="departureTime" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Arrival Time</Label>
                <Input id="arrivalTime" name="arrivalTime" type="datetime-local" />
              </div>
            </div>
            {(mode === "FLY" || mode === "TRAIN") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carrier">
                    {mode === "FLY" ? "Airline" : "Rail Company"}
                  </Label>
                  <Input id="carrier" name="carrier" placeholder={mode === "FLY" ? "e.g. Lufthansa" : "e.g. Deutsche Bahn"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flightNumber">
                    {mode === "FLY" ? "Flight Number" : "Train Number"}
                  </Label>
                  <Input id="flightNumber" name="flightNumber" placeholder={mode === "FLY" ? "e.g. LH1234" : "e.g. ICE 123"} />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="confirmationCode">Confirmation Code</Label>
              <Input id="confirmationCode" name="confirmationCode" placeholder="Booking reference" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Optional notes..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Travel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
