"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import {
  createTourDaySchema,
  updateTourDaySchema,
  createScheduleItemSchema,
  createTravelLegSchema,
  createHotelStaySchema,
} from "@/lib/validations/tour-day"
import { revalidatePath } from "next/cache"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user
}

// ============================================================
// TOUR DAY ACTIONS
// ============================================================

export async function createTourDay(tourId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    date: formData.get("date") as string,
    dayType: formData.get("dayType") as string,
    title: (formData.get("title") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    country: (formData.get("country") as string) || undefined,
    venueId: (formData.get("venueId") as string) || undefined,
    isConfirmed: formData.get("isConfirmed") === "true",
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = createTourDaySchema.parse(raw)

  // Auto-calculate day number
  const existingDays = await prisma.tourDay.count({ where: { tourId } })

  await prisma.tourDay.create({
    data: {
      date: new Date(validated.date),
      dayType: validated.dayType,
      title: validated.title,
      city: validated.city,
      country: validated.country,
      isConfirmed: validated.isConfirmed ?? false,
      notes: validated.notes,
      dayNumber: existingDays + 1,
      tourId,
      venueId: validated.venueId || null,
    },
  })

  revalidatePath(`/tours/${tourId}/schedule`)
  revalidatePath(`/tours/${tourId}`)
}

export async function updateTourDay(dayId: string, tourId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    date: (formData.get("date") as string) || undefined,
    dayType: (formData.get("dayType") as string) || undefined,
    title: (formData.get("title") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    country: (formData.get("country") as string) || undefined,
    venueId: (formData.get("venueId") as string) || undefined,
    isConfirmed: formData.has("isConfirmed") ? formData.get("isConfirmed") === "true" : undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = updateTourDaySchema.parse(raw)

  await prisma.tourDay.update({
    where: { id: dayId },
    data: {
      ...validated,
      date: validated.date ? new Date(validated.date) : undefined,
      venueId: validated.venueId || undefined,
    },
  })

  revalidatePath(`/tours/${tourId}/schedule`)
  revalidatePath(`/tours/${tourId}/days/${dayId}`)
}

export async function deleteTourDay(dayId: string, tourId: string) {
  await requireAuth()

  await prisma.tourDay.delete({ where: { id: dayId } })

  revalidatePath(`/tours/${tourId}/schedule`)
  revalidatePath(`/tours/${tourId}`)
}

// ============================================================
// SCHEDULE ITEM ACTIONS
// ============================================================

export async function createScheduleItem(tourDayId: string, tourId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    type: formData.get("type") as string,
    label: formData.get("label") as string,
    startTime: (formData.get("startTime") as string) || undefined,
    endTime: (formData.get("endTime") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = createScheduleItemSchema.parse(raw)

  // Get next sort order
  const maxOrder = await prisma.scheduleItem.aggregate({
    where: { tourDayId },
    _max: { sortOrder: true },
  })

  await prisma.scheduleItem.create({
    data: {
      type: validated.type,
      label: validated.label,
      startTime: validated.startTime ? parseTimeToDate(validated.startTime) : null,
      endTime: validated.endTime ? parseTimeToDate(validated.endTime) : null,
      notes: validated.notes,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      tourDayId,
    },
  })

  revalidatePath(`/tours/${tourId}/days`)
}

export async function deleteScheduleItem(itemId: string, tourId: string) {
  await requireAuth()

  await prisma.scheduleItem.delete({ where: { id: itemId } })

  revalidatePath(`/tours/${tourId}/days`)
}

// ============================================================
// TRAVEL LEG ACTIONS
// ============================================================

export async function createTravelLeg(tourDayId: string, tourId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    mode: formData.get("mode") as string,
    departureCity: (formData.get("departureCity") as string) || undefined,
    arrivalCity: (formData.get("arrivalCity") as string) || undefined,
    departureTime: (formData.get("departureTime") as string) || undefined,
    arrivalTime: (formData.get("arrivalTime") as string) || undefined,
    carrier: (formData.get("carrier") as string) || undefined,
    flightNumber: (formData.get("flightNumber") as string) || undefined,
    confirmationCode: (formData.get("confirmationCode") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = createTravelLegSchema.parse(raw)

  const maxOrder = await prisma.travelLeg.aggregate({
    where: { tourDayId },
    _max: { sortOrder: true },
  })

  await prisma.travelLeg.create({
    data: {
      mode: validated.mode,
      departureCity: validated.departureCity,
      arrivalCity: validated.arrivalCity,
      departureTime: validated.departureTime ? new Date(validated.departureTime) : null,
      arrivalTime: validated.arrivalTime ? new Date(validated.arrivalTime) : null,
      carrier: validated.carrier,
      flightNumber: validated.flightNumber,
      confirmationCode: validated.confirmationCode,
      notes: validated.notes,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      tourDayId,
    },
  })

  revalidatePath(`/tours/${tourId}/days`)
}

export async function deleteTravelLeg(legId: string, tourId: string) {
  await requireAuth()

  await prisma.travelLeg.delete({ where: { id: legId } })

  revalidatePath(`/tours/${tourId}/days`)
}

// ============================================================
// HOTEL STAY ACTIONS
// ============================================================

export async function createHotelStay(tourDayId: string, tourId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    hotelName: formData.get("hotelName") as string,
    address: (formData.get("address") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    checkIn: (formData.get("checkIn") as string) || undefined,
    checkOut: (formData.get("checkOut") as string) || undefined,
    confirmationCode: (formData.get("confirmationCode") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = createHotelStaySchema.parse(raw)

  await prisma.hotelStay.create({
    data: {
      hotelName: validated.hotelName,
      address: validated.address,
      city: validated.city,
      phone: validated.phone,
      email: validated.email || null,
      website: validated.website,
      checkIn: validated.checkIn ? new Date(validated.checkIn) : null,
      checkOut: validated.checkOut ? new Date(validated.checkOut) : null,
      confirmationCode: validated.confirmationCode,
      notes: validated.notes,
      tourDayId,
    },
  })

  revalidatePath(`/tours/${tourId}/days`)
}

export async function deleteHotelStay(stayId: string, tourId: string) {
  await requireAuth()

  await prisma.hotelStay.delete({ where: { id: stayId } })

  revalidatePath(`/tours/${tourId}/days`)
}

// ============================================================
// HELPERS
// ============================================================

function parseTimeToDate(timeStr: string): Date {
  // Convert "HH:MM" to a Date (Prisma Time fields use 1970-01-01)
  const [hours, minutes] = timeStr.split(":").map(Number)
  const date = new Date(1970, 0, 1, hours, minutes, 0)
  return date
}
