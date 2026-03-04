import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { getCrewMember } from "@/lib/queries/crew-queries"
import { CrewForm } from "@/components/crew/crew-form"
import { updateCrewMember } from "@/lib/actions/crew-actions"

export default async function EditCrewMemberPage({
  params,
}: {
  params: Promise<{ tourId: string; crewId: string }>
}) {
  const { tourId, crewId } = await params
  const member = await getCrewMember(crewId)

  if (!member) notFound()

  const updateCrewMemberWithIds = async (formData: FormData) => {
    "use server"
    await updateCrewMember(tourId, crewId, formData)
  }

  const name = member.roleTitle || "Crew Member"

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: member.tour.name, href: `/tours/${tourId}` },
          { label: "Crew", href: `/tours/${tourId}/crew` },
          { label: name, href: `/tours/${tourId}/crew/${crewId}` },
          { label: "Edit" },
        ]}
      />
      <div className="p-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Crew Member</h1>
        <CrewForm action={updateCrewMemberWithIds} crewMember={member} submitLabel="Save Changes" />
      </div>
    </>
  )
}
