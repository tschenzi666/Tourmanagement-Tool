import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, Train, Bus, Ship, Clock, MapPin, Ticket } from "lucide-react"
import { format } from "date-fns"
import { AddTravelTicketDialog } from "@/components/flights/add-flight-dialog"
import { DeleteTravelTicketButton } from "@/components/flights/delete-flight-button"

const ticketTypeIcons: Record<string, typeof Plane> = {
  FLIGHT: Plane,
  TRAIN: Train,
  BUS: Bus,
  FERRY: Ship,
  SHUTTLE: Bus,
  OTHER: Ticket,
}

const ticketTypeLabels: Record<string, string> = {
  FLIGHT: "Flight",
  TRAIN: "Train",
  BUS: "Bus",
  FERRY: "Ferry",
  SHUTTLE: "Shuttle",
  OTHER: "Other",
}

export default async function TravelTicketsPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { id: true, name: true, currency: true },
  })

  if (!tour) notFound()

  const tickets = await prisma.travelTicket.findMany({
    where: { tourId },
    include: {
      crewMember: {
        select: { id: true, roleTitle: true, role: true, user: { select: { name: true } } },
      },
    },
    orderBy: { departureTime: "asc" },
  })

  const crewMembers = await prisma.tourCrewMember.findMany({
    where: { tourId, isActive: true },
    select: { id: true, roleTitle: true, role: true, user: { select: { name: true } } },
    orderBy: { roleTitle: "asc" },
  })

  const totalCost = tickets.reduce((sum, t) => sum + (t.cost ? Number(t.cost) : 0), 0)

  // Group tickets by crew member
  const byCrewMember = new Map<string, typeof tickets>()
  for (const ticket of tickets) {
    const name = ticket.crewMember.roleTitle || ticket.crewMember.user?.name || "Unknown"
    if (!byCrewMember.has(name)) byCrewMember.set(name, [])
    byCrewMember.get(name)!.push(ticket)
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Travel Tickets" },
        ]}
      />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Ticket className="h-7 w-7" />
              Travel Tickets
            </h1>
            <p className="text-muted-foreground mt-1">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} booked
              {totalCost > 0 && ` · Total: $${totalCost.toLocaleString()}`}
            </p>
          </div>
          <AddTravelTicketDialog tourId={tourId} crewMembers={crewMembers} currency={tour.currency} />
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Ticket className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No travel tickets yet</h2>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Add flights, train tickets, bus rides, or other travel bookings for your crew.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Array.from(byCrewMember.entries()).map(([name, memberTickets]) => (
              <Card key={name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {memberTickets.length} ticket{memberTickets.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {memberTickets.map((ticket) => {
                      const Icon = ticketTypeIcons[ticket.ticketType] ?? Ticket
                      const typeLabel = ticketTypeLabels[ticket.ticketType] ?? ticket.ticketType
                      return (
                        <div key={ticket.id} className="flex items-center gap-4 p-3 rounded-lg border">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {ticket.carrier}
                                {ticket.serviceNumber && <span className="text-muted-foreground"> {ticket.serviceNumber}</span>}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {typeLabel}
                              </Badge>
                              <Badge
                                variant={ticket.status === "CONFIRMED" ? "default" : ticket.status === "CANCELLED" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {ticket.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{ticket.departureCity} → {ticket.arrivalCity}</span>
                            </div>
                            {ticket.departureTime && (
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(ticket.departureTime), "MMM d, yyyy HH:mm")}
                                  {ticket.arrivalTime && ` → ${format(new Date(ticket.arrivalTime), "HH:mm")}`}
                                </span>
                              </div>
                            )}
                            {ticket.bookingReference && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Ref: {ticket.bookingReference}
                                {ticket.seatNumber && ` · Seat: ${ticket.seatNumber}`}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            {ticket.cost && (
                              <p className="font-semibold tabular-nums">
                                ${Number(ticket.cost).toLocaleString()}
                              </p>
                            )}
                            <DeleteTravelTicketButton tourId={tourId} ticketId={ticket.id} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
