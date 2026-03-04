import Link from "next/link"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { getTourCrew } from "@/lib/queries/crew-queries"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Plane, Hotel, Printer } from "lucide-react"
import { CrewListClient } from "@/components/crew/crew-list-client"
import { AddFromTeamDialog } from "@/components/crew/add-from-team-dialog"

export default async function CrewPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { id: true, name: true, currency: true, teamId: true },
  })

  if (!tour) notFound()

  const crew = await getTourCrew(tourId)

  // Get current user's session
  const session = await auth()

  // Fetch team members NOT already in this tour's crew
  const existingCrewUserIds = crew
    .filter((m) => m.userId)
    .map((m) => m.userId as string)

  const teamMembers = session?.user?.id
    ? await prisma.teamMember.findMany({
        where: {
          teamId: tour.teamId,
          userId: { notIn: existingCrewUserIds.length > 0 ? existingCrewUserIds : ["__none__"] },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      })
    : []

  const availableMembers = teamMembers
    .filter((m) => m.user.name && m.user.email)
    .map((m) => ({
      userId: m.user.id,
      name: m.user.name!,
      email: m.user.email!,
      teamRole: m.role,
    }))

  const activeCrew = crew.filter((m) => m.isActive)
  const inactiveCrew = crew.filter((m) => !m.isActive)
  const departments = new Set(crew.map((m) => m.department || "Other"))

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Crew" },
        ]}
      />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Crew Roster</h1>
            <p className="text-muted-foreground mt-1">
              {activeCrew.length} active crew member{activeCrew.length !== 1 ? "s" : ""}
              {inactiveCrew.length > 0 && (
                <span> · {inactiveCrew.length} inactive</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={`/print/tours/${tourId}/crew`} target="_blank">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Link>
            </Button>
            <AddFromTeamDialog
              tourId={tourId}
              availableMembers={availableMembers}
            />
            <Button asChild>
              <Link href={`/tours/${tourId}/crew/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Crew Member
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        {crew.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeCrew.length}</p>
                    <p className="text-xs text-muted-foreground">Active Crew</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{departments.size}</p>
                    <p className="text-xs text-muted-foreground">Departments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {crew.reduce((sum, m) => sum + m._count.travelAssignments, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Travel Assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Hotel className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {crew.reduce((sum, m) => sum + m._count.roomAssignments, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Room Assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {crew.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No crew members yet</h2>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Add your touring crew — engineers, techs, drivers, catering, management, and more.
              </p>
              <div className="flex gap-2 mt-4">
                <AddFromTeamDialog
                  tourId={tourId}
                  availableMembers={availableMembers}
                />
                <Button asChild>
                  <Link href={`/tours/${tourId}/crew/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Crew Member
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <CrewListClient
            crew={crew.map((m) => ({
              id: m.id,
              roleTitle: m.roleTitle,
              role: m.role,
              department: m.department,
              isActive: m.isActive,
              dailyRate: m.dailyRate ? Number(m.dailyRate) : null,
              currency: m.currency,
              email: m.user?.email || null,
              userName: m.user?.name || null,
              travelCount: m._count.travelAssignments,
              roomCount: m._count.roomAssignments,
            }))}
            tourId={tourId}
          />
        )}
      </div>
    </>
  )
}
