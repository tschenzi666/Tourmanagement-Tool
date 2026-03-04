import { notFound } from "next/navigation"
import { getTourDay } from "@/lib/queries/tour-day-queries"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { PrintButton } from "@/components/print/print-button"

export default async function PrintDaySheetPage({
  params,
}: {
  params: Promise<{ tourId: string; dayId: string }>
}) {
  const { tourId, dayId } = await params

  const [tour, day] = await Promise.all([
    prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        name: true,
        artist: true,
        team: {
          select: { logoUrl: true, showLogoInPrint: true, name: true },
        },
      },
    }),
    getTourDay(dayId),
  ])

  if (!tour || !day) notFound()

  const scheduleItems = day.scheduleItems.sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  })

  return (
    <div className="p-8 print:p-4">
      <PrintButton />

      {/* Header */}
      <div className="border-b-2 border-black pb-3 mb-4">
        {tour.team.logoUrl && tour.team.showLogoInPrint && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tour.team.logoUrl}
              alt={tour.team.name}
              className="h-12 w-auto object-contain"
            />
          </div>
        )}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{tour.artist || tour.name}</h1>
            <p className="text-lg font-semibold">{tour.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              Day {day.dayNumber || "—"}
            </p>
            <p className="text-lg">
              {format(new Date(day.date), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <span className="inline-block px-3 py-1 text-sm font-bold uppercase border-2 border-black rounded">
              {day.dayType}
            </span>
            {day.title && <span className="text-lg font-medium">{day.title}</span>}
          </div>
          <div className="text-right text-sm">
            {day.city && <span className="font-medium">{day.city}</span>}
            {day.country && <span>, {day.country}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 print:gap-4">
        {/* Main Column - Schedule */}
        <div className="col-span-2 space-y-4">
          {/* Venue */}
          {day.venue && (
            <div className="border rounded-lg p-3">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1">
                Venue
              </h2>
              <p className="font-bold text-lg">{day.venue.name}</p>
              {day.venue.address && (
                <p className="text-sm">{day.venue.address}, {day.venue.city}</p>
              )}
              <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                {day.venue.phone && (
                  <div>
                    <span className="text-gray-500">Tel: </span>
                    {day.venue.phone}
                  </div>
                )}
                {day.venue.capacity && (
                  <div>
                    <span className="text-gray-500">Capacity: </span>
                    {day.venue.capacity.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Schedule Timeline */}
          {scheduleItems.length > 0 && (
            <div className="border rounded-lg p-3">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1">
                Schedule
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1 w-20">Time</th>
                    <th className="text-left py-1">Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-1.5 font-mono font-bold">
                        {item.startTime
                          ? format(new Date(item.startTime), "HH:mm")
                          : "—"}
                      </td>
                      <td className="py-1.5">
                        <span className="font-medium">{item.label || item.type}</span>
                        {item.notes && (
                          <span className="text-gray-500 ml-2">— {item.notes}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Travel */}
          {day.travelLegs.length > 0 && (
            <div className="border rounded-lg p-3">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1">
                Travel
              </h2>
              {day.travelLegs.map((leg) => (
                <div key={leg.id} className="flex items-center gap-4 py-2 text-sm">
                  <span className="font-bold uppercase w-12">{leg.mode}</span>
                  <span className="font-medium">
                    {leg.departureCity} → {leg.arrivalCity}
                  </span>
                  {leg.departureTime && (
                    <span className="font-mono">
                      Depart: {format(new Date(leg.departureTime), "HH:mm")}
                    </span>
                  )}
                  {leg.arrivalTime && (
                    <span className="font-mono">
                      Arrive: {format(new Date(leg.arrivalTime), "HH:mm")}
                    </span>
                  )}
                  {leg.carrier && <span className="text-gray-500">{leg.carrier} {leg.flightNumber}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {day.notes && (
            <div className="border rounded-lg p-3">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1">
                Day Notes
              </h2>
              <p className="text-sm whitespace-pre-wrap">{day.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Hotel */}
          {day.hotelStay && (
            <div className="border rounded-lg p-3">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1">
                Hotel
              </h2>
              <p className="font-bold">{day.hotelStay.hotelName}</p>
              {day.hotelStay.address && (
                <p className="text-sm">{day.hotelStay.address}</p>
              )}
              {day.hotelStay.phone && (
                <p className="text-sm">Tel: {day.hotelStay.phone}</p>
              )}
              {day.hotelStay.confirmationCode && (
                <p className="text-sm">
                  Conf: <span className="font-mono font-bold">{day.hotelStay.confirmationCode}</span>
                </p>
              )}
              <div className="text-sm mt-1">
                {day.hotelStay.checkIn && (
                  <span>Check-in: {format(new Date(day.hotelStay.checkIn), "HH:mm")} </span>
                )}
                {day.hotelStay.checkOut && (
                  <span>| Check-out: {format(new Date(day.hotelStay.checkOut), "HH:mm")}</span>
                )}
              </div>
            </div>
          )}

          {/* WiFi & Production */}
          {day.venue && (day.venue.wifiNetwork || day.venue.loadInNotes || day.venue.parkingNotes) && (
            <div className="border rounded-lg p-3">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1">
                Production Info
              </h2>
              {day.venue.wifiNetwork && (
                <p className="text-sm">
                  <span className="font-medium">WiFi:</span> {day.venue.wifiNetwork}
                  {day.venue.wifiPassword && <> / {day.venue.wifiPassword}</>}
                </p>
              )}
              {day.venue.parkingNotes && (
                <p className="text-sm mt-1">
                  <span className="font-medium">Parking:</span> {day.venue.parkingNotes}
                </p>
              )}
              {day.venue.loadInNotes && (
                <p className="text-sm mt-1">
                  <span className="font-medium">Load-in:</span> {day.venue.loadInNotes}
                </p>
              )}
            </div>
          )}

          {/* Guest List */}
          {day.guestListItems.length > 0 && (
            <div className="border rounded-lg p-3">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1">
                Guest List ({day.guestListItems.length})
              </h2>
              {day.guestListItems.map((guest) => (
                <div key={guest.id} className="flex justify-between text-sm py-0.5">
                  <span>{guest.guestName}</span>
                  <span className="text-gray-500">+{guest.plusOnes}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-2 border-t text-xs text-gray-400 flex justify-between print:mt-4">
        <span>{tour.name} — Day Sheet</span>
        <span>Printed {format(new Date(), "MMM d, yyyy HH:mm")}</span>
      </div>
    </div>
  )
}
