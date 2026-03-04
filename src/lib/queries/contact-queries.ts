import { prisma } from "@/lib/prisma"

export async function getContactsForTeam(teamId: string) {
  return prisma.contact.findMany({
    where: { teamId },
    include: {
      _count: { select: { venueContacts: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  })
}

export async function getContact(contactId: string) {
  return prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      team: { select: { id: true, name: true } },
      venueContacts: {
        include: {
          venue: { select: { id: true, name: true, city: true, country: true } },
        },
      },
    },
  })
}

export async function getContactsByCategory(teamId: string, category: string) {
  return prisma.contact.findMany({
    where: { teamId, category: category as never },
    include: {
      _count: { select: { venueContacts: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  })
}
