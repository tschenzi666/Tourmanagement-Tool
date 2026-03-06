import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { prisma } from "@/lib/prisma"
import { Ticket } from "lucide-react"
import { TravelTicketsClient } from "@/components/flights/travel-tickets-client"

export default async function TravelTicketsPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { id: true, name: true, currency: true },
  })

  if (!tour) notFound()

  const [tickets, crewMembers] = await Promise.all([
    prisma.travelTicket.findMany({
      where: { tourId },
      include: {
        crewMember: {
          select: { id: true, roleTitle: true, role: true, user: { select: { name: true } } },
        },
      },
      orderBy: { departureTime: "asc" },
    }),
    prisma.tourCrewMember.findMany({
      where: { tourId, isActive: true },
      select: { id: true, roleTitle: true, role: true, user: { select: { name: true } } },
      orderBy: { roleTitle: "asc" },
    }),
  ])

  const hasApiKey = !!process.env.AVIATIONSTACK_API_KEY

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Travel" },
        ]}
      />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Ticket className="h-7 w-7" />
              Travel
            </h1>
            <p className="text-muted-foreground mt-1">
              Alle Reisebuchungen deiner Crew auf einen Blick.
            </p>
          </div>
        </div>

        <TravelTicketsClient
          tourId={tourId}
          tickets={JSON.parse(JSON.stringify(tickets))}
          crewMembers={crewMembers}
          currency={tour.currency}
          hasApiKey={hasApiKey}
        />
      </div>
    </>
  )
}
