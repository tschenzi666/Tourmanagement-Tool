import { prisma } from "@/lib/prisma"

export async function getToursForTeam(teamId: string) {
  return prisma.tour.findMany({
    where: { teamId },
    include: {
      _count: { select: { tourDays: true, crewMembers: true } },
    },
    orderBy: { startDate: "desc" },
  })
}

export async function getTour(tourId: string) {
  return prisma.tour.findUnique({
    where: { id: tourId },
    include: {
      team: true,
      _count: {
        select: { tourDays: true, crewMembers: true, expenses: true },
      },
    },
  })
}

export async function getToursForUser(userId: string) {
  return prisma.tour.findMany({
    where: {
      team: { members: { some: { userId } } },
    },
    include: {
      team: { select: { id: true, name: true, slug: true } },
      _count: { select: { tourDays: true, crewMembers: true } },
    },
    orderBy: { startDate: "desc" },
  })
}
