"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createVenueSchema, updateVenueSchema } from "@/lib/validations/venue"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user
}

async function getUserTeamId(userId: string) {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
    orderBy: { createdAt: "asc" },
  })
  if (!membership) throw new Error("No team found")
  return membership.teamId
}

export async function createVenue(formData: FormData) {
  const user = await requireAuth()
  const teamId = await getUserTeamId(user.id)

  const raw = {
    name: formData.get("name") as string,
    city: formData.get("city") as string,
    country: (formData.get("country") as string) || "US",
    address: (formData.get("address") as string) || undefined,
    postalCode: (formData.get("postalCode") as string) || undefined,
    capacity: (formData.get("capacity") as string) || undefined,
    venueType: (formData.get("venueType") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    wifiNetwork: (formData.get("wifiNetwork") as string) || undefined,
    wifiPassword: (formData.get("wifiPassword") as string) || undefined,
    loadInNotes: (formData.get("loadInNotes") as string) || undefined,
    parkingNotes: (formData.get("parkingNotes") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = createVenueSchema.parse(raw)

  const venue = await prisma.venue.create({
    data: {
      ...validated,
      email: validated.email || null,
      teamId,
    },
  })

  revalidatePath("/venues")
  redirect(`/venues/${venue.id}`)
}

export async function updateVenue(venueId: string, formData: FormData) {
  await requireAuth()

  const raw = {
    name: (formData.get("name") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    country: (formData.get("country") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    postalCode: (formData.get("postalCode") as string) || undefined,
    capacity: (formData.get("capacity") as string) || undefined,
    venueType: (formData.get("venueType") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    wifiNetwork: (formData.get("wifiNetwork") as string) || undefined,
    wifiPassword: (formData.get("wifiPassword") as string) || undefined,
    loadInNotes: (formData.get("loadInNotes") as string) || undefined,
    parkingNotes: (formData.get("parkingNotes") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const validated = updateVenueSchema.parse(raw)

  await prisma.venue.update({
    where: { id: venueId },
    data: {
      ...validated,
      email: validated.email || null,
    },
  })

  revalidatePath(`/venues/${venueId}`)
  revalidatePath("/venues")
}

export async function deleteVenue(venueId: string) {
  await requireAuth()

  await prisma.venue.delete({ where: { id: venueId } })

  revalidatePath("/venues")
  redirect("/venues")
}
