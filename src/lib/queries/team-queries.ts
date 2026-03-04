import { prisma } from "@/lib/prisma"

export async function getTeamsForUser(userId: string) {
  return prisma.team.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      _count: { select: { tours: true, members: true } },
    },
    orderBy: { createdAt: "asc" },
  })
}

export async function getTeamWithMembers(teamId: string) {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })
}
