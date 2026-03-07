"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plane,
  Train,
  Bus,
  Ship,
  Clock,
  Ticket,
  Plus,
  Trash2,
  Pencil,
  ArrowRight,
  Users,
  CreditCard,
  Calendar,
  RefreshCw,
  Radar,
  AlertTriangle,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import { toast } from "sonner"
import { createTravelTicket, updateTravelTicket, deleteTravelTicket } from "@/lib/actions/crew-actions"
import { checkFlightStatus, checkAllFlightStatuses } from "@/lib/actions/flight-tracking-actions"

// ─── Types ──────────────────────────────────────────────────

interface CrewMember {
  id: string
  roleTitle: string | null
  role: string
  user: { name: string | null } | null
}

interface TravelTicketData {
  id: string
  ticketType: string
  carrier: string
  serviceNumber: string | null
  departureCity: string
  arrivalCity: string
  departureTime: Date | null
  arrivalTime: Date | null
  bookingReference: string | null
  ticketNumber: string | null
  seatNumber: string | null
  baggageAllowance: string | null
  cost: string | number | null
  currency: string
  status: string
  notes: string | null
  crewMemberId: string
  crewMember: {
    id: string
    roleTitle: string | null
    role: string
    user: { name: string | null } | null
  }
  // Live tracking fields
  liveStatus: string | null
  liveDelay: number | null
  liveDepartureGate: string | null
  liveDepartureTerminal: string | null
  liveArrivalGate: string | null
  liveArrivalTerminal: string | null
  liveArrivalBaggage: string | null
  liveLastChecked: Date | null
}

interface TravelTicketsClientProps {
  tourId: string
  tickets: TravelTicketData[]
  crewMembers: CrewMember[]
  currency: string
  hasApiKey: boolean
}

// ─── Constants ──────────────────────────────────────────────

const ticketTypeIcons: Record<string, typeof Plane> = {
  FLIGHT: Plane,
  TRAIN: Train,
  BUS: Bus,
  FERRY: Ship,
  SHUTTLE: Bus,
  OTHER: Ticket,
}

const ticketTypeLabels: Record<string, string> = {
  FLIGHT: "Flug",
  TRAIN: "Zug",
  BUS: "Bus",
  FERRY: "Fähre",
  SHUTTLE: "Shuttle",
  OTHER: "Sonstige",
}

const ticketTypeColors: Record<string, string> = {
  FLIGHT: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  TRAIN: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  BUS: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  FERRY: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  SHUTTLE: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300",
}

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  CHANGED: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
}

const statusLabels: Record<string, string> = {
  CONFIRMED: "Bestätigt",
  CANCELLED: "Storniert",
  CHANGED: "Geändert",
}

const liveStatusLabels: Record<string, string> = {
  scheduled: "Geplant",
  active: "In der Luft",
  landed: "Gelandet",
  cancelled: "Storniert",
  incident: "Zwischenfall",
  diverted: "Umgeleitet",
  not_found: "Nicht gefunden",
}

const liveStatusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  landed: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  incident: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  diverted: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  not_found: "bg-gray-100 text-gray-500 dark:bg-gray-950 dark:text-gray-400",
}

const ticketTypes = [
  { value: "FLIGHT", label: "✈️ Flug" },
  { value: "TRAIN", label: "🚆 Zug" },
  { value: "BUS", label: "🚌 Bus" },
  { value: "FERRY", label: "⛴️ Fähre" },
  { value: "SHUTTLE", label: "🚐 Shuttle" },
  { value: "OTHER", label: "🎫 Sonstige" },
]

function getCrewName(cm: { roleTitle: string | null; role: string; user: { name: string | null } | null }) {
  return cm.roleTitle || cm.user?.name || cm.role
}

function formatDateShort(date: Date) {
  return format(new Date(date), "dd. MMM yyyy", { locale: de })
}

function formatTime(date: Date) {
  return format(new Date(date), "HH:mm")
}

