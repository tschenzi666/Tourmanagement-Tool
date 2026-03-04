"use client"

import { useState } from "react"
import Link from "next/link"
import { TourRouteMapWrapper } from "@/components/tours/tour-route-map-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, ExternalLink } from "lucide-react"
import { format } from "date-fns"

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

interface TourDay {
  id: string
  date: Date
  dayType: string
  title: string | null
  city: string | null
  venue: { name: string } | null
}

const dayTypeColors: Record<string, string> = {
  SHOW: "#16a34a",
  TRAVEL: "#2563eb",
  OFF: "#9ca3af",
  REHEARSAL: "#9333ea",
  PRESS: "#d97706",
  LOAD_IN: "#ea580c",
  FESTIVAL: "#ec4899",
  OTHER: "#6b7280",
}

export function TourRouteInteractive({
  points,
  days,
  tourId,
}: {
  points: MapPoint[]
  days: TourDay[]
  tourId: string
}) {
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null)

  return (
    <>
      <TourRouteMapWrapper points={points} highlightIndex={highlightIndex} />

      {/* Route Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Tour Stops
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {days.map((day, index) => {
              const color = dayTypeColors[day.dayType] ?? dayTypeColors.OTHER
              return (
                <Link
                  key={day.id}
                  href={`/tours/${tourId}/days/${day.id}`}
                  className={`flex items-center gap-3 text-sm px-2 py-1.5 rounded-md cursor-pointer transition-all group ${
                    highlightIndex === index
                      ? "bg-amber-50 dark:bg-amber-950/30 ring-1 ring-amber-300"
                      : "hover:bg-muted/50"
                  }`}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onMouseLeave={() => setHighlightIndex(null)}
                >
                  <Badge
                    variant="outline"
                    className="min-w-[28px] justify-center font-mono transition-colors"
                    style={
                      highlightIndex === index
                        ? { backgroundColor: "#f59e0b", color: "white", borderColor: "#f59e0b" }
                        : { borderColor: color, color }
                    }
                  >
                    {index + 1}
                  </Badge>
                  <span className="text-muted-foreground min-w-[80px]">
                    {format(day.date, "MMM d")}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: color, color }}
                  >
                    {day.dayType}
                  </Badge>
                  <span className="font-medium group-hover:underline">
                    {day.title ?? day.city ?? `Day ${index + 1}`}
                  </span>
                  {day.venue && (
                    <span className="text-muted-foreground">
                      @ {day.venue.name}
                    </span>
                  )}
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
