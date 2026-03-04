"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createTourSchema, updateTourSchema } from "@/lib/validations/tour"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function getSessionUser() {
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

export async function createTour(formData: FormData) {
  const user = await getSessionUser()
  const teamId = await getUserTeamId(user.id)

  const raw = {
    name: formData.get("name") as string,
    artist: (formData.get("artist") as string) || undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
    currency: (formData.get("currency") as string) || "USD",
    description: (formData.get("description") as string) || undefined,
  }

  const validated = createTourSchema.parse(raw)

  const tour = await prisma.tour.create({
    data: {
      name: validated.name,
      artist: validated.artist,
      description: validated.description,
      currency: validated.currency,
      startDate: validated.startDate ? new Date(validated.startDate) : undefined,
      endDate: validated.endDate ? new Date(validated.endDate) : undefined,
      teamId,
      createdById: user.id,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/tours")
  redirect(`/tours/${tour.id}`)
}

export async function updateTour(tourId: string, formData: FormData) {
  await getSessionUser()

  const raw = {
    name: (formData.get("name") as string) || undefined,
    artist: (formData.get("artist") as string) || undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
    currency: (formData.get("currency") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    status: (formData.get("status") as string) || undefined,
  }

  const validated = updateTourSchema.parse(raw)

  await prisma.tour.update({
    where: { id: tourId },
    data: {
      ...validated,
      startDate: validated.startDate ? new Date(validated.startDate) : undefined,
      endDate: validated.endDate ? new Date(validated.endDate) : undefined,
    },
  })

  revalidatePath(`/tours/${tourId}`)
  revalidatePath("/dashboard")
}

export async function deleteTour(tourId: string) {
  await getSessionUser()

  await prisma.tour.delete({
    where: { id: tourId },
  })

  revalidatePath("/dashboard")
  revalidatePath("/tours")
  redirect("/dashboard")
}