function toLocalDatetime(date: Date | null): string {
  if (!date) return ""
  const d = new Date(date)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

// ─── Main Component ─────────────────────────────────────────

export function TravelTicketsClient({ tourId, tickets, crewMembers, currency, hasApiKey }: TravelTicketsClientProps) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [editTicket, setEditTicket] = useState<TravelTicketData | null>(null)
  const [isCheckingAll, startCheckAll] = useTransition()

  const totalCost = tickets.reduce((sum, t) => sum + (t.cost ? Number(t.cost) : 0), 0)
  const flightCount = tickets.filter(t => t.ticketType === "FLIGHT" && t.serviceNumber).length

  // Group by date
  const byDate = new Map<string, TravelTicketData[]>()
  const noDate: TravelTicketData[] = []
  for (const ticket of tickets) {
    if (ticket.departureTime) {
      const key = formatDateShort(ticket.departureTime)
      if (!byDate.has(key)) byDate.set(key, [])
      byDate.get(key)!.push(ticket)
    } else {
      noDate.push(ticket)
    }
  }

  const sortedDates = Array.from(byDate.entries()).sort((a, b) => {
    const dateA = a[1][0]?.departureTime ? new Date(a[1][0].departureTime).getTime() : 0
    const dateB = b[1][0]?.departureTime ? new Date(b[1][0].departureTime).getTime() : 0
    return dateA - dateB
  })

  const byType = new Map<string, number>()
  for (const t of tickets) {
    byType.set(t.ticketType, (byType.get(t.ticketType) || 0) + 1)
  }

  function handleCheckAll() {
    startCheckAll(async () => {
      try {
        const result = await checkAllFlightStatuses(tourId)
        toast.success(`${result.checked} Flüge aktualisiert${result.skipped ? `, ${result.skipped} übersprungen (kürzlich geprüft)` : ""}`)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler beim Aktualisieren")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      {tickets.length > 0 && (
        <div className="flex justify-end gap-2">
          {hasApiKey && flightCount > 0 && (
            <Button variant="outline" onClick={handleCheckAll} disabled={isCheckingAll}>
              <Radar className={`mr-2 h-4 w-4 ${isCheckingAll ? "animate-spin" : ""}`} />
              {isCheckingAll ? "Prüfe Flüge..." : `Alle Flüge prüfen (${flightCount})`}
            </Button>
          )}
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neues Ticket
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                <Ticket className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tickets.length}</p>
                <p className="text-xs text-muted-foreground">Tickets gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                <CreditCard className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCost > 0 ? `${totalCost.toLocaleString("de-DE")}` : "–"}</p>
                <p className="text-xs text-muted-foreground">Gesamtkosten ({currency})</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                <Users className="h-5 w-5 text-purple-700 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(tickets.map(t => t.crewMemberId)).size}</p>
                <p className="text-xs text-muted-foreground">Crew mit Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                <Calendar className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{byDate.size}</p>
                <p className="text-xs text-muted-foreground">Reisetage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type badges */}
      {tickets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(byType.entries()).map(([type, count]) => {
            const Icon = ticketTypeIcons[type] ?? Ticket
            return (
              <Badge key={type} variant="secondary" className="gap-1.5 py-1 px-3">
                <Icon className="h-3.5 w-3.5" />
                {count}× {ticketTypeLabels[type] ?? type}
              </Badge>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {tickets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Noch keine Tickets</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Lege Flug-, Zug-, Bus- oder andere Reisebuchungen für deine Crew an.
            </p>
            <Button className="mt-4" onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Erstes Ticket anlegen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Timeline by date */}
      {sortedDates.map(([dateLabel, dateTickets]) => (
        <div key={dateLabel}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {dateTickets[0]?.departureTime ? format(new Date(dateTickets[0].departureTime), "dd") : "?"}
            </div>
            <h2 className="text-lg font-semibold">{dateLabel}</h2>
            <Badge variant="outline" className="text-xs">
              {dateTickets.length} Ticket{dateTickets.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <div className="space-y-2 ml-4 border-l-2 border-muted pl-6">
            {dateTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                tourId={tourId}
                currency={currency}
                hasApiKey={hasApiKey}
                onEdit={() => setEditTicket(ticket)}
                onDeleted={() => router.refresh()}
                onStatusChecked={() => router.refresh()}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Tickets without date */}
      {noDate.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">?</div>
            <h2 className="text-lg font-semibold text-muted-foreground">Ohne Datum</h2>
            <Badge variant="outline" className="text-xs">{noDate.length} Ticket{noDate.length !== 1 ? "s" : ""}</Badge>
          </div>
          <div className="space-y-2 ml-4 border-l-2 border-dashed border-muted pl-6">
            {noDate.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                tourId={tourId}
                currency={currency}
                hasApiKey={hasApiKey}
                onEdit={() => setEditTicket(ticket)}
                onDeleted={() => router.refresh()}
                onStatusChecked={() => router.refresh()}
              />
            ))}
          </div>
        </div>
      )}

      <AddTicketDialog open={addOpen} onOpenChange={setAddOpen} tourId={tourId} crewMembers={crewMembers} currency={currency} onSuccess={() => router.refresh()} />
      {editTicket && (
        <EditTicketDialog ticket={editTicket} tourId={tourId} crewMembers={crewMembers} currency={currency} onClose={() => setEditTicket(null)} onSuccess={() => { setEditTicket(null); router.refresh() }} />
      )}
    </div>
  )
}

// ─── Live Status Badge ──────────────────────────────────────

function LiveStatusSection({ ticket }: { ticket: TravelTicketData }) {
  if (!ticket.liveStatus) return null

  const label = liveStatusLabels[ticket.liveStatus] ?? ticket.liveStatus
  const color = liveStatusColors[ticket.liveStatus] ?? liveStatusColors.not_found

  return (
    <div className="mt-2 p-2 rounded-lg bg-muted/50 border border-dashed">
      <div className="flex items-center gap-2 flex-wrap">
        <Radar className="h-3.5 w-3.5 text-muted-foreground" />
        <Badge className={`text-xs border-0 ${color}`}>
          {label}
        </Badge>
        {ticket.liveDelay != null && ticket.liveDelay > 0 && (
          <Badge className="text-xs border-0 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            +{ticket.liveDelay} Min. Verspätung
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
        {ticket.liveDepartureTerminal && (
          <span>Terminal: <span className="font-mono font-medium">{ticket.liveDepartureTerminal}</span></span>
        )}
        {ticket.liveDepartureGate && (
          <span>Gate: <span className="font-mono font-medium">{ticket.liveDepartureGate}</span></span>
        )}
        {ticket.liveArrivalTerminal && (
          <span>Ank. Terminal: <span className="font-mono font-medium">{ticket.liveArrivalTerminal}</span></span>
        )}
        {ticket.liveArrivalGate && (
          <span>Ank. Gate: <span className="font-mono font-medium">{ticket.liveArrivalGate}</span></span>
        )}
        {ticket.liveArrivalBaggage && (
          <span>Gepäckband: <span className="font-mono font-medium">{ticket.liveArrivalBaggage}</span></span>
        )}
      </div>
      {ticket.liveLastChecked && (
        <p className="text-[10px] text-muted-foreground mt-1">
          Zuletzt geprüft: {formatDistanceToNow(new Date(ticket.liveLastChecked), { addSuffix: true, locale: de })}
        </p>
      )}
    </div>
  )
}

// ─── Ticket Card ────────────────────────────────────────────

function TicketCard({
  ticket,
  tourId,
  currency,
  hasApiKey,
  onEdit,
  onDeleted,
  onStatusChecked,
}: {
  ticket: TravelTicketData
  tourId: string
  currency: string
  hasApiKey: boolean
  onEdit: () => void
  onDeleted: () => void
  onStatusChecked: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [isChecking, startChecking] = useTransition()
  const Icon = ticketTypeIcons[ticket.ticketType] ?? Ticket
  const isCancelled = ticket.status === "CANCELLED"
  const canCheck = hasApiKey && ticket.ticketType === "FLIGHT" && !!ticket.serviceNumber

  function handleCheckStatus() {
    startChecking(async () => {
      try {
        const result = await checkFlightStatus(tourId, ticket.id)
        if (result.status === "not_found") {
          toast.info("Kein Flug mit dieser Nummer gefunden")
        } else {
          toast.success(`Status: ${liveStatusLabels[result.status ?? ""] ?? result.status}${result.delay ? ` (+${result.delay} Min.)` : ""}`)
        }
        onStatusChecked()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler beim Statusabruf")
      }
    })
  }

  return (
    <Card className={`transition-all hover:shadow-md ${isCancelled ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${ticketTypeColors[ticket.ticketType] ?? ticketTypeColors.OTHER}`}>
            <Icon className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-lg">{ticket.departureCity}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-semibold text-lg">{ticket.arrivalCity}</span>
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm font-medium">{ticket.carrier}</span>
              {ticket.serviceNumber && (
                <Badge variant="outline" className="text-xs font-mono">{ticket.serviceNumber}</Badge>
              )}
              <Badge className={`text-xs border-0 ${statusColors[ticket.status] ?? ""}`}>
                {statusLabels[ticket.status] ?? ticket.status}
              </Badge>
            </div>

            {ticket.departureTime && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="font-mono">
                  {formatTime(ticket.departureTime)}
                  {ticket.arrivalTime && (
                    <><span className="mx-1">→</span>{formatTime(ticket.arrivalTime)}</>
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {getCrewName(ticket.crewMember)}
              </span>
              {ticket.bookingReference && (
                <span>Ref: <span className="font-mono">{ticket.bookingReference}</span></span>
              )}
              {ticket.seatNumber && (
                <span>Sitz: <span className="font-mono">{ticket.seatNumber}</span></span>
              )}
              {ticket.baggageAllowance && (
                <span>Gepäck: {ticket.baggageAllowance}</span>
              )}
            </div>

            {ticket.notes && (
              <p className="text-xs text-muted-foreground mt-2 italic">{ticket.notes}</p>
            )}

            {/* Live tracking info */}
            <LiveStatusSection ticket={ticket} />
          </div>

          <div className="text-right shrink-0 flex flex-col items-end gap-2">
            {ticket.cost && Number(ticket.cost) > 0 && (
              <p className="font-bold text-lg tabular-nums">
                {Number(ticket.cost).toLocaleString("de-DE")} <span className="text-xs font-normal text-muted-foreground">{currency}</span>
              </p>
            )}
            <div className="flex gap-1">
              {canCheck && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCheckStatus} disabled={isChecking} title="Flugstatus prüfen">
                  <RefreshCw className={`h-3 w-3 text-muted-foreground ${isChecking ? "animate-spin" : ""}`} />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    try {
                      await deleteTravelTicket(tourId, ticket.id)
                      toast.success("Ticket gelöscht")
                      onDeleted()
                    } catch {
                      toast.error("Fehler beim Löschen")
                    }
                  })
                }}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Add Ticket Dialog ──────────────────────────────────────

function AddTicketDialog({
  open, onOpenChange, tourId, crewMembers, currency, onSuccess,
}: {
  open: boolean; onOpenChange: (open: boolean) => void; tourId: string; crewMembers: CrewMember[]; currency: string; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [ticketType, setTicketType] = useState("FLIGHT")
  const labels = getTypeLabels(ticketType)

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
        toast.success("Ticket angelegt!")
        onOpenChange(false)
        onSuccess()
      } catch { toast.error("Fehler beim Anlegen") }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neues Ticket anlegen</DialogTitle>
          <DialogDescription>Flug, Zug, Bus oder andere Buchung für ein Crew-Mitglied.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TicketFormFields crewMembers={crewMembers} ticketType={ticketType} onTicketTypeChange={setTicketType} labels={labels} />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>{isPending ? "Wird angelegt..." : "Ticket anlegen"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Ticket Dialog ─────────────────────────────────────

function EditTicketDialog({
  ticket, tourId, crewMembers, currency, onClose, onSuccess,
}: {
  ticket: TravelTicketData; tourId: string; crewMembers: CrewMember[]; currency: string; onClose: () => void; onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [ticketType, setTicketType] = useState(ticket.ticketType)
  const [status, setStatus] = useState(ticket.status)
  const labels = getTypeLabels(ticketType)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateTravelTicket(tourId, ticket.id, {
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
          cost: form.get("cost") ? Number(form.get("cost")) : null,
          status,
          currency,
        })
        toast.success("Ticket aktualisiert!")
        onSuccess()
      } catch { toast.error("Fehler beim Aktualisieren") }
    })
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ticket bearbeiten</DialogTitle>
          <DialogDescription>{ticket.carrier} {ticket.serviceNumber} · {ticket.departureCity} → {ticket.arrivalCity}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TicketFormFields crewMembers={crewMembers} ticketType={ticketType} onTicketTypeChange={setTicketType} labels={labels} defaults={{
            crewMemberId: ticket.crewMemberId, carrier: ticket.carrier, serviceNumber: ticket.serviceNumber ?? "",
            departureCity: ticket.departureCity, arrivalCity: ticket.arrivalCity,
            departureTime: toLocalDatetime(ticket.departureTime), arrivalTime: toLocalDatetime(ticket.arrivalTime),
            bookingReference: ticket.bookingReference ?? "", seatNumber: ticket.seatNumber ?? "",
            cost: ticket.cost ? String(Number(ticket.cost)) : "",
          }} />
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRMED">Bestätigt</SelectItem>
                <SelectItem value="CHANGED">Geändert</SelectItem>
                <SelectItem value="CANCELLED">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Wird gespeichert..." : "Speichern"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Shared Form Fields ─────────────────────────────────────

function TicketFormFields({ crewMembers, ticketType, onTicketTypeChange, labels, defaults }: {
  crewMembers: CrewMember[]; ticketType: string; onTicketTypeChange: (v: string) => void
  labels: ReturnType<typeof getTypeLabels>; defaults?: Record<string, string>
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="crewMemberId">Crew-Mitglied *</Label>
          <Select name="crewMemberId" defaultValue={defaults?.crewMemberId} required>
            <SelectTrigger><SelectValue placeholder="Auswählen..." /></SelectTrigger>
            <SelectContent>{crewMembers.map((cm) => (<SelectItem key={cm.id} value={cm.id}>{getCrewName(cm)}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Ticket-Typ *</Label>
          <Select value={ticketType} onValueChange={onTicketTypeChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ticketTypes.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="carrier">{labels.carrier} *</Label>
          <Input id="carrier" name="carrier" placeholder={labels.carrierPlaceholder} defaultValue={defaults?.carrier} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceNumber">{labels.number}</Label>
          <Input id="serviceNumber" name="serviceNumber" placeholder={labels.numberPlaceholder} defaultValue={defaults?.serviceNumber} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departureCity">Von *</Label>
          <Input id="departureCity" name="departureCity" placeholder="Abfahrt/Abflug" defaultValue={defaults?.departureCity} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrivalCity">Nach *</Label>
          <Input id="arrivalCity" name="arrivalCity" placeholder="Ankunft" defaultValue={defaults?.arrivalCity} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departureTime">Abfahrt</Label>
          <Input id="departureTime" name="departureTime" type="datetime-local" defaultValue={defaults?.departureTime} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrivalTime">Ankunft</Label>
          <Input id="arrivalTime" name="arrivalTime" type="datetime-local" defaultValue={defaults?.arrivalTime} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bookingReference">Buchungsref.</Label>
          <Input id="bookingReference" name="bookingReference" placeholder="ABC123" defaultValue={defaults?.bookingReference} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seatNumber">Sitz</Label>
          <Input id="seatNumber" name="seatNumber" placeholder="12A" defaultValue={defaults?.seatNumber} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Kosten</Label>
          <Input id="cost" name="cost" type="number" step="0.01" placeholder="0.00" defaultValue={defaults?.cost} />
        </div>
      </div>
    </>
  )
}

// ─── Helpers ────────────────────────────────────────────────

function getTypeLabels(ticketType: string) {
  return {
    carrier: ticketType === "FLIGHT" ? "Airline" : ticketType === "TRAIN" ? "Bahnunternehmen" : "Anbieter",
    carrierPlaceholder: ticketType === "FLIGHT" ? "z.B. Lufthansa" : ticketType === "TRAIN" ? "z.B. Deutsche Bahn" : "z.B. FlixBus",
    number: ticketType === "FLIGHT" ? "Flugnr." : ticketType === "TRAIN" ? "Zugnr." : "Nr.",
    numberPlaceholder: ticketType === "FLIGHT" ? "z.B. LH 123" : ticketType === "TRAIN" ? "z.B. ICE 578" : "z.B. 42A",
  }
}
