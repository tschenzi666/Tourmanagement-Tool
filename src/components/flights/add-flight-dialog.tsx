"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { createTravelTicket } from "@/lib/actions/crew-actions"

interface CrewMember {
  id: string
  roleTitle: string | null
  role: string
  user: { name: string | null } | null
}

const ticketTypes = [
  { value: "FLIGHT", label: "✈️ Flight" },
  { value: "TRAIN", label: "🚆 Train" },
  { value: "BUS", label: "🚌 Bus" },
  { value: "FERRY", label: "⛴️ Ferry" },
  { value: "SHUTTLE", label: "🚐 Shuttle" },
  { value: "OTHER", label: "🎫 Other" },
]

export function AddTravelTicketDialog({
  tourId,
  crewMembers,
  currency,
}: {
  tourId: string
  crewMembers: CrewMember[]
  currency: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [ticketType, setTicketType] = useState("FLIGHT")

  const carrierLabel = ticketType === "FLIGHT" ? "Airline" : ticketType === "TRAIN" ? "Train Company" : "Carrier"
  const numberLabel = ticketType === "FLIGHT" ? "Flight No." : ticketType === "TRAIN" ? "Train No." : "Service No."
  const numberPlaceholder = ticketType === "FLIGHT" ? "e.g. LH 123" : ticketType === "TRAIN" ? "e.g. ICE 578" : "e.g. 42A"
  const carrierPlaceholder = ticketType === "FLIGHT" ? "e.g. Lufthansa" : ticketType === "TRAIN" ? "e.g. Deutsche Bahn" : "e.g. FlixBus"

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await createTravelTicket(tourId, {
          crewMemberId: form.get("crewMemberId") as string,
          ticketType,
          carrier: form.get("carrier") as string,
          serviceNumber: (form.get("serviceNumber") as string) || undefined,
          departureCity: form.get("departureCity") as string,
          arrivalCity: form.get("arrivalCity") as string,
          departureTime: (form.get("departureTime") as string) || undefined,
          arrivalTime: (form.get("arrivalTime") as string) || undefined,
          bookingReference: (form.get("bookingReference") as string) || undefined,
          seatNumber: (form.get("seatNumber") as string) || undefined,
          cost: form.get("cost") ? Number(form.get("cost")) : undefined,
          currency,
        })
        toast.success("Travel ticket added!")
        setOpen(false)
        router.refresh()
      } catch {
        toast.error("Failed to add travel ticket")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Travel Ticket</DialogTitle>
          <DialogDescription>Add a flight, train, bus, or other travel booking for a crew member.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crewMemberId">Crew Member</Label>
              <Select name="crewMemberId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select crew member..." />
                </SelectTrigger>
                <SelectContent>
                  {crewMembers.map((cm) => (
                    <SelectItem key={cm.id} value={cm.id}>
                      {cm.roleTitle || cm.user?.name || cm.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ticket Type</Label>
              <Select value={ticketType} onValueChange={setTicketType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ticketTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carrier">{carrierLabel} *</Label>
              <Input id="carrier" name="carrier" placeholder={carrierPlaceholder} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceNumber">{numberLabel}</Label>
              <Input id="serviceNumber" name="serviceNumber" placeholder={numberPlaceholder} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureCity">From *</Label>
              <Input id="departureCity" name="departureCity" placeholder="Departure city" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalCity">To *</Label>
              <Input id="arrivalCity" name="arrivalCity" placeholder="Arrival city" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureTime">Departure</Label>
              <Input id="departureTime" name="departureTime" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalTime">Arrival</Label>
              <Input id="arrivalTime" name="arrivalTime" type="datetime-local" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookingReference">Booking Ref</Label>
              <Input id="bookingReference" name="bookingReference" placeholder="ABC123" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seatNumber">Seat</Label>
              <Input id="seatNumber" name="seatNumber" placeholder="12A" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" name="cost" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
