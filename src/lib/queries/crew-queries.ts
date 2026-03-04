import { prisma } from "@/lib/prisma"

export async function getTourCrew(tourId: string) {
  return prisma.tourCrewMember.findMany({
    where: { tourId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      _count: {
        select: {
          travelAssignments: true,
          roomAssignments: true,
          perDiemPayments: true,
        },
      },
    },
    orderBy: [{ department: "asc" }, { role: "asc" }, { roleTitle: "asc" }],
  })
}

export async function getCrewMember(crewMemberId: string) {
  return prisma.tourCrewMember.findUnique({
    where: { id: crewMemberId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, phone: true } },
      tour: { select: { id: true, name: true, artist: true, startDate: true, endDate: true, currency: true } },
      travelAssignments: {
        include: {
          travelLeg: {
            include: {
              tourDay: { select: { id: true, date: true, city: true, country: true } },
            },
          },
        },
        orderBy: { travelLeg: { departureTime: "asc" } },
      },
      roomAssignments: {
        include: {
          hotelStay: {
            include: {
              tourDay: { select: { id: true, date: true, city: true, country: true } },
            },
          },
        },
        orderBy: { hotelStay: { checkIn: "asc" } },
      },
      perDiemPayments: {
        orderBy: { date: "asc" },
      },
    },
  })
}

export async function getTourCrewForAssignment(tourId: string) {
  return prisma.tourCrewMember.findMany({
    where: { tourId, isActive: true },
    select: {
      id: true,
      roleTitle: true,
      role: true,
      user: { select: { name: true } },
    },
    orderBy: { roleTitle: "asc" },
  })
}

// Get all travel legs for a tour (for assigning crew)
export async function getTourTravelLegs(tourId: string) {
  return prisma.travelLeg.findMany({
    where: { tourDay: { tourId } },
    include: {
      tourDay: { select: { id: true, date: true, city: true, country: true } },
      _count: { select: { passengers: true } },
    },
    orderBy: { departureTime: "asc" },
  })
}

// Get all hotel stays for a tour (for room assignments)
export async function getTourHotelStays(tourId: string) {
  return prisma.hotelStay.findMany({
    where: { tourDay: { tourId } },
    include: {
      tourDay: { select: { id: true, date: true, city: true, country: true } },
      roomAssignments: {
        include: {
          crewMember: {
            select: { id: true, roleTitle: true, role: true, user: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { checkIn: "asc" },
  })
}
