import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getToursForUser } from "@/lib/queries/tour-queries"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TourStatusBadge } from "@/components/tours/tour-status-badge"
import { Plus, CalendarDays, Users, Music } from "lucide-react"
import { format } from "date-fns"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const tours = await getToursForUser(session.user.id)

  return (
    <>
      <Header breadcrumbs={[{ label: "Dashboard" }]} />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user.name ?? "there"}
            </p>
          </div>
          <Button asChild>
            <Link href="/tours/new">
              <Plus className="mr-2 h-4 w-4" />
              New Tour
            </Link>
          </Button>
        </div>

        {tours.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No tours yet</h2>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Create your first tour to start managing itineraries, venues, crew, and finances.
              </p>
              <Button asChild className="mt-6">
                <Link href="/tours/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Tour
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <Link key={tour.id} href={`/tours/${tour.id}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{tour.name}</CardTitle>
                        {tour.artist && (
                          <CardDescription>{tour.artist}</CardDescription>
                        )}
                      </div>
                      <TourStatusBadge status={tour.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {tour._count.tourDays} days
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {tour._count.crewMembers} crew
                      </span>
                    </div>
                    {(tour.startDate || tour.endDate) && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {tour.startDate && format(tour.startDate, "MMM d, yyyy")}
                        {tour.startDate && tour.endDate && " — "}
                        {tour.endDate && format(tour.endDate, "MMM d, yyyy")}
                      </p>
                    )}
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
