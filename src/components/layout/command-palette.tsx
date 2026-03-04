"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Music,
  CalendarDays,
  MapPin,
  Contact,
  Users,
} from "lucide-react"
import { globalSearch, type SearchResult } from "@/lib/actions/search-actions"

const typeIcons: Record<string, typeof Music> = {
  tour: Music,
  day: CalendarDays,
  venue: MapPin,
  contact: Contact,
  crew: Users,
}

const typeLabels: Record<string, string> = {
  tour: "Tours",
  day: "Tour Days",
  venue: "Venues",
  contact: "Contacts",
  crew: "Crew",
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const router = useRouter()
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await globalSearch(query)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleSelect = (href: string) => {
    setOpen(false)
    setQuery("")
    setResults([])
    router.push(href)
  }

  // Group results by type
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = []
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search tours, venues, contacts, crew..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query.length < 2 && (
          <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
        )}
        {query.length >= 2 && !isSearching && results.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        {isSearching && (
          <CommandEmpty>Searching...</CommandEmpty>
        )}
        {Object.entries(grouped).map(([type, items]) => {
          const Icon = typeIcons[type] || Music
          return (
            <CommandGroup key={type} heading={typeLabels[type] || type}>
              {items.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={`${result.title} ${result.subtitle}`}
                  onSelect={() => handleSelect(result.href)}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )
        })}
      </CommandList>
    </CommandDialog>
  )
}
