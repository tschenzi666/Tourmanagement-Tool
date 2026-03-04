import Link from "next/link"
import { Header } from "@/components/layout/header"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getVenuesForTeam } from "@/lib/queries/venue-queries"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Users, CalendarDays, Phone } from "lucide-react"
import { redirect } from "next/navigation"

export default async function VenuesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    select: { teamId: true },
  })
  if (!membership) redirect("/dashboard")

  const venues = await getVenuesForTeam(membership.teamId)

  return (
    <>
      <Header breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Venues" }]} />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Venues</h1>
            <p className="text-muted-foreground mt-1">
              {venues.length} venue{venues.length !== 1 ? "s" : ""} in your database
            </p>
          </div>
          <Button asChild>
            <Link href="/venues/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Venue
            </Link>
          </Button>
        </div>

        {venues.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No venues yet</h2>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Add venues to quickly assign them to tour days and keep track of production details.
              </p>
              <Button asChild className="mt-4">
                <Link href="/venues/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Venue
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <Link key={venue.id} href={`/venues/${venue.id}`}>
                <Card className="transition-colors hover:border-primary/50 h-full">
                  <CardContent className="pt-6 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{venue.name}</h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {venue.city}, {venue.country}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {venue.venueType && (
                        <Badge variant="secondary">{venue.venueType}</Badge>
                      )}
                      {venue.capacity && (
                        <Badge variant="outline">
                          <Users className="mr-1 h-3 w-3" />
                          {venue.capacity.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      {venue._count.tourDays > 0 && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {venue._count.tourDays} show{venue._count.tourDays !== 1 ? "s" : ""}
                        </span>
                      )}
                      {venue.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {venue.phone}
                        </span>
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
