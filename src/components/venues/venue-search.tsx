"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Loader2 } from "lucide-react"

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    country_code?: string
    postcode?: string
  }
  type?: string
  extratags?: {
    website?: string
    phone?: string
    email?: string
    capacity?: string
    "contact:website"?: string
    "contact:phone"?: string
    "contact:email"?: string
  }
}

export interface VenueSearchResult {
  name: string
  city: string
  country: string
  address: string
  postalCode: string
  latitude: number
  longitude: number
  phone: string
  email: string
  website: string
  capacity: string
}

export function VenueSearch({ onSelect }: { onSelect: (result: VenueSearchResult) => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async () => {
    if (!query.trim()) return
    setIsSearching(true)
    setHasSearched(true)

    try {
      const params = new URLSearchParams({
        q: query,
        format: "json",
        addressdetails: "1",
        extratags: "1",
        limit: "5",
      })

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: { "User-Agent": "TourManagementTool/1.0" },
        }
      )

      if (!res.ok) throw new Error("Search failed")
      const data: NominatimResult[] = await res.json()
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query])

  function handleSelect(result: NominatimResult) {
    const addr = result.address
    const ext = result.extratags || {}

    // Extract a clean name from the display name (first part before the comma)
    const nameFromDisplay = result.display_name.split(",")[0].trim()

    const city = addr.city || addr.town || addr.village || ""
    const street = addr.house_number
      ? `${addr.road || ""} ${addr.house_number}`.trim()
      : addr.road || ""

    onSelect({
      name: nameFromDisplay,
      city,
      country: addr.country_code?.toUpperCase() || addr.country || "",
      address: street,
      postalCode: addr.postcode || "",
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      phone: ext.phone || ext["contact:phone"] || "",
      email: ext.email || ext["contact:email"] || "",
      website: ext.website || ext["contact:website"] || "",
      capacity: ext.capacity || "",
    })

    // Clear after selection
    setResults([])
    setQuery("")
    setHasSearched(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
            placeholder="Search for a venue... (e.g. Olympia Paris, O2 Arena London)"
            className="pl-9"
          />
        </div>
        <Button type="button" variant="secondary" onClick={search} disabled={isSearching || !query.trim()}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {results.length > 0 && (
        <Card>
          <CardContent className="p-2">
            <div className="space-y-1">
              {results.map((r) => (
                <button
                  key={r.place_id}
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {r.display_name.split(",")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {r.display_name.split(",").slice(1, 4).join(",")}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hasSearched && results.length === 0 && !isSearching && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No results found. Try a different search term.
        </p>
      )}
    </div>
  )
}
