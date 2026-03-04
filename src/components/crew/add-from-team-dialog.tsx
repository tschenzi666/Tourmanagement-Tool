"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Users, UserPlus } from "lucide-react"
import { addTeamMembersAsCrew } from "@/lib/actions/crew-actions"
import { crewRoles, formatCrewRole } from "@/lib/validations/crew"

interface AvailableTeamMember {
  userId: string
  name: string
  email: string
  teamRole: string
}

interface AddFromTeamDialogProps {
  tourId: string
  availableMembers: AvailableTeamMember[]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function AddFromTeamDialog({
  tourId,
  availableMembers,
}: AddFromTeamDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<
    Record<string, { checked: boolean; role: string }>
  >({})

  function toggleMember(userId: string, name: string) {
    setSelected((prev) => ({
      ...prev,
      [userId]: {
        checked: !prev[userId]?.checked,
        role: prev[userId]?.role || "OTHER",
      },
    }))
  }

  function setMemberRole(userId: string, role: string) {
    setSelected((prev) => ({
      ...prev,
      [userId]: {
        checked: prev[userId]?.checked ?? true,
        role,
      },
    }))
  }

  function handleAdd() {
    const members = availableMembers
      .filter((m) => selected[m.userId]?.checked)
      .map((m) => ({
        userId: m.userId,
        name: m.name,
        role: selected[m.userId]?.role || "OTHER",
      }))

    if (members.length === 0) {
      toast.error("Select at least one team member")
      return
    }

    startTransition(async () => {
      try {
        const result = await addTeamMembersAsCrew(tourId, members)
        toast.success(
          `${result.added} member${result.added !== 1 ? "s" : ""} added to crew!`
        )
        setOpen(false)
        setSelected({})
        router.refresh()
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add members"
        )
      }
    })
  }

  const selectedCount = Object.values(selected).filter((s) => s.checked).length

  if (availableMembers.length === 0) {
    return (
      <Button variant="outline" disabled title="All team members are already in this tour's crew">
        <Users className="mr-2 h-4 w-4" />
        Add from Team
      </Button>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setSelected({})
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="mr-2 h-4 w-4" />
          Add from Team
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Team Members to Crew
          </DialogTitle>
          <DialogDescription>
            Select team members to add to this tour&apos;s crew roster. You can
            assign their crew role for each person.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto space-y-2 py-2">
          {availableMembers.map((member) => {
            const isChecked = selected[member.userId]?.checked ?? false

            return (
              <div
                key={member.userId}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  isChecked
                    ? "border-primary/50 bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() =>
                    toggleMember(member.userId, member.name)
                  }
                />

                {/* Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {getInitials(member.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.email}
                  </p>
                </div>

                {/* Role selector */}
                {isChecked && (
                  <Select
                    value={selected[member.userId]?.role || "OTHER"}
                    onValueChange={(val) => setMemberRole(member.userId, val)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {crewRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {formatCrewRole(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {selectedCount > 0 && (
                <Badge variant="secondary">{selectedCount} selected</Badge>
              )}
            </span>
            <Button
              onClick={handleAdd}
              disabled={isPending || selectedCount === 0}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isPending
                ? "Adding..."
                : `Add ${selectedCount > 0 ? selectedCount : ""} to Crew`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
