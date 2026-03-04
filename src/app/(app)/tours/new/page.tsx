import { Header } from "@/components/layout/header"
import { TourForm } from "@/components/tours/tour-form"
import { createTour } from "@/lib/actions/tour-actions"

export default function NewTourPage() {
  return (
    <>
      <Header breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "New Tour" }]} />
      <div className="p-6">
        <TourForm action={createTour} />
      </div>
    </>
  )
}
