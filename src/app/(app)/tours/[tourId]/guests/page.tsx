import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { getTour } from "@/lib/queries/tour-queries"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle2, Clock, XCircle, UserCheck } from "lucide-react"
import { format } from "date-fns"

export default async function GuestListPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const tour = await getTour(tourId)

  if (!tour) notFound()

  // Get all tour days with their guest list items
  const days = await prisma.tourDay.findMany({
    where: { tourId },
    include: {
      venue: { select: { name: true } },
      guestListItems: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { date: "asc" },
  })

  // Only show days that have guest list entries or are SHOW days
  const showDays = days.filter(
    (d) => d.guestListItems.length > 0 || d.dayType === "SHOW"
  )

  const totalGuests = days.reduce((sum, d) => sum + d.guestListItems.length, 0)
  const totalPlusOnes = days.reduce(
    (sum, d) =>
      sum + d.guestListItems.reduce((s, g) => s + g.plusOnes, 0),
    0
  )
  const checkedIn = days.reduce(
    (sum, d) =>
      sum + d.guestListItems.filter((g) => g.status === "CHECKED_IN").length,
    0
  )

  function statusBadge(status: string) {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-600 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "CHECKED_IN":
        return (
          <Badge variant="default" className="bg-blue-600 text-xs">
            <UserCheck className="h-3 w-3 mr-1" />
            Checked In
          </Badge>
        )
      case "DENIED":
        return (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            Denied
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Guest Lists" },
        ]}
      />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Guest Lists
            </h1>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
              <span>{totalGuests} guests</span>
              <span>{totalPlusOnes} plus-ones</span>
              <span>{checkedIn} checked in</span>
            </div>
          </div>
        </div>

        {showDays.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No guest lists yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Guest lists can be added on each day&apos;s Day Sheet page.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {showDays.map((day) => (
              <Card key={day.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/tours/${tourId}/days/${day.id}`}
                      className="hover:underline"
                    >
                      <CardTitle className="text-lg">
                        {format(new Date(day.date), "EEE, MMM d")}
                        {day.title && ` — ${day.title}`}
                      </CardTitle>
                    </Link>
                    <Badge variant="outline">
                      {day.guestListItems.length} guest
                      {day.guestListItems.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  {day.venue && (
                    <p className="text-sm text-muted-foreground">
                      {day.venue.name}
                    </p>
                  )}
                </CardHeader>
                {day.guestListItems.length > 0 && (
                  <CardContent>
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-2 font-medium">Name</th>
                            <th className="text-center p-2 font-medium w-20">
                              +Ones
                            </th>
                            <th className="text-left p-2 font-medium w-28">
                              Status
                            </th>
                            <th className="text-left p-2 font-medium hidden sm:table-cell">
                              Requested By
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {day.guestListItems.map((guest) => (
                            <tr
                              key={guest.id}
                              className="border-b last:border-0"
                            >
                              <td className="p-2 font-medium">
                                {guest.guestName}
                              </td>
                              <td className="p-2 text-center tabular-nums">
                                {guest.plusOnes > 0
                                  ? `+${guest.plusOnes}`
                                  : "—"}
                              </td>
                              <td className="p-2">
                                {statusBadge(guest.status)}
                              </td>
                              <td className="p-2 text-muted-foreground hidden sm:table-cell">
                                {guest.requestedBy || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
