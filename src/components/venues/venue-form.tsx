"use client"

import { useState, useRef, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Globe } from "lucide-react"
import { VenueSearch, type VenueSearchResult } from "@/components/venues/venue-search"

interface Venue {
  id: string
  name: string
  city: string
  country: string
  address: string | null
  postalCode: string | null
  capacity: number | null
  venueType: string | null
  phone: string | null
  email: string | null
  website: string | null
  wifiNetwork: string | null
  wifiPassword: string | null
  loadInNotes: string | null
  parkingNotes: string | null
  notes: string | null
}

const venueTypes = [
  "Arena", "Theater", "Club", "Festival", "Stadium",
  "Amphitheater", "Bar", "Church", "Outdoor", "Other",
]

export function VenueForm({
  action,
  venue,
  submitLabel = "Create Venue",
}: {
  action: (formData: FormData) => Promise<void>
  venue?: Venue
  submitLabel?: string
}) {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Controlled state for fields that get auto-filled
  const [name, setName] = useState(venue?.name ?? "")
  const [city, setCity] = useState(venue?.city ?? "")
  const [country, setCountry] = useState(venue?.country ?? "")
  const [address, setAddress] = useState(venue?.address ?? "")
  const [postalCode, setPostalCode] = useState(venue?.postalCode ?? "")
  const [capacity, setCapacity] = useState(venue?.capacity?.toString() ?? "")
  const [phone, setPhone] = useState(venue?.phone ?? "")
  const [email, setEmail] = useState(venue?.email ?? "")
  const [website, setWebsite] = useState(venue?.website ?? "")

  function handleSearchSelect(result: VenueSearchResult) {
    setName(result.name)
    setCity(result.city)
    setCountry(result.country)
    setAddress(result.address)
    setPostalCode(result.postalCode)
    if (result.phone) setPhone(result.phone)
    if (result.email) setEmail(result.email)
    if (result.website) setWebsite(result.website)
    if (result.capacity) setCapacity(result.capacity)
    toast.success("Venue info loaded! Review and adjust the details below.")
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    if (!form.get("name")?.toString().trim()) {
      setError("Venue name is required")
      return
    }
    if (!form.get("city")?.toString().trim()) {
      setError("City is required")
      return
    }

    startTransition(async () => {
      try {
        await action(form)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong"
        setError(message)
        toast.error(message)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* ─── Search from Web ───────────────────────────────────── */}
      {!venue && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Search Venue
            </CardTitle>
            <CardDescription>
              Search for a venue to auto-fill address, city, country, and contact info from OpenStreetMap.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VenueSearch onSelect={handleSearchSelect} />
          </CardContent>
        </Card>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Venue Name *</Label>
                <Input id="name" name="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Madison Square Garden" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venueType">Venue Type</Label>
                <Select name="venueType" defaultValue={venue?.venueType ?? ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {venueTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" name="city" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. US" maxLength={10} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 20000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" name="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="e.g. 10001" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 212 555 0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="venue@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wifiNetwork">WiFi Network</Label>
                <Input id="wifiNetwork" name="wifiNetwork" defaultValue={venue?.wifiNetwork ?? ""} placeholder="Network name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wifiPassword">WiFi Password</Label>
                <Input id="wifiPassword" name="wifiPassword" defaultValue={venue?.wifiPassword ?? ""} placeholder="Password" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loadInNotes">Load-In Notes</Label>
              <Textarea id="loadInNotes" name="loadInNotes" defaultValue={venue?.loadInNotes ?? ""} placeholder="Load-in instructions, stage door location, height limits..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parkingNotes">Parking Notes</Label>
              <Textarea id="parkingNotes" name="parkingNotes" defaultValue={venue?.parkingNotes ?? ""} placeholder="Parking locations, truck access..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">General Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={venue?.notes ?? ""} placeholder="Any other notes about this venue..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}
