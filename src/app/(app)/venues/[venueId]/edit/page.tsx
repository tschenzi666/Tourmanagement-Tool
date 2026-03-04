import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { getVenue } from "@/lib/queries/venue-queries"
import { VenueForm } from "@/components/venues/venue-form"
import { updateVenue } from "@/lib/actions/venue-actions"

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ venueId: string }>
}) {
  const { venueId } = await params
  const venue = await getVenue(venueId)

  if (!venue) notFound()

  const updateVenueWithId = async (formData: FormData) => {
    "use server"
    await updateVenue(venueId, formData)
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Venues", href: "/venues" },
          { label: venue.name, href: `/venues/${venueId}` },
          { label: "Edit" },
        ]}
      />
      <div className="p-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Venue</h1>
        <VenueForm action={updateVenueWithId} venue={venue} submitLabel="Save Changes" />
      </div>
    </>
  )
}
