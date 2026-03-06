import { prisma } from "@/lib/prisma"

export async function getVotingSessionsForTour(tourId: string) {
  return prisma.votingSession.findMany({
    where: { tourId },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { suggestions: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getVotingSession(sessionId: string) {
  return prisma.votingSession.findUnique({
    where: { id: sessionId },
    include: {
      createdBy: { select: { id: true, name: true } },
      tour: { select: { id: true, name: true } },
      suggestions: {
        include: {
          suggestedBy: { select: { id: true, name: true } },
          votes: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })
}
