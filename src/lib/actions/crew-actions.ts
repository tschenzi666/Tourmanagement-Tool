"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createCrewMemberSchema } from "@/lib/validations/crew"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user
}

export async function createCrewMember(tourId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    roleTitle: formData.get("roleTitle") as string,
    role: (formData.get("role") as string) || "OTHER",
    department: (formData.get("department") as string) || undefined,
    dailyRate: (formData.get("dailyRate") as string) || undefined,
    perDiem: (formData.get("perDiem") as string) || undefined,
    currency: (formData.get("currency") as string) || "USD",
    dateOfBirth: (formData.get("dateOfBirth") as string) || undefined,
    nationality: (formData.get("nationality") as string) || undefined,
    passportNumber: (formData.get("passportNumber") as string) || undefined,
    passportExpiry: (formData.get("passportExpiry") as string) || undefined,
    dietaryNeeds: (formData.get("dietaryNeeds") as string) || undefined,
    tShirtSize: (formData.get("tShirtSize") as string) || undefined,
    allergies: (formData.get("allergies") as string) || undefined,
    emergencyName: (formData.get("emergencyName") as string) || undefined,
    emergencyPhone: (formData.get("emergencyPhone") as string) || undefined,
    emergencyRelation: (formData.get("emergencyRelation") as string) || undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    userId: (formData.get("userId") as string) || undefined,
  }

  const validated = createCrewMemberSchema.parse(raw)

  const crewMember = await prisma.tourCrewMember.create({
    data: {
      roleTitle: validated.roleTitle,
      role: validated.role as "TOUR_MANAGER" | "PRODUCTION_MANAGER" | "STAGE_MANAGER" | "FOH_ENGINEER" | "MONITOR_ENGINEER" | "LIGHTING_DESIGNER" | "LIGHTING_TECH" | "BACKLINE_TECH" | "DRUM_TECH" | "GUITAR_TECH" | "BASS_TECH" | "KEYS_TECH" | "RIGGER" | "CARPENTER" | "VIDEO_DIRECTOR" | "VIDEO_TECH" | "MERCH_MANAGER" | "TOUR_ACCOUNTANT" | "SECURITY" | "WARDROBE" | "HAIR_MAKEUP" | "CATERING" | "BUS_DRIVER" | "TRUCK_DRIVER" | "ARTIST" | "MUSICIAN" | "DANCER" | "PHOTOGRAPHER" | "OTHER",
      department: validated.department || null,
      dailyRate: typeof validated.dailyRate === "number" ? validated.dailyRate : null,
      perDiem: typeof validated.perDiem === "number" ? validated.perDiem : null,
      currency: validated.currency,
      dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
      nationality: validated.nationality || null,
      passportNumber: validated.passportNumber || null,
      passportExpiry: validated.passportExpiry ? new Date(validated.passportExpiry) : null,
      dietaryNeeds: validated.dietaryNeeds || null,
      tShirtSize: validated.tShirtSize || null,
      allergies: validated.allergies || null,
      emergencyName: validated.emergencyName || null,
      emergencyPhone: validated.emergencyPhone || null,
      emergencyRelation: validated.emergencyRelation || null,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      notes: validated.notes || null,
      userId: validated.userId || null,
      tourId,
    },
  })

  revalidatePath(`/tours/${tourId}/crew`)
  redirect(`/tours/${tourId}/crew/${crewMember.id}`)
}

