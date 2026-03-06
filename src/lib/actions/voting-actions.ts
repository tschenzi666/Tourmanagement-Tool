"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user
}

export async function createVotingSession(formData: FormData) {
  const user = await requireAuth()

  const tourId = formData.get("tourId") as string
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || undefined
  const city = (formData.get("city") as string) || undefined
  const dateStr = formData.get("date") as string
  const closesAtStr = formData.get("closesAt") as string

  if (!tourId || !title) throw new Error("Tour and title are required")

  const session = await prisma.votingSession.create({
    data: {
      title,
      description,
      city,
      date: dateStr ? new Date(dateStr) : undefined,
      closesAt: closesAtStr ? new Date(closesAtStr) : undefined,
      tourId,
      createdById: user.id,
    },
  })

  revalidatePath(`/tours/${tourId}/voting`)
  redirect(`/tours/${tourId}/voting/${session.id}`)
}

export async function closeVotingSession(sessionId: string, tourId: string) {
  await requireAuth()

  await prisma.votingSession.update({
    where: { id: sessionId },
    data: { status: "CLOSED" },
  })

  revalidatePath(`/tours/${tourId}/voting/${sessionId}`)
  revalidatePath(`/tours/${tourId}/voting`)
}

export async function reopenVotingSession(sessionId: string, tourId: string) {
  await requireAuth()

  await prisma.votingSession.update({
    where: { id: sessionId },
    data: { status: "OPEN" },
  })

  revalidatePath(`/tours/${tourId}/voting/${sessionId}`)
  revalidatePath(`/tours/${tourId}/voting`)
}

export async function deleteVotingSession(sessionId: string, tourId: string) {
  await requireAuth()

  await prisma.votingSession.delete({ where: { id: sessionId } })

  revalidatePath(`/tours/${tourId}/voting`)
  redirect(`/tours/${tourId}/voting`)
}

export async function addSuggestion(formData: FormData) {
  const user = await requireAuth()

  const sessionId = formData.get("sessionId") as string
  const tourId = formData.get("tourId") as string
  const name = formData.get("name") as string
  const address = (formData.get("address") as string) || undefined
  const city = (formData.get("city") as string) || undefined
  const country = (formData.get("country") as string) || undefined
  const category = (formData.get("category") as string) || undefined
  const latitude = formData.get("latitude") as string
  const longitude = formData.get("longitude") as string
  const osmId = (formData.get("osmId") as string) || undefined
  const website = (formData.get("website") as string) || undefined
  const phone = (formData.get("phone") as string) || undefined
  const note = (formData.get("note") as string) || undefined

  if (!sessionId || !name) throw new Error("Session and name are required")

  await prisma.venueSuggestion.create({
    data: {
      name,
      address,
      city,
      country,
      category,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      osmId,
      website,
      phone,
      note,
      sessionId,
      suggestedById: user.id,
    },
  })

  revalidatePath(`/tours/${tourId}/voting/${sessionId}`)
}

export async function toggleVote(suggestionId: string, tourId: string, sessionId: string) {
  const user = await requireAuth()

  const existing = await prisma.vote.findUnique({
    where: {
      suggestionId_userId: {
        suggestionId,
        userId: user.id,
      },
    },
  })

  if (existing) {
    await prisma.vote.delete({ where: { id: existing.id } })
  } else {
    await prisma.vote.create({
      data: {
        suggestionId,
        userId: user.id,
      },
    })
  }

  revalidatePath(`/tours/${tourId}/voting/${sessionId}`)
}

export async function removeSuggestion(suggestionId: string, tourId: string, sessionId: string) {
  await requireAuth()

  await prisma.venueSuggestion.delete({ where: { id: suggestionId } })

  revalidatePath(`/tours/${tourId}/voting/${sessionId}`)
}
