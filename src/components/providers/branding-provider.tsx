"use client"

import { createContext, useContext, useEffect } from "react"
import type { TeamBranding } from "@/lib/types/team-branding"
import {
  generateBrandCssVars,
  generateDarkBrandCssVars,
} from "@/lib/brand-colors"

const BrandingContext = createContext<TeamBranding | null>(null)

export function useBranding() {
  return useContext(BrandingContext)
}

export function BrandingProvider({
  branding,
  children,
}: {
  branding: TeamBranding | null
  children: React.ReactNode
}) {
  // Inject brand color overrides via a <style> tag
  useEffect(() => {
    if (!branding?.brandColor) {
      // Remove any existing overrides if color was cleared
      const existing = document.getElementById("team-branding-colors")
      if (existing) existing.remove()
      return
    }

    const lightVars = generateBrandCssVars(branding.brandColor)
    const darkVars = generateDarkBrandCssVars(branding.brandColor)

    const styleId = "team-branding-colors"
    let el = document.getElementById(styleId) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement("style")
      el.id = styleId
      document.head.appendChild(el)
    }

    const lightRules = Object.entries(lightVars)
      .map(([k, v]) => `${k}: ${v};`)
      .join("\n  ")
    const darkRules = Object.entries(darkVars)
      .map(([k, v]) => `${k}: ${v};`)
      .join("\n  ")

    el.textContent = `:root {\n  ${lightRules}\n}\n.dark {\n  ${darkRules}\n}`

    return () => {
      el?.remove()
    }
  }, [branding?.brandColor])

  // Inject brand font via Google Fonts <link> tag
  useEffect(() => {
    const linkId = "team-brand-font"
    const existingLink = document.getElementById(linkId) as HTMLLinkElement | null

    if (!branding?.brandFont) {
      // Remove custom font and reset
      if (existingLink) existingLink.remove()
      document.documentElement.style.removeProperty("--font-geist-sans")
      return
    }

    // Create or update the Google Fonts link
    let link = existingLink
    if (!link) {
      link = document.createElement("link")
      link.id = linkId
      link.rel = "stylesheet"
      document.head.appendChild(link)
    }

    const fontName = branding.brandFont.replace(/ /g, "+")
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`

    // Override the sans font variable used throughout the app
    document.documentElement.style.setProperty(
      "--font-geist-sans",
      `"${branding.brandFont}", sans-serif`
    )

    return () => {
      link?.remove()
      document.documentElement.style.removeProperty("--font-geist-sans")
    }
  }, [branding?.brandFont])

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  )
}
