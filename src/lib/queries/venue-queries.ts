import { prisma } from "@/lib/prisma"

export async function getVenuesForTeam(teamId: string) {
  return prisma.venue.findMany({
    where: { teamId },
    include: {
      _count: { select: { tourDays: true, contacts: true } },
    },
    orderBy: { name: "asc" },
  })
}

export async function getVenue(venueId: string) {
  return prisma.venue.findUnique({
    where: { id: venueId },
    include: {
      team: { select: { id: true, name: true } },
      tourDays: {
        include: {
          tour: { select: { id: true, name: true, artist: true } },
        },
        orderBy: { date: "desc" },
        take: 10,
      },
      contacts: {
        include: {
          contact: true,
        },
      },
    },
  })
}

export async function searchVenues(teamId: string, query: string) {
  return prisma.venue.findMany({
    where: {
      teamId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
        { country: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      _count: { select: { tourDays: true } },
    },
    orderBy: { name: "asc" },
  })
}
