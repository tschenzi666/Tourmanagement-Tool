import { Header } from "@/components/layout/header"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { createVotingSession } from "@/lib/actions/voting-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  params: Promise<{ tourId: string }>
}

export default async function NewVotingSessionPage({ params }: Props) {
  const { tourId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { id: true, name: true },
  })
  if (!tour) redirect("/dashboard")

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Voting", href: `/tours/${tourId}/voting` },
          { label: "Neue Abstimmung" },
        ]}
      />
      <div className="p-6 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Neue Abstimmung</h1>
        <Card>
          <CardHeader>
            <CardTitle>Woruber soll abgestimmt werden?</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createVotingSession} className="space-y-4">
              <input type="hidden" name="tourId" value={tourId} />

              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="z.B. Abendessen nach der Show in Berlin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Optionale Details zur Abstimmung..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Stadt</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="z.B. Berlin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Datum</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closesAt">Abstimmung endet am</Label>
                <Input
                  id="closesAt"
                  name="closesAt"
                  type="datetime-local"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit">Abstimmung erstellen</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
