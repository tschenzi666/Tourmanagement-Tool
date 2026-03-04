"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapPoint {
  id: string
  date: Date
  dayType: string
  title: string | null
  city: string | null
  country: string | null
  lat: number
  lng: number
  venueName?: string
}

const dayTypeColors: Record<string, string> = {
  SHOW: "#16a34a",
  TRAVEL: "#2563eb",
  OFF: "#9ca3af",
  REHEARSAL: "#9333ea",
  PRESS: "#d97706",
  LOAD_IN: "#ea580c",
  FESTIVAL: "#ec4899",
  OTHER: "#6b7280",
}

export function TourRouteMap({
  points,
  highlightIndex,
}: {
  points: MapPoint[]
  highlightIndex: number | null
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<{ circle: L.CircleMarker; label: L.Marker; color: string }[]>([])

  // Highlight effect when hovering legend
  useEffect(() => {
    markersRef.current.forEach((m, idx) => {
      const point = points[idx]
      if (!point) return
      const isHighlighted = highlightIndex === idx

      if (isHighlighted) {
        m.circle.setStyle({
          radius: 14,
          fillColor: "#f59e0b",
          weight: 3,
          fillOpacity: 1,
        })
        m.circle.bringToFront()
        m.label.setZIndexOffset(1000)

        // Update the div icon to be bigger
        const el = m.label.getElement()
        if (el) {
          const inner = el.querySelector("div") as HTMLElement
          if (inner) {
            inner.style.width = "30px"
            inner.style.height = "30px"
            inner.style.fontSize = "14px"
            inner.style.background = "#f59e0b"
            inner.style.boxShadow = "0 0 12px rgba(245,158,11,0.6)"
          }
        }
      } else {
        m.circle.setStyle({
          radius: point.dayType === "SHOW" || point.dayType === "FESTIVAL" ? 8 : 5,
          fillColor: m.color,
          weight: 2,
          fillOpacity: 0.9,
        })
        m.label.setZIndexOffset(0)

        const el = m.label.getElement()
        if (el) {
          const inner = el.querySelector("div") as HTMLElement
          if (inner) {
            inner.style.width = "20px"
            inner.style.height = "20px"
            inner.style.fontSize = "10px"
            inner.style.background = m.color
            inner.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)"
          }
        }
      }
    })
  }, [highlightIndex, points])

  useEffect(() => {
    if (!mapRef.current || points.length === 0) return
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapRef.current, {
      scrollWheelZoom: true,
      zoomControl: true,
    })
    mapInstanceRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    const bounds = L.latLngBounds([])
    const lineCoords: L.LatLngExpression[] = []
    const markers: { circle: L.CircleMarker; label: L.Marker; color: string }[] = []

    points.forEach((point, index) => {
      const latlng = L.latLng(point.lat, point.lng)
      bounds.extend(latlng)
      lineCoords.push(latlng)

      const color = dayTypeColors[point.dayType] ?? dayTypeColors.OTHER
      const dateStr = new Date(point.date).toLocaleDateString("en-GB", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })

      const circle = L.circleMarker(latlng, {
        radius: point.dayType === "SHOW" || point.dayType === "FESTIVAL" ? 8 : 5,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map)

      circle.bindPopup(`
        <div style="min-width:150px">
          <strong>${point.title ?? point.city ?? "Day " + (index + 1)}</strong><br/>
          <span style="color:${color};font-weight:600">${point.dayType}</span><br/>
          ${dateStr}<br/>
          ${point.venueName ? `<em>${point.venueName}</em><br/>` : ""}
          ${point.city ? `${point.city}${point.country ? ", " + point.country : ""}` : ""}
        </div>
      `)

      // Add number label
      const icon = L.divIcon({
        html: `<div style="
          display:flex;align-items:center;justify-content:center;
          width:20px;height:20px;border-radius:50%;
          background:${color};color:white;font-size:10px;font-weight:bold;
          border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);
          transform:translate(-50%,-50%);
          transition:all 0.15s ease;
        ">${index + 1}</div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [0, 0],
      })

      const label = L.marker(latlng, { icon }).addTo(map)
      markers.push({ circle, label, color })
    })

    markersRef.current = markers

    // Draw route line
    if (lineCoords.length > 1) {
      L.polyline(lineCoords, {
        color: "#6366f1",
        weight: 3,
        opacity: 0.7,
        dashArray: "8, 8",
      }).addTo(map)
    }

    map.fitBounds(bounds, { padding: [40, 40] })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [points])

  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted rounded-lg">
        <p className="text-muted-foreground">
          No locations to display. Add venues with coordinates to tour days.
        </p>
      </div>
    )
  }

  return <div ref={mapRef} className="h-[500px] w-full rounded-lg border" />
}
