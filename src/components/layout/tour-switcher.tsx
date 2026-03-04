"use client"

import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface TourSwitcherProps {
  tours: {
    id: string
    name: string
    artist?: string | null
    status: string
  }[]
  currentTourId?: string
}

export function TourSwitcher({ tours, currentTourId }: TourSwitcherProps) {
  const router = useRouter()

  if (tours.length === 0) {
    return (
      <div className="px-2 py-2">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/tours/new">
            <Plus className="mr-2 h-4 w-4" />
            Create your first tour
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="px-2 py-2">
      <Select
        value={currentTourId ?? ""}
        onValueChange={(value) => {
          if (value === "new") {
            router.push("/tours/new")
          } else {
            router.push(`/tours/${value}`)
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a tour..." />
        </SelectTrigger>
        <SelectContent>
          {tours.map((tour) => (
            <SelectItem key={tour.id} value={tour.id}>
              <div className="flex flex-col">
                <span>{tour.name}</span>
                {tour.artist && (
                  <span className="text-xs text-muted-foreground">{tour.artist}</span>
                )}
              </div>
            </SelectItem>
          ))}
          <SelectItem value="new">
            <div className="flex items-center">
              <Plus className="mr-2 h-3 w-3" />
              New Tour
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
