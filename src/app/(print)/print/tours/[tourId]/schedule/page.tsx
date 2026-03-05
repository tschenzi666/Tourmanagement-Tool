import { notFound } from "next/navigation"
import { getTourDays } from "@/lib/queries/tour-day-queries"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { PrintButton } from "@/components/print/print-button"
import { normalizeLogoUrl } from "@/lib/utils/logo-url"

export default async function PrintSchedulePage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: {
      name: true,
      artist: true,
      startDate: true,
      endDate: true,
      team: {
        select: { logoUrl: true, showLogoInPrint: true, name: true },
      },
    },
  })

  if (!tour) notFound()

  const days = await getTourDays(tourId)

  return (
    <div className="p-8 print:p-4">
      <PrintButton />

      {/* Header */}
      <div className="border-b-2 border-black pb-3 mb-4">
        {tour.team.logoUrl && tour.team.showLogoInPrint && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={normalizeLogoUrl(tour.team.logoUrl)!}
              alt={tour.team.name}
              className="h-12 w-auto object-contain"
            />
          </div>
        )}
        <h1 className="text-2xl font-bold">{tour.artist || tour.name}</h1>
        <p className="text-lg">{tour.name}</p>
        {tour.startDate && tour.endDate && (
          <p className="text-sm text-gray-600">
            {format(new Date(tour.startDate), "MMMM d")} — {format(new Date(tour.endDate), "MMMM d, yyyy")}
          </p>
        )}
      </div>

      {/* Itinerary Table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-2 w-8">#</th>
            <th className="text-left py-2 w-28">Date</th>
            <th className="text-left py-2 w-16">Day</th>
            <th className="text-left py-2 w-20">Type</th>
            <th className="text-left py-2">City</th>
            <th className="text-left py-2">Venue</th>
            <th className="text-right py-2 w-16">Cap.</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day, i) => {
            const isShow = day.dayType === "SHOW"
            const isTravel = day.dayType === "TRAVEL"
            const isOff = day.dayType === "OFF"

            return (
              <tr
                key={day.id}
                className={`border-b ${isOff ? "text-gray-400" : ""} ${isShow ? "font-medium" : ""}`}
              >
                <td className="py-1.5">{day.dayNumber || i + 1}</td>
                <td className="py-1.5">
                  {format(new Date(day.date), "EEE MMM d")}
                </td>
                <td className="py-1.5">
                  {format(new Date(day.date), "EEEE")}
                </td>
                <td className="py-1.5">
                  <span className={`inline-block px-1.5 py-0.5 text-xs font-bold uppercase border rounded ${
                    isShow ? "border-black" : isTravel ? "border-gray-400" : "border-gray-300"
                  }`}>
                    {day.dayType}
                  </span>
                </td>
                <td className="py-1.5">
                  {day.city}{day.country ? `, ${day.country}` : ""}
                </td>
                <td className="py-1.5">{day.venue?.name || "—"}</td>
                <td className="py-1.5 text-right tabular-nums">
                  {day.venue?.capacity?.toLocaleString() || ""}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-4 pt-2 border-t text-sm">
        <div className="flex gap-6">
          <span><strong>{days.filter(d => d.dayType === "SHOW").length}</strong> shows</span>
          <span><strong>{days.filter(d => d.dayType === "TRAVEL").length}</strong> travel days</span>
          <span><strong>{days.filter(d => d.dayType === "OFF").length}</strong> off days</span>
          <span><strong>{days.length}</strong> total days</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-2 border-t text-xs text-gray-400 flex justify-between print:mt-4">
        <span>{tour.name} — Tour Schedule</span>
        <span>Printed {format(new Date(), "MMM d, yyyy HH:mm")}</span>
      </div>
    </div>
  )
}
