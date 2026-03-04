import { Badge } from "@/components/ui/badge"

const dayTypeConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className: string }> = {
  SHOW: { label: "Show", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  TRAVEL: { label: "Travel", variant: "default", className: "bg-blue-600 hover:bg-blue-700" },
  OFF: { label: "Off", variant: "secondary", className: "" },
  REHEARSAL: { label: "Rehearsal", variant: "default", className: "bg-purple-600 hover:bg-purple-700" },
  PRESS: { label: "Press", variant: "default", className: "bg-amber-600 hover:bg-amber-700" },
  LOAD_IN: { label: "Load-In", variant: "default", className: "bg-orange-600 hover:bg-orange-700" },
  FESTIVAL: { label: "Festival", variant: "default", className: "bg-pink-600 hover:bg-pink-700" },
  OTHER: { label: "Other", variant: "outline", className: "" },
}

export function DayTypeBadge({ dayType }: { dayType: string }) {
  const config = dayTypeConfig[dayType] ?? dayTypeConfig.OTHER
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

export function getDayTypeColor(dayType: string): string {
  const colors: Record<string, string> = {
    SHOW: "bg-green-500",
    TRAVEL: "bg-blue-500",
    OFF: "bg-gray-400",
    REHEARSAL: "bg-purple-500",
    PRESS: "bg-amber-500",
    LOAD_IN: "bg-orange-500",
    FESTIVAL: "bg-pink-500",
    OTHER: "bg-gray-500",
  }
  return colors[dayType] ?? colors.OTHER
}
