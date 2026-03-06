"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user
}

const AVIATIONSTACK_BASE = "https://api.aviationstack.com/v1"

interface AviationStackFlight {
  flight_date: string
  flight_status: string
  departure: {
    airport: string
    timezone: string
    iata: string
    icao: string
    terminal: string | null
    gate: string | null
    delay: number | null
    scheduled: string | null
    estimated: string | null
    actual: string | null
  }
  arrival: {
    airport: string
    timezone: string
    iata: string
    icao: string
    terminal: string | null
    gate: string | null
    baggage: string | null
    delay: number | null
    scheduled: string | null
    estimated: string | null
    actual: string | null
  }
  airline: {
    name: string
    iata: string
    icao: string
  }
  flight: {
    number: string
    iata: string
    icao: string
  }
}

interface AviationStackResponse {
  pagination: { limit: number; offset: number; count: number; total: number }
  data: AviationStackFlight[]
}

function parseFlightNumber(serviceNumber: string): { iata: string } | null {
  // Normalize: "LH 123" -> "LH123", "LH123" -> "LH123"
  const cleaned = serviceNumber.replace(/\s+/g, "").toUpperCase()
  // Match IATA format: 2-letter code + 1-4 digit number
  const match = cleaned.match(/^([A-Z0-9]{2})(\d{1,4})$/)
  if (match) {
    return { iata: `${match[1]}${match[2]}` }
  }
  return null
}

export async function checkFlightStatus(tourId: string, ticketId: string) {
  await requireAuth()

  const apiKey = process.env.AVIATIONSTACK_API_KEY
  if (!apiKey) {
    throw new Error("AVIATIONSTACK_API_KEY nicht konfiguriert. Bitte in den Umgebungsvariablen hinterlegen.")
  }

  const ticket = await prisma.travelTicket.findUnique({
    where: { id: ticketId },
  })

  if (!ticket) throw new Error("Ticket nicht gefunden")
  if (ticket.ticketType !== "FLIGHT") throw new Error("Nur für Flugtickets verfügbar")
  if (!ticket.serviceNumber) throw new Error("Keine Flugnummer hinterlegt")

  const parsed = parseFlightNumber(ticket.serviceNumber)
  if (!parsed) throw new Error(`Ungültige Flugnummer: ${ticket.serviceNumber}`)

  // Build query params
  const params = new URLSearchParams({
    access_key: apiKey,
    flight_iata: parsed.iata,
  })

  // Add flight date if available
  if (ticket.departureTime) {
    const d = new Date(ticket.departureTime)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    params.set("flight_date", dateStr)
  }

  const url = `${AVIATIONSTACK_BASE}/flights?${params.toString()}`

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`API-Fehler: ${res.status}`)
  }

  const json = (await res.json()) as AviationStackResponse

  if (!json.data || json.data.length === 0) {
    // No flight found - update lastChecked anyway
    await prisma.travelTicket.update({
      where: { id: ticketId },
      data: {
        liveStatus: "not_found",
        liveLastChecked: new Date(),
      },
    })
    revalidatePath(`/tours/${tourId}/flights`)
    return { status: "not_found", message: "Kein Flug mit dieser Nummer gefunden" }
  }

  // Take the first (best) match
  const flight = json.data[0]

  // Update the ticket with live data
  await prisma.travelTicket.update({
    where: { id: ticketId },
    data: {
      liveStatus: flight.flight_status || null,
      liveDelay: flight.departure.delay ?? flight.arrival.delay ?? null,
      liveDepartureGate: flight.departure.gate || null,
      liveDepartureTerminal: flight.departure.terminal || null,
      liveArrivalGate: flight.arrival.gate || null,
      liveArrivalTerminal: flight.arrival.terminal || null,
      liveArrivalBaggage: flight.arrival.baggage || null,
      liveScheduledDep: flight.departure.scheduled ? new Date(flight.departure.scheduled) : null,
      liveEstimatedDep: flight.departure.estimated ? new Date(flight.departure.estimated) : null,
      liveActualDep: flight.departure.actual ? new Date(flight.departure.actual) : null,
      liveScheduledArr: flight.arrival.scheduled ? new Date(flight.arrival.scheduled) : null,
      liveEstimatedArr: flight.arrival.estimated ? new Date(flight.arrival.estimated) : null,
      liveActualArr: flight.arrival.actual ? new Date(flight.arrival.actual) : null,
      liveLastChecked: new Date(),
    },
  })

  revalidatePath(`/tours/${tourId}/flights`)

  return {
    status: flight.flight_status,
    delay: flight.departure.delay,
    gate: flight.departure.gate,
    terminal: flight.departure.terminal,
  }
}

export async function checkAllFlightStatuses(tourId: string) {
  await requireAuth()

  const apiKey = process.env.AVIATIONSTACK_API_KEY
  if (!apiKey) {
    throw new Error("AVIATIONSTACK_API_KEY nicht konfiguriert")
  }

  const tickets = await prisma.travelTicket.findMany({
    where: {
      tourId,
      ticketType: "FLIGHT",
      serviceNumber: { not: null },
    },
  })

  // Filter to only tickets that haven't been checked in the last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  const toCheck = tickets.filter(
    (t) => !t.liveLastChecked || t.liveLastChecked < tenMinutesAgo
  )

  let checked = 0
  let errors = 0

  for (const ticket of toCheck) {
    try {
      await checkFlightStatus(tourId, ticket.id)
      checked++
    } catch {
      errors++
    }
    // Small delay between requests to be nice to the API
    if (toCheck.indexOf(ticket) < toCheck.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  revalidatePath(`/tours/${tourId}/flights`)
  return { checked, errors, skipped: tickets.length - toCheck.length }
}
