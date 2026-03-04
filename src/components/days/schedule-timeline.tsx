"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Trash2 } from "lucide-react"
import { AddScheduleItemDialog } from "./add-schedule-item-dialog"
import { deleteScheduleItem } from "@/lib/actions/tour-day-actions"

interface ScheduleItem {
  id: string
  type: string
  label: string
  startTime: Date | null
  endTime: Date | null
  notes: string | null
  sortOrder: number
}

function formatTime(date: Date | null): string {
  if (!date) return ""
  // Prisma Time fields return a Date with 1970-01-01
  const hours = date.getUTCHours().toString().padStart(2, "0")
  const minutes = date.getUTCMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

const typeIcons: Record<string, string> = {
  LOAD_IN: "📦",
  SOUNDCHECK: "🎤",
  DOORS: "🚪",
  SUPPORT_SET: "🎵",
  SET_TIME: "🎸",
  CHANGEOVER: "🔄",
  CURFEW: "🔔",
  MEET_AND_GREET: "🤝",
  CATERING: "🍽️",
  PRESS: "📰",
  INTERVIEW: "🎙️",
  REHEARSAL: "🎼",
  TRAVEL_DEPART: "✈️",
  TRAVEL_ARRIVE: "🛬",
  HOTEL_CHECK_IN: "🏨",
  HOTEL_CHECK_OUT: "🏨",
  CUSTOM: "📌",
}

export function ScheduleTimeline({
  items,
  tourDayId,
  tourId,
}: {
  items: ScheduleItem[]
  tourDayId: string
  tourId: string
}) {
  const router = useRouter()

  async function handleDelete(itemId: string) {
    await deleteScheduleItem(itemId, tourId)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Schedule
        </CardTitle>
        <AddScheduleItemDialog tourDayId={tourDayId} tourId={tourId} />
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No schedule items yet. Add events to build the day&apos;s timeline.
          </p>
        ) : (
          <div className="space-y-1">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 group"
              >
                <div className="flex items-center gap-2 min-w-[100px] text-sm font-mono text-muted-foreground">
                  {formatTime(item.startTime) || "--:--"}
                  {item.endTime && (
                    <span className="text-xs">- {formatTime(item.endTime)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span>{typeIcons[item.type] ?? "📌"}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
                {index < items.length - 1 && (
                  <div className="absolute left-[68px] top-full w-px h-1 bg-border" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
