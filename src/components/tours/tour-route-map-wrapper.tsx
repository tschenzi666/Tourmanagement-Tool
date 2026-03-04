"use client"

import dynamic from "next/dynamic"

const TourRouteMap = dynamic(
  () => import("@/components/tours/tour-route-map").then((mod) => mod.TourRouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full rounded-lg border bg-muted animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  }
)

interface MapPoint {
  id: string
  date: Date
  dayType: string
  title: string | null
  city: string | null
  country: string | null
  lat: number
  lng: number
  venueName?: string
}

export function TourRouteMapWrapper({
  points,
  highlightIndex,
}: {
  points: MapPoint[]
  highlightIndex: number | null
}) {
  return <TourRouteMap points={points} highlightIndex={highlightIndex} />
}
