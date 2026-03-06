"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, MapPin, Plus, Loader2 } from "lucide-react"
import { addSuggestion } from "@/lib/actions/voting-actions"

interface PlaceResult {
  name: string
  address?: string
  city?: string
  country?: string
  category?: string
  latitude?: number
  longitude?: number
  osmId?: string
}

interface Props {
  sessionId: string
  tourId: string
  defaultCity?: string
}

export function PlaceSearch({ sessionId, tourId, defaultCity }: Props) {
  const [query, setQuery] = useState(defaultCity ? `${defaultCity} ` : "")
  const [results, setResults] = useState<PlaceResult[]>([])
  const [selected, setSelected] = useState<PlaceResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `/api/places/search?q=${encodeURIComponent(query)}`
        )
        const data = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  function handleSelect(place: PlaceResult) {
    setSelected(place)
    setResults([])
    setQuery(place.name)
  }

  function handleReset() {
    setSelected(null)
    setQuery("")
    setShowManual(false)
  }

  if (selected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vorschlag hinzufugen</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              await addSuggestion(formData)
              handleReset()
            }}
            className="space-y-3"
          >
            <input type="hidden" name="sessionId" value={sessionId} />
            <input type="hidden" name="tourId" value={tourId} />
            <input type="hidden" name="name" value={selected.name} />
            {selected.address && (
              <input type="hidden" name="address" value={selected.address} />
            )}
            {selected.city && (
              <input type="hidden" name="city" value={selected.city} />
            )}
            {selected.country && (
              <input type="hidden" name="country" value={selected.country} />
            )}
            {selected.category && (
              <input type="hidden" name="category" value={selected.category} />
            )}
            {selected.latitude && (
              <input
                type="hidden"
                name="latitude"
                value={selected.latitude.toString()}
              />
            )}
            {selected.longitude && (
              <input
                type="hidden"
                name="longitude"
                value={selected.longitude.toString()}
              />
            )}
            {selected.osmId && (
              <input type="hidden" name="osmId" value={selected.osmId} />
            )}

            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="font-medium">{selected.name}</p>
              {(selected.address || selected.city) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {[selected.address, selected.city, selected.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {selected.category && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selected.category}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Kommentar (optional)</Label>
              <Textarea
                id="note"
                name="note"
                placeholder="z.B. Super Cocktails, war letztes Mal klasse..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Vorschlagen
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Abbrechen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (showManual) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manuell hinzufugen</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              await addSuggestion(formData)
              handleReset()
            }}
            className="space-y-3"
          >
            <input type="hidden" name="sessionId" value={sessionId} />
            <input type="hidden" name="tourId" value={tourId} />

            <div className="space-y-2">
              <Label htmlFor="manual-name">Name *</Label>
              <Input
                id="manual-name"
                name="name"
                placeholder="z.B. Pizza Napoli"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="manual-city">Stadt</Label>
                <Input
                  id="manual-city"
                  name="city"
                  placeholder="z.B. Berlin"
                  defaultValue={defaultCity}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-address">Adresse</Label>
                <Input
                  id="manual-address"
                  name="address"
                  placeholder="z.B. Hauptstr. 1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-note">Kommentar</Label>
              <Textarea
                id="manual-note"
                name="note"
                placeholder="Warum diesen Ort?"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Vorschlagen
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Abbrechen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Venue vorschlagen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Restaurant, Bar, Club suchen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {results.length > 0 && (
          <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
            {results.map((place, i) => (
              <button
                key={`${place.osmId ?? i}`}
                className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors"
                onClick={() => handleSelect(place)}
              >
                <p className="font-medium text-sm">{place.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {[place.address, place.city, place.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {place.category && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {place.category}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground pt-1">
          Powered by{" "}
          <a
            href="https://photon.komoot.io"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Photon/Komoot
          </a>
          {" "}&{" "}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            OpenStreetMap
          </a>
          {" | "}
          <button
            className="underline hover:text-foreground"
            onClick={() => setShowManual(true)}
          >
            Manuell eingeben
          </button>
        </p>
      </CardContent>
    </Card>
  )
}
