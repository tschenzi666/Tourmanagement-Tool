import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { getVenue } from "@/lib/queries/venue-queries"
import { deleteVenue } from "@/lib/actions/venue-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin, Phone, Mail, Globe, Users, Wifi,
  ParkingCircle, CalendarDays, Pencil, Trash2,
} from "lucide-react"
import { format } from "date-fns"

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ venueId: string }>
}) {
  const { venueId } = await params
  const venue = await getVenue(venueId)

  if (!venue) notFound()

  const deleteVenueWithId = deleteVenue.bind(null, venueId)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Venues", href: "/venues" },
          { label: venue.name },
        ]}
      />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{venue.name}</h1>
              {venue.venueType && <Badge variant="secondary">{venue.venueType}</Badge>}
            </div>
            <p className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {venue.address && `${venue.address}, `}
              {venue.city}, {venue.country}
              {venue.postalCode && ` ${venue.postalCode}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/venues/${venueId}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <form action={deleteVenueWithId}>
              <Button variant="destructive" size="icon" type="submit">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Details */}
            <Card>
              <CardHeader>
                <CardTitle>Venue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {venue.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Capacity:</strong> {venue.capacity.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {venue.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{venue.phone}</span>
                    </div>
                  )}
                  {venue.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{venue.email}</span>
                    </div>
                  )}
                  {venue.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{venue.website}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Production Details */}
            {(venue.wifiNetwork || venue.loadInNotes || venue.parkingNotes || venue.notes) && (
              <Card>
                <CardHeader>
                  <CardTitle>Production Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {venue.wifiNetwork && (
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>{venue.wifiNetwork}</strong>
                        {venue.wifiPassword && ` / ${venue.wifiPassword}`}
                      </span>
                    </div>
                  )}
                  {venue.parkingNotes && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ParkingCircle className="h-4 w-4 text-muted-foreground" />
                        <strong className="text-sm">Parking</strong>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{venue.parkingNotes}</p>
                    </div>
                  )}
                  {venue.loadInNotes && (
                    <div>
                      <strong className="text-sm">Load-In Notes</strong>
                      <p className="text-sm text-muted-foreground mt-1">{venue.loadInNotes}</p>
                    </div>
                  )}
                  {venue.notes && (
                    <div>
                      <strong className="text-sm">General Notes</strong>
                      <p className="text-sm text-muted-foreground mt-1">{venue.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Show History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Show History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {venue.tourDays.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No shows at this venue yet.</p>
                ) : (
                  <div className="space-y-2">
                    {venue.tourDays.map((day) => (
                      <Link
                        key={day.id}
                        href={`/tours/${day.tour.id}/days/${day.id}`}
                        className="flex items-center justify-between text-sm hover:bg-muted/50 rounded p-1.5 -mx-1.5"
                      >
                        <div>
                          <p className="font-medium">{day.tour.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {day.tour.artist && `${day.tour.artist} · `}
                            {format(day.date, "MMM d, yyyy")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Venue Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>Venue Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                {venue.contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No contacts linked to this venue.</p>
                ) : (
                  <div className="space-y-2">
                    {venue.contacts.map((vc) => (
                      <Link
                        key={vc.id}
                        href={`/contacts/${vc.contact.id}`}
                        className="flex items-center justify-between text-sm hover:bg-muted/50 rounded p-1.5 -mx-1.5"
                      >
                        <div>
                          <p className="font-medium">
                            {vc.contact.firstName} {vc.contact.lastName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {vc.role}
                            {vc.contact.company && ` · ${vc.contact.company}`}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
