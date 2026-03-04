"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export interface SearchResult {
  id: string
  title: string
  subtitle: string
  type: "tour" | "day" | "venue" | "contact" | "crew"
  href: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const session = await auth()
  if (!session?.user?.id) return []
  if (!query || query.length < 2) return []

  const membership = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    select: { teamId: true },
  })
  if (!membership) return []

  const results: SearchResult[] = []
  const q = query.toLowerCase()

  // Search tours
  const tours = await prisma.tour.findMany({
    where: {
      teamId: membership.teamId,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { artist: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, artist: true },
    take: 5,
  })
  for (const tour of tours) {
    results.push({
      id: tour.id,
      title: tour.name,
      subtitle: tour.artist || "Tour",
      type: "tour",
      href: `/tours/${tour.id}`,
    })
  }

  // Search venues
  const venues = await prisma.venue.findMany({
    where: {
      teamId: membership.teamId,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, city: true, country: true },
    take: 5,
  })
  for (const venue of venues) {
    results.push({
      id: venue.id,
      title: venue.name,
      subtitle: `${venue.city}, ${venue.country}`,
      type: "venue",
      href: `/venues/${venue.id}`,
    })
  }

  // Search contacts
  const contacts = await prisma.contact.findMany({
    where: {
      teamId: membership.teamId,
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, company: true, category: true },
    take: 5,
  })
  for (const contact of contacts) {
    results.push({
      id: contact.id,
      title: `${contact.firstName} ${contact.lastName}`,
      subtitle: contact.company || contact.category,
      type: "contact",
      href: `/contacts/${contact.id}`,
    })
  }

  // Search tour days
  const days = await prisma.tourDay.findMany({
    where: {
      tour: { teamId: membership.teamId },
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      city: true,
      dayType: true,
      tourId: true,
      tour: { select: { name: true } },
    },
    take: 5,
  })
  for (const day of days) {
    results.push({
      id: day.id,
      title: day.title || day.city || "Tour Day",
      subtitle: `${day.tour.name} — ${day.dayType}`,
      type: "day",
      href: `/tours/${day.tourId}/days/${day.id}`,
    })
  }

  // Search crew members
  const crew = await prisma.tourCrewMember.findMany({
    where: {
      tour: { teamId: membership.teamId },
      OR: [
        { roleTitle: { contains: q, mode: "insensitive" } },
        { department: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      roleTitle: true,
      department: true,
      role: true,
      tourId: true,
      tour: { select: { name: true } },
    },
    take: 5,
  })
  for (const member of crew) {
    results.push({
      id: member.id,
      title: member.roleTitle || member.role,
      subtitle: `${member.tour.name} — ${member.department || "Crew"}`,
      type: "crew",
      href: `/tours/${member.tourId}/crew/${member.id}`,
    })
  }

  return results.slice(0, 15)
}
