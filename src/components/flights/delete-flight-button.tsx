"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteTravelTicket } from "@/lib/actions/crew-actions"

export function DeleteTravelTicketButton({ tourId, ticketId }: { tourId: string; ticketId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            await deleteTravelTicket(tourId, ticketId)
            toast.success("Ticket deleted")
            router.refresh()
          } catch {
            toast.error("Failed to delete")
          }
        })
      }}
    >
      <Trash2 className="h-3 w-3 text-muted-foreground" />
    </Button>
  )
}
