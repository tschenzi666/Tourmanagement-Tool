import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { getTour } from "@/lib/queries/tour-queries"
import { getTourDays } from "@/lib/queries/tour-day-queries"
import { DayTypeBadge, getDayTypeColor } from "@/components/days/day-type-badge"
import { AddDayDialog } from "@/components/days/add-day-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Music, CheckCircle2, Printer } from "lucide-react"
import { format } from "date-fns"

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const [tour, days] = await Promise.all([getTour(tourId), getTourDays(tourId)])

  if (!tour) notFound()

  const showDays = days.filter((d) => d.dayType === "SHOW").length
  const travelDays = days.filter((d) => d.dayType === "TRAVEL").length
  const offDays = days.filter((d) => d.dayType === "OFF").length

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Schedule" },
        ]}
      />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Schedule</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-sm text-muted-foreground">
              <span>{days.length} days total</span>
              {showDays > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> {showDays} shows</span>}
              {travelDays > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> {travelDays} travel</span>}
              {offDays > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400" /> {offDays} off</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/print/tours/${tourId}/schedule`} target="_blank">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Link>
            </Button>
            <AddDayDialog tourId={tourId} />
          </div>
        </div>

        {days.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No days scheduled</h2>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Add tour days to start building your itinerary.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {days.map((day) => (
              <Link key={day.id} href={`/tours/${tourId}/days/${day.id}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="flex items-center gap-4 py-3 px-4">
                    {/* Date column */}
                    <div className="flex flex-col items-center min-w-[60px]">
                      <span className="text-xs text-muted-foreground uppercase">
                        {format(day.date, "EEE")}
                      </span>
                      <span className="text-2xl font-bold leading-tight">
                        {format(day.date, "d")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(day.date, "MMM")}
                      </span>
                    </div>

                    {/* Color indicator */}
                    <div className={`w-1 h-12 rounded-full ${getDayTypeColor(day.dayType)}`} />

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {day.title ?? `Day ${day.dayNumber ?? "—"}`}
                        </span>
                        <DayTypeBadge dayType={day.dayType} />
                        {day.isConfirmed && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
                        {day.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {day.city}{day.country ? `, ${day.country}` : ""}
                          </span>
                        )}
                        {day.venue && (
                          <span className="flex items-center gap-1">
                            <Music className="h-3 w-3" />
                            {day.venue.name}
                            {day.venue.capacity && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {day.venue.capacity.toLocaleString()} cap
                              </Badge>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                      {day._count.scheduleItems > 0 && (
                        <span>{day._count.scheduleItems} items</span>
                      )}
                      {day._count.travelLegs > 0 && (
                        <span>{day._count.travelLegs} travel</span>
                      )}
                      {day._count.guestListItems > 0 && (
                        <span>{day._count.guestListItems} guests</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