export async function updateCrewMember(tourId: string, crewMemberId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    roleTitle: formData.get("roleTitle") as string,
    role: (formData.get("role") as string) || "OTHER",
    department: (formData.get("department") as string) || undefined,
    dailyRate: (formData.get("dailyRate") as string) || undefined,
    perDiem: (formData.get("perDiem") as string) || undefined,
    currency: (formData.get("currency") as string) || "USD",
    dateOfBirth: (formData.get("dateOfBirth") as string) || undefined,
    nationality: (formData.get("nationality") as string) || undefined,
    passportNumber: (formData.get("passportNumber") as string) || undefined,
    passportExpiry: (formData.get("passportExpiry") as string) || undefined,
    dietaryNeeds: (formData.get("dietaryNeeds") as string) || undefined,
    tShirtSize: (formData.get("tShirtSize") as string) || undefined,
    allergies: (formData.get("allergies") as string) || undefined,
    emergencyName: (formData.get("emergencyName") as string) || undefined,
    emergencyPhone: (formData.get("emergencyPhone") as string) || undefined,
    emergencyRelation: (formData.get("emergencyRelation") as string) || undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = createCrewMemberSchema.parse(raw)

  await prisma.tourCrewMember.update({
    where: { id: crewMemberId },
    data: {
      roleTitle: validated.roleTitle,
      role: validated.role as "TOUR_MANAGER" | "PRODUCTION_MANAGER" | "STAGE_MANAGER" | "FOH_ENGINEER" | "MONITOR_ENGINEER" | "LIGHTING_DESIGNER" | "LIGHTING_TECH" | "BACKLINE_TECH" | "DRUM_TECH" | "GUITAR_TECH" | "BASS_TECH" | "KEYS_TECH" | "RIGGER" | "CARPENTER" | "VIDEO_DIRECTOR" | "VIDEO_TECH" | "MERCH_MANAGER" | "TOUR_ACCOUNTANT" | "SECURITY" | "WARDROBE" | "HAIR_MAKEUP" | "CATERING" | "BUS_DRIVER" | "TRUCK_DRIVER" | "ARTIST" | "MUSICIAN" | "DANCER" | "PHOTOGRAPHER" | "OTHER",
      department: validated.department || null,
      dailyRate: typeof validated.dailyRate === "number" ? validated.dailyRate : null,
      perDiem: typeof validated.perDiem === "number" ? validated.perDiem : null,
      currency: validated.currency,
      dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
      nationality: validated.nationality || null,
      passportNumber: validated.passportNumber || null,
      passportExpiry: validated.passportExpiry ? new Date(validated.passportExpiry) : null,
      dietaryNeeds: validated.dietaryNeeds || null,
      tShirtSize: validated.tShirtSize || null,
      allergies: validated.allergies || null,
      emergencyName: validated.emergencyName || null,
      emergencyPhone: validated.emergencyPhone || null,
      emergencyRelation: validated.emergencyRelation || null,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      notes: validated.notes || null,
    },
  })

  revalidatePath(`/tours/${tourId}/crew`)
  revalidatePath(`/tours/${tourId}/crew/${crewMemberId}`)
}

export async function deleteCrewMember(tourId: string, crewMemberId: string) {
  await requireAuth()

  await prisma.tourCrewMember.delete({ where: { id: crewMemberId } })

  revalidatePath(`/tours/${tourId}/crew`)
  redirect(`/tours/${tourId}/crew`)
}

export async function toggleCrewMemberActive(tourId: string, crewMemberId: string) {
  await requireAuth()

  const member = await prisma.tourCrewMember.findUnique({
    where: { id: crewMemberId },
    select: { isActive: true },
  })
  if (!member) throw new Error("Crew member not found")

  await prisma.tourCrewMember.update({
    where: { id: crewMemberId },
    data: { isActive: !member.isActive },
  })

  revalidatePath(`/tours/${tourId}/crew`)
  revalidatePath(`/tours/${tourId}/crew/${crewMemberId}`)
}

// Travel Assignment actions
export async function assignCrewToTravel(tourId: string, travelLegId: string, crewMemberIds: string[]) {
  await requireAuth()

  // Remove existing assignments for this travel leg
  await prisma.travelAssignment.deleteMany({ where: { travelLegId } })

  // Create new assignments
  if (crewMemberIds.length > 0) {
    await prisma.travelAssignment.createMany({
      data: crewMemberIds.map((crewMemberId) => ({
        travelLegId,
        crewMemberId,
      })),
    })
  }

  revalidatePath(`/tours/${tourId}/crew`)
}

// Room Assignment actions
export async function assignCrewToRoom(
  tourId: string,
  hotelStayId: string,
  crewMemberId: string,
  roomNumber?: string,
  roomType?: string
) {
  await requireAuth()

  await prisma.roomAssignment.upsert({
    where: {
      hotelStayId_crewMemberId: { hotelStayId, crewMemberId },
    },
    update: { roomNumber: roomNumber || null, roomType: roomType || null },
    create: {
      hotelStayId,
      crewMemberId,
      roomNumber: roomNumber || null,
      roomType: roomType || null,
    },
  })

  revalidatePath(`/tours/${tourId}/crew`)
}

export async function removeCrewFromRoom(tourId: string, hotelStayId: string, crewMemberId: string) {
  await requireAuth()

  await prisma.roomAssignment.delete({
    where: {
      hotelStayId_crewMemberId: { hotelStayId, crewMemberId },
    },
  })

  revalidatePath(`/tours/${tourId}/crew`)
}

// ─── Crew Contact Actions ────────────────────────────────────

export async function createCrewContact(
  tourId: string,
  crewMemberId: string,
  data: { name: string; role: string; company?: string; phone?: string; email?: string; notes?: string }
) {
  await requireAuth()

  await prisma.crewContact.create({
    data: {
      name: data.name,
      role: data.role,
      company: data.company || null,
      phone: data.phone || null,
      email: data.email || null,
      notes: data.notes || null,
      crewMemberId,
    },
  })

  revalidatePath(`/tours/${tourId}/crew/${crewMemberId}`)
}

export async function deleteCrewContact(tourId: string, crewMemberId: string, contactId: string) {
  await requireAuth()

  await prisma.crewContact.delete({ where: { id: contactId } })

  revalidatePath(`/tours/${tourId}/crew/${crewMemberId}`)
}

