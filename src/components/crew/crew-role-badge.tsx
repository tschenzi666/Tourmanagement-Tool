import { Badge } from "@/components/ui/badge"
import { formatCrewRole } from "@/lib/validations/crew"

const departmentColors: Record<string, string> = {
  Management: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Audio: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Lighting: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Video: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  Backline: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Stage: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Rigging: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "Wardrobe & Styling": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  Catering: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
  Transport: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
  Merchandise: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Security: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "Artist / Talent": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  Other: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300",
}

export function CrewRoleBadge({ role }: { role: string }) {
  return (
    <Badge variant="outline" className="text-xs font-normal">
      {formatCrewRole(role)}
    </Badge>
  )
}

export function DepartmentBadge({ department }: { department: string }) {
  const colors = departmentColors[department] || departmentColors.Other

  return (
    <Badge className={`text-xs font-medium border-0 ${colors}`}>
      {department}
    </Badge>
  )
}
