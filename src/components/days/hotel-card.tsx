"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Hotel, Trash2, Phone, Mail, Globe, MapPin } from "lucide-react"
import { AddHotelStayDialog } from "./add-hotel-stay-dialog"
import { deleteHotelStay } from "@/lib/actions/tour-day-actions"
import { format } from "date-fns"

interface HotelStay {
  id: string
  hotelName: string
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  website: string | null
  checkIn: Date | null
  checkOut: Date | null
  confirmationCode: string | null
  notes: string | null
}

export function HotelCard({
  stay,
  tourDayId,
  tourId,
}: {
  stay: HotelStay | null
  tourDayId: string
  tourId: string
}) {
  const router = useRouter()

  async function handleDelete() {
    if (!stay) return
    await deleteHotelStay(stay.id, tourId)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Hotel className="h-5 w-5" />
          Hotel
        </CardTitle>
        {!stay && <AddHotelStayDialog tourDayId={tourDayId} tourId={tourId} />}
      </CardHeader>
      <CardContent>
        {!stay ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No hotel added yet.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-base">{stay.hotelName}</h3>
                {stay.address && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {stay.address}{stay.city ? `, ${stay.city}` : ""}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {stay.checkIn && (
                <span>Check-in: {format(stay.checkIn, "MMM d, HH:mm")}</span>
              )}
              {stay.checkOut && (
                <span>Check-out: {format(stay.checkOut, "MMM d, HH:mm")}</span>
              )}
              {stay.confirmationCode && (
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                  {stay.confirmationCode}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {stay.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {stay.phone}
                </span>
              )}
              {stay.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {stay.email}
                </span>
              )}
              {stay.website && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {stay.website}
                </span>
              )}
            </div>
            {stay.notes && (
              <p className="text-sm text-muted-foreground">{stay.notes}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
