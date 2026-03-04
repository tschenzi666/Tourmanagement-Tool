"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plane, Bus, Car, Train, Ship, ArrowRight, Trash2 } from "lucide-react"
import { AddTravelLegDialog } from "./add-travel-leg-dialog"
import { deleteTravelLeg } from "@/lib/actions/tour-day-actions"
import { format } from "date-fns"

interface TravelLeg {
  id: string
  mode: string
  departureCity: string | null
  arrivalCity: string | null
  departureTime: Date | null
  arrivalTime: Date | null
  carrier: string | null
  flightNumber: string | null
  confirmationCode: string | null
  notes: string | null
}

const modeIcons: Record<string, typeof Plane> = {
  FLY: Plane,
  BUS: Bus,
  DRIVE: Car,
  TRAIN: Train,
  FERRY: Ship,
}

const modeLabels: Record<string, string> = {
  FLY: "Flight",
  BUS: "Bus",
  DRIVE: "Drive",
  TRAIN: "Train",
  FERRY: "Ferry",
  OTHER: "Travel",
}

export function TravelCard({
  legs,
  tourDayId,
  tourId,
}: {
  legs: TravelLeg[]
  tourDayId: string
  tourId: string
}) {
  const router = useRouter()

  async function handleDelete(legId: string) {
    await deleteTravelLeg(legId, tourId)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Travel
        </CardTitle>
        <AddTravelLegDialog tourDayId={tourDayId} tourId={tourId} />
      </CardHeader>
      <CardContent>
        {legs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No travel legs added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {legs.map((leg) => {
              const Icon = modeIcons[leg.mode] ?? Car
              return (
                <div
                  key={leg.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <span>{leg.departureCity ?? "—"}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span>{leg.arrivalCity ?? "—"}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                      <span>{modeLabels[leg.mode] ?? "Travel"}</span>
                      {leg.departureTime && (
                        <span>Depart: {format(leg.departureTime, "HH:mm")}</span>
                      )}
                      {leg.arrivalTime && (
                        <span>Arrive: {format(leg.arrivalTime, "HH:mm")}</span>
                      )}
                      {leg.carrier && <span>{leg.carrier}</span>}
                      {leg.flightNumber && <span>#{leg.flightNumber}</span>}
                      {leg.confirmationCode && (
                        <span className="font-mono">Conf: {leg.confirmationCode}</span>
                      )}
                    </div>
                    {leg.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{leg.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(leg.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
