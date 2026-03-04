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
import { createScheduleItem } from "@/lib/actions/tour-day-actions"

const scheduleTypes = [
  { value: "LOAD_IN", label: "Load-In" },
  { value: "SOUNDCHECK", label: "Soundcheck" },
  { value: "DOORS", label: "Doors" },
  { value: "SUPPORT_SET", label: "Support Set" },
  { value: "SET_TIME", label: "Set Time" },
  { value: "CHANGEOVER", label: "Changeover" },
  { value: "CURFEW", label: "Curfew" },
  { value: "MEET_AND_GREET", label: "Meet & Greet" },
  { value: "CATERING", label: "Catering" },
  { value: "PRESS", label: "Press" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "REHEARSAL", label: "Rehearsal" },
  { value: "TRAVEL_DEPART", label: "Travel Depart" },
  { value: "TRAVEL_ARRIVE", label: "Travel Arrive" },
  { value: "HOTEL_CHECK_IN", label: "Hotel Check-In" },
  { value: "HOTEL_CHECK_OUT", label: "Hotel Check-Out" },
  { value: "CUSTOM", label: "Custom" },
]

// Auto-generate label based on type
const typeLabels: Record<string, string> = {
  LOAD_IN: "Load-In",
  SOUNDCHECK: "Soundcheck",
  DOORS: "Doors",
  SUPPORT_SET: "Support",
  SET_TIME: "Set Time",
  CHANGEOVER: "Changeover",
  CURFEW: "Curfew",
  MEET_AND_GREET: "Meet & Greet",
  CATERING: "Catering",
  PRESS: "Press",
  INTERVIEW: "Interview",
  REHEARSAL: "Rehearsal",
  TRAVEL_DEPART: "Depart",
  TRAVEL_ARRIVE: "Arrive",
  HOTEL_CHECK_IN: "Hotel Check-In",
  HOTEL_CHECK_OUT: "Hotel Check-Out",
  CUSTOM: "",
}

export function AddScheduleItemDialog({
  tourDayId,
  tourId,
}: {
  tourDayId: string
  tourId: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState("CUSTOM")
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createScheduleItem(tourDayId, tourId, formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to create schedule item:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-3 w-3" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Schedule Item</DialogTitle>
            <DialogDescription>
              Add an event to the day&apos;s schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                name="type"
                defaultValue="CUSTOM"
                onValueChange={setSelectedType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scheduleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                name="label"
                required
                defaultValue={typeLabels[selectedType] ?? ""}
                key={selectedType}
                placeholder="e.g. Main Set"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" name="startTime" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" name="endTime" type="datetime-local" />
              </div>
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
              {loading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
