import Link from "next/link"
import { Header } from "@/components/layout/header"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getVotingSessionsForTour } from "@/lib/queries/voting-queries"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Vote, MapPin, Users, Clock } from "lucide-react"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { de } from "date-fns/locale"

interface Props {
  params: Promise<{ tourId: string }>
}

export default async function VotingSessionsPage({ params }: Props) {
  const { tourId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { id: true, name: true },
  })
  if (!tour) redirect("/dashboard")

  const sessions = await getVotingSessionsForTour(tourId)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Voting" },
        ]}
      />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Venue Voting</h1>
            <p className="text-muted-foreground mt-1">
              Schlagt Venues vor und stimmt gemeinsam ab
            </p>
          </div>
          <Button asChild>
            <Link href={`/tours/${tourId}/voting/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Neue Abstimmung
            </Link>
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Vote className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Noch keine Abstimmungen</h2>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Erstelle eine Abstimmung, damit das Team gemeinsam entscheiden kann, wohin es geht.
              </p>
              <Button asChild className="mt-4">
                <Link href={`/tours/${tourId}/voting/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Erste Abstimmung erstellen
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s: typeof sessions[number]) => (
              <Link key={s.id} href={`/tours/${tourId}/voting/${s.id}`}>
                <Card className="transition-colors hover:border-primary/50 h-full">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg">{s.title}</h3>
                      <Badge variant={s.status === "OPEN" ? "default" : "secondary"}>
                        {s.status === "OPEN" ? "Offen" : "Beendet"}
                      </Badge>
                    </div>
                    {s.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {s.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                      {s.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {s.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {s._count.suggestions} Vorschlag{s._count.suggestions !== 1 ? "e" : ""}
                      </span>
                      {s.date && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(s.date), "dd. MMM yyyy", { locale: de })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      von {s.createdBy.name ?? "Unbekannt"}
                    </p>
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
