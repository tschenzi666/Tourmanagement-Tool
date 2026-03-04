import { Badge } from "@/components/ui/badge"

const categoryConfig: Record<string, { label: string; className: string }> = {
  PROMOTER: { label: "Promoter", className: "bg-green-600 hover:bg-green-700" },
  AGENT: { label: "Agent", className: "bg-blue-600 hover:bg-blue-700" },
  VENUE_STAFF: { label: "Venue Staff", className: "bg-purple-600 hover:bg-purple-700" },
  PRODUCTION: { label: "Production", className: "bg-orange-600 hover:bg-orange-700" },
  CATERING: { label: "Catering", className: "bg-amber-600 hover:bg-amber-700" },
  SECURITY: { label: "Security", className: "bg-red-600 hover:bg-red-700" },
  TRANSPORT: { label: "Transport", className: "bg-sky-600 hover:bg-sky-700" },
  ACCOMMODATION: { label: "Accommodation", className: "bg-teal-600 hover:bg-teal-700" },
  MANAGEMENT: { label: "Management", className: "bg-indigo-600 hover:bg-indigo-700" },
  LABEL: { label: "Label", className: "bg-pink-600 hover:bg-pink-700" },
  PR: { label: "PR", className: "bg-violet-600 hover:bg-violet-700" },
  MERCH: { label: "Merch", className: "bg-lime-600 hover:bg-lime-700" },
  OTHER: { label: "Other", className: "" },
}

export function ContactCategoryBadge({ category }: { category: string }) {
  const config = categoryConfig[category] ?? categoryConfig.OTHER
  return (
    <Badge variant={config.className ? "default" : "secondary"} className={config.className}>
      {config.label}
    </Badge>
  )
}
