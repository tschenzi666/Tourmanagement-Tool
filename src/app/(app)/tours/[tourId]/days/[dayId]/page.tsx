import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { getTourDay, getAdjacentDays } from "@/lib/queries/tour-day-queries"
import { DayTypeBadge } from "@/components/days/day-type-badge"
import { ScheduleTimeline } from "@/components/days/schedule-timeline"
import { TravelCard } from "@/components/days/travel-card"
import { HotelCard } from "@/components/days/hotel-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Music,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Users,
  Phone,
  Mail,
  Globe,
  Wifi,
  ParkingCircle,
  Printer,
} from "lucide-react"
import { format } from "date-fns"

export default async function DaySheetPage({
  params,
}: {
  params: Promise<{ tourId: string; dayId: string }>
}) {
  const { tourId, dayId } = await params
  const day = await getTourDay(dayId)

  if (!day) notFound()

  const { prevDay, nextDay } = await getAdjacentDays(tourId, day.date)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: day.tour.name, href: `/tours/${tourId}` },
          { label: "Schedule", href: `/tours/${tourId}/schedule` },
          { label: day.title ?? format(day.date, "MMM d") },
        ]}
      />
      <div className="p-4 md:p-6 space-y-6">
        {/* Day Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {day.title ?? `Day ${day.dayNumber ?? "—"}`}
              </h1>
              <DayTypeBadge dayType={day.dayType} />
              {day.isConfirmed && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Confirmed
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-muted-foreground">
              <span className="text-base sm:text-lg">{format(day.date, "EEEE, MMMM d, yyyy")}</span>
              {day.dayNumber && (
                <Badge variant="secondary">Day {day.dayNumber}</Badge>
              )}
            </div>
            {day.city && (
              <p className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {day.city}{day.country ? `, ${day.country}` : ""}
              </p>
            )}
          </div>

          {/* Prev/Next Navigation */}
          <div className="flex items-center gap-2">
            {prevDay ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/tours/${tourId}/days/${prevDay.id}`}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev
              </Button>
            )}
            {nextDay ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/tours/${tourId}/days/${nextDay.id}`}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/print/tours/${tourId}/days/${dayId}`} target="_blank">
                <Printer className="mr-1 h-4 w-4" />
                Print
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Schedule Timeline */}
            <ScheduleTimeline
              items={day.scheduleItems}
              tourDayId={day.id}
              tourId={tourId}
            />

            {/* Travel */}
            <TravelCard
              legs={day.travelLegs}
              tourDayId={day.id}
              tourId={tourId}
            />

            {/* Notes */}
            {day.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Day Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{day.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar column */}
          <div className="space-y-6">
            {/* Venue Info */}
            {day.venue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Venue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-base">{day.venue.name}</h3>
                    {day.venue.address && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {day.venue.address}
                        {day.venue.city ? `, ${day.venue.city}` : ""}
                        {day.venue.country ? ` ${day.venue.country}` : ""}
                      </p>
                    )}
                  </div>
                  {day.venue.capacity && (
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      Capacity: {day.venue.capacity.toLocaleString()}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {day.venue.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {day.venue.phone}
                      </span>
                    )}
                    {day.venue.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {day.venue.email}
                      </span>
                    )}
                    {day.venue.website && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {day.venue.website}
                      </span>
                    )}
                  </div>
                  {(day.venue.wifiNetwork || day.venue.parkingNotes) && (
                    <div className="space-y-1 pt-2 border-t text-sm">
                      {day.venue.wifiNetwork && (
                        <p className="flex items-center gap-1">
                          <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
                          {day.venue.wifiNetwork}
                          {day.venue.wifiPassword && (
                            <span className="text-muted-foreground"> / {day.venue.wifiPassword}</span>
                          )}
                        </p>
                      )}
                      {day.venue.parkingNotes && (
                        <p className="flex items-center gap-1">
                          <ParkingCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          {day.venue.parkingNotes}
                        </p>
                      )}
                    </div>
                  )}
                  {day.venue.loadInNotes && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium mb-0.5">Load-In Notes</p>
                      <p className="text-xs text-muted-foreground">{day.venue.loadInNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Hotel */}
            <HotelCard
              stay={day.hotelStay}
              tourDayId={day.id}
              tourId={tourId}
            />

            {/* Guest List Summary */}
            {day.guestListItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Guest List
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>{day.guestListItems.length} guests</p>
                    <p className="text-muted-foreground">
                      {day.guestListItems.reduce((sum, g) => sum + g.plusOnes, 0)} plus-ones
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
