import { Header } from "@/components/layout/header"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getVotingSession } from "@/lib/queries/voting-queries"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { VotingSessionClient } from "@/components/voting/voting-session-client"

interface Props {
  params: Promise<{ tourId: string; sessionId: string }>
}

export default async function VotingSessionPage({ params }: Props) {
  const { tourId, sessionId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { id: true, name: true },
  })
  if (!tour) redirect("/dashboard")

  const votingSession = await getVotingSession(sessionId)
  if (!votingSession) redirect(`/tours/${tourId}/voting`)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Voting", href: `/tours/${tourId}/voting` },
          { label: votingSession.title },
        ]}
      />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {votingSession.title}
              </h1>
              <Badge variant={votingSession.status === "OPEN" ? "default" : "secondary"}>
                {votingSession.status === "OPEN" ? "Offen" : "Beendet"}
              </Badge>
            </div>
            {votingSession.description && (
              <p className="text-muted-foreground mt-1">{votingSession.description}</p>
            )}
          </div>
        </div>

        <VotingSessionClient
          session={JSON.parse(JSON.stringify(votingSession))}
          tourId={tourId}
          currentUserId={session.user.id}
        />
      </div>
    </>
  )
}
