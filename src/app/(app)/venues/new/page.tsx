import { Header } from "@/components/layout/header"
import { VenueForm } from "@/components/venues/venue-form"
import { createVenue } from "@/lib/actions/venue-actions"

export default function NewVenuePage() {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Venues", href: "/venues" },
          { label: "New Venue" },
        ]}
      />
      <div className="p-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Add New Venue</h1>
        <VenueForm action={createVenue} />
      </div>
    </>
  )
}
