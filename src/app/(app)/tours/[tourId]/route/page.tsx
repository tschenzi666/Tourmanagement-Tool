import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { getTour } from "@/lib/queries/tour-queries"
import { getTourDaysForMap } from "@/lib/queries/tour-day-queries"
import { TourRouteInteractive } from "@/components/tours/tour-route-interactive"

// Well-known city coordinates for fallback when venues don't have lat/lng
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  "paris": { lat: 48.8566, lng: 2.3522 },
  "london": { lat: 51.5074, lng: -0.1278 },
  "berlin": { lat: 52.5200, lng: 13.4050 },
  "amsterdam": { lat: 52.3676, lng: 4.9041 },
  "brussels": { lat: 50.8503, lng: 4.3517 },
  "munich": { lat: 48.1351, lng: 11.5820 },
  "hamburg": { lat: 53.5511, lng: 9.9937 },
  "cologne": { lat: 50.9375, lng: 6.9603 },
  "vienna": { lat: 48.2082, lng: 16.3738 },
  "zurich": { lat: 47.3769, lng: 8.5417 },
  "milan": { lat: 45.4642, lng: 9.1900 },
  "rome": { lat: 41.9028, lng: 12.4964 },
  "barcelona": { lat: 41.3874, lng: 2.1686 },
  "madrid": { lat: 40.4168, lng: -3.7038 },
  "lisbon": { lat: 38.7223, lng: -9.1393 },
  "dublin": { lat: 53.3498, lng: -6.2603 },
  "copenhagen": { lat: 55.6761, lng: 12.5683 },
  "stockholm": { lat: 59.3293, lng: 18.0686 },
  "oslo": { lat: 59.9139, lng: 10.7522 },
  "helsinki": { lat: 60.1699, lng: 24.9384 },
  "prague": { lat: 50.0755, lng: 14.4378 },
  "warsaw": { lat: 52.2297, lng: 21.0122 },
  "budapest": { lat: 47.4979, lng: 19.0402 },
  "new york": { lat: 40.7128, lng: -74.0060 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  "chicago": { lat: 41.8781, lng: -87.6298 },
  "nashville": { lat: 36.1627, lng: -86.7816 },
  "austin": { lat: 30.2672, lng: -97.7431 },
  "tokyo": { lat: 35.6762, lng: 139.6503 },
  "sydney": { lat: -33.8688, lng: 151.2093 },
  "melbourne": { lat: -37.8136, lng: 144.9631 },
  "toronto": { lat: 43.6532, lng: -79.3832 },
  "manchester": { lat: 53.4808, lng: -2.2426 },
  "glasgow": { lat: 55.8642, lng: -4.2518 },
  "birmingham": { lat: 52.4862, lng: -1.8904 },
  "leeds": { lat: 53.8008, lng: -1.5491 },
  "frankfurt": { lat: 50.1109, lng: 8.6821 },
  "düsseldorf": { lat: 51.2277, lng: 6.7735 },
  "stuttgart": { lat: 48.7758, lng: 9.1829 },
}

export default async function TourRoutePage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const [tour, days] = await Promise.all([
    getTour(tourId),
    getTourDaysForMap(tourId),
  ])

  if (!tour) notFound()

  // Build map points from tour days
  const points = days
    .map((day) => {
      let lat: number | null = null
      let lng: number | null = null

      // Try venue coordinates first
      if (day.venue?.latitude && day.venue?.longitude) {
        lat = Number(day.venue.latitude)
        lng = Number(day.venue.longitude)
      }
      // Fall back to city lookup
      else if (day.city) {
        const cityKey = day.city.toLowerCase()
        const coords = cityCoordinates[cityKey]
        if (coords) {
          lat = coords.lat
          lng = coords.lng
        }
      }

      if (lat === null || lng === null) return null

      return {
        id: day.id,
        date: day.date,
        dayType: day.dayType,
        title: day.title,
        city: day.city,
        country: day.country,
        lat,
        lng,
        venueName: day.venue?.name,
      }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)

  const cities = [...new Set(days.map((d) => d.city).filter(Boolean))]

  // Prepare days data for the interactive legend
  const daysForLegend = days.map((d) => ({
    id: d.id,
    date: d.date,
    dayType: d.dayType,
    title: d.title,
    city: d.city,
    venue: d.venue ? { name: d.venue.name } : null,
  }))

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: tour.name, href: `/tours/${tourId}` },
          { label: "Route" },
        ]}
      />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tour Route</h1>
          <p className="text-muted-foreground mt-1">
            {cities.length} cities across {days.length} days
          </p>
        </div>

        <TourRouteInteractive points={points} days={daysForLegend} tourId={tourId} />
      </div>
    </>
  )
}
