import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { CrewForm } from "@/components/crew/crew-form"
import { createCrewMember } from "@/lib/actions/crew-actions"
import { prisma } from "@/lib/prisma"

export default async function NewCrewMemberPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { id: true, name: true },
  })

  if (!tour) notFound()

  const createCrewMemberWithTourId = createCrewMember.bind(null, tourId)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Crew", href: `/tours/${tourId}/crew` },
          { label: "New Crew Member" },
        ]}
      />
      <div className="p-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Add Crew Member</h1>
        <CrewForm action={createCrewMemberWithTourId} />
      </div>
    </>
  )
}
