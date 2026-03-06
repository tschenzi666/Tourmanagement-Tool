import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")
  const lat = request.nextUrl.searchParams.get("lat")
  const lon = request.nextUrl.searchParams.get("lon")

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  const params = new URLSearchParams({
    q: query,
    limit: "8",
    lang: "de",
    osm_tag: "amenity:restaurant",
  })

  // Remove osm_tag filter to search all place types
  params.delete("osm_tag")

  if (lat && lon) {
    params.set("lat", lat)
    params.set("lon", lon)
  }

  const res = await fetch(
    `https://photon.komoot.io/api/?${params.toString()}`,
    { next: { revalidate: 300 } }
  )

  if (!res.ok) {
    return NextResponse.json([], { status: 200 })
  }

  const data = await res.json()

  const results = (data.features || []).map((f: PhotonFeature) => ({
    name: f.properties.name,
    address: [f.properties.street, f.properties.housenumber]
      .filter(Boolean)
      .join(" ") || undefined,
    city: f.properties.city || f.properties.town || f.properties.village,
    country: f.properties.country,
    category: f.properties.osm_value,
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
    osmId: f.properties.osm_id?.toString(),
  }))

  return NextResponse.json(results)
}

interface PhotonFeature {
  properties: {
    name?: string
    street?: string
    housenumber?: string
    city?: string
    town?: string
    village?: string
    country?: string
    osm_value?: string
    osm_id?: number
  }
  geometry: {
    coordinates: [number, number]
  }
}
