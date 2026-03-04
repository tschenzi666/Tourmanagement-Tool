import { prisma } from "@/lib/prisma"

export async function getTourDays(tourId: string) {
  return prisma.tourDay.findMany({
    where: { tourId },
    include: {
      venue: { select: { id: true, name: true, city: true, country: true, capacity: true } },
      _count: { select: { scheduleItems: true, travelLegs: true, guestListItems: true } },
    },
    orderBy: { date: "asc" },
  })
}

export async function getTourDay(dayId: string) {
  return prisma.tourDay.findUnique({
    where: { id: dayId },
    include: {
      tour: { select: { id: true, name: true, artist: true, currency: true } },
      venue: true,
      scheduleItems: { orderBy: { sortOrder: "asc" } },
      travelLegs: { orderBy: { sortOrder: "asc" } },
      hotelStay: { include: { roomAssignments: true } },
      guestListItems: { orderBy: { createdAt: "desc" } },
      dayNotes: { orderBy: { createdAt: "desc" } },
    },
  })
}

export async function getAdjacentDays(tourId: string, currentDate: Date) {
  const [prevDay, nextDay] = await Promise.all([
    prisma.tourDay.findFirst({
      where: { tourId, date: { lt: currentDate } },
      orderBy: { date: "desc" },
      select: { id: true, date: true, title: true, dayType: true },
    }),
    prisma.tourDay.findFirst({
      where: { tourId, date: { gt: currentDate } },
      orderBy: { date: "asc" },
      select: { id: true, date: true, title: true, dayType: true },
    }),
  ])
  return { prevDay, nextDay }
}

export async function getTourDaysForMap(tourId: string) {
  return prisma.tourDay.findMany({
    where: { tourId },
    include: {
      venue: {
        select: {
          name: true,
          city: true,
          country: true,
          latitude: true,
          longitude: true,
        },
      },
    },
    orderBy: { date: "asc" },
  })
}