// ─── Add Team Members as Crew ────────────────────────────────

export async function addTeamMembersAsCrew(
  tourId: string,
  members: Array<{ userId: string; name: string; role: string }>
) {
  await requireAuth()

  const results = []

  for (const member of members) {
    // Check if already on this tour
    const existing = await prisma.tourCrewMember.findUnique({
      where: { userId_tourId: { userId: member.userId, tourId } },
    })
    if (existing) continue

    const crewMember = await prisma.tourCrewMember.create({
      data: {
        roleTitle: member.name,
        role: member.role as "TOUR_MANAGER" | "PRODUCTION_MANAGER" | "STAGE_MANAGER" | "FOH_ENGINEER" | "MONITOR_ENGINEER" | "LIGHTING_DESIGNER" | "LIGHTING_TECH" | "BACKLINE_TECH" | "DRUM_TECH" | "GUITAR_TECH" | "BASS_TECH" | "KEYS_TECH" | "RIGGER" | "CARPENTER" | "VIDEO_DIRECTOR" | "VIDEO_TECH" | "MERCH_MANAGER" | "TOUR_ACCOUNTANT" | "SECURITY" | "WARDROBE" | "HAIR_MAKEUP" | "CATERING" | "BUS_DRIVER" | "TRUCK_DRIVER" | "ARTIST" | "MUSICIAN" | "DANCER" | "PHOTOGRAPHER" | "OTHER",
        userId: member.userId,
        tourId,
      },
    })
    results.push(crewMember)
  }

  revalidatePath(`/tours/${tourId}/crew`)
  return { added: results.length }
}

// ─── Flight Ticket Actions ───────────────────────────────────

export async function createTravelTicket(
  tourId: string,
  data: {
    crewMemberId: string
    ticketType?: string
    carrier: string
    serviceNumber?: string
    departureCity: string
    arrivalCity: string
    departureTime?: string
    arrivalTime?: string
    bookingReference?: string
    ticketNumber?: string
    seatNumber?: string
    baggageAllowance?: string
    cost?: number
    currency?: string
    notes?: string
  }
) {
  await requireAuth()

  await prisma.travelTicket.create({
    data: {
      ticketType: data.ticketType || "FLIGHT",
      carrier: data.carrier,
      serviceNumber: data.serviceNumber || null,
      departureCity: data.departureCity,
      arrivalCity: data.arrivalCity,
      departureTime: data.departureTime ? new Date(data.departureTime) : null,
      arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : null,
      bookingReference: data.bookingReference || null,
      ticketNumber: data.ticketNumber || null,
      seatNumber: data.seatNumber || null,
      baggageAllowance: data.baggageAllowance || null,
      cost: data.cost ?? null,
      currency: data.currency || "USD",
      notes: data.notes || null,
      crewMemberId: data.crewMemberId,
      tourId,
    },
  })

  revalidatePath(`/tours/${tourId}/travel-tickets`)
  revalidatePath(`/tours/${tourId}/crew/${data.crewMemberId}`)
}

export async function deleteTravelTicket(tourId: string, ticketId: string) {
  await requireAuth()

  await prisma.travelTicket.delete({ where: { id: ticketId } })

  revalidatePath(`/tours/${tourId}/travel-tickets`)
}

// ─── CSV Import for Expenses ─────────────────────────────────

export async function importExpensesFromCsv(
  tourId: string,
  expenses: Array<{
    description: string
    amount: number
    currency?: string
    category?: string
    date: string
    vendor?: string
    notes?: string
  }>
) {
  await requireAuth()

  const validCategories = [
    "TRAVEL", "ACCOMMODATION", "CATERING", "EQUIPMENT", "VEHICLE",
    "FUEL", "TOLLS", "PARKING", "COMMUNICATION", "PER_DIEM",
    "PRODUCTION", "MERCH", "INSURANCE", "VISA", "MISCELLANEOUS", "OTHER",
  ]

  const data = expenses.map((exp) => ({
    description: exp.description,
    amount: exp.amount,
    currency: exp.currency || "USD",
    category: (validCategories.includes(exp.category?.toUpperCase() || "")
      ? exp.category!.toUpperCase()
      : "OTHER") as "TRAVEL" | "ACCOMMODATION" | "CATERING" | "EQUIPMENT" | "VEHICLE" | "FUEL" | "TOLLS" | "PARKING" | "COMMUNICATION" | "PER_DIEM" | "PRODUCTION" | "MERCH" | "INSURANCE" | "VISA" | "MISCELLANEOUS" | "OTHER",
    date: new Date(exp.date),
    vendor: exp.vendor || null,
    notes: exp.notes || null,
    tourId,
  }))

  await prisma.expense.createMany({ data })

  revalidatePath(`/tours/${tourId}/finances`)
  return { imported: data.length }
}
