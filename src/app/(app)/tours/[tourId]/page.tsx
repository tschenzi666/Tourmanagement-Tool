import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { getTour } from "@/lib/queries/tour-queries"
import { TourStatusBadge } from "@/components/tours/tour-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, DollarSign, Plus } from "lucide-react"
import { format } from "date-fns"

export default async function TourOverviewPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const tour = await getTour(tourId)

  if (!tour) notFound()

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name },
        ]}
      />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{tour.name}</h1>
              <TourStatusBadge status={tour.status} />
            </div>
            {tour.artist && (
              <p className="mt-1 text-lg text-muted-foreground">{tour.artist}</p>
            )}
            {(tour.startDate || tour.endDate) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {tour.startDate && format(tour.startDate, "MMM d, yyyy")}
                {tour.startDate && tour.endDate && " — "}
                {tour.endDate && format(tour.endDate, "MMM d, yyyy")}
              </p>
            )}
          </div>
          <Button asChild variant="outline">
            <Link href={`/tours/${tourId}/settings`}>Settings</Link>
          </Button>
        </div>

        {tour.description && (
          <p className="text-muted-foreground">{tour.description}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tour Days</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tour._count.tourDays}</div>
              <CardDescription>
                <Link
                  href={`/tours/${tourId}/schedule`}
                  className="text-primary hover:underline"
                >
                  View schedule
                </Link>
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Crew Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tour._count.crewMembers}</div>
              <CardDescription>
                <Link
                  href={`/tours/${tourId}/crew`}
                  className="text-primary hover:underline"
                >
                  Manage crew
                </Link>
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tour._count.expenses}</div>
              <CardDescription>
                <Link
                  href={`/tours/${tourId}/finances`}
                  className="text-primary hover:underline"
                >
                  View finances
                </Link>
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/tours/${tourId}/schedule`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Tour Days
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/tours/${tourId}/crew`}>
                <Users className="mr-2 h-4 w-4" />
                Add Crew
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
