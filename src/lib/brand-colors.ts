/**
 * Brand color utilities
 * Converts hex colors to oklch and generates CSS variable overrides
 * for the shadcn/ui theming system.
 */

// ─── Hex → oklch conversion pipeline ────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearRgbToXyz(r: number, g: number, b: number): [number, number, number] {
  return [
    0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    0.2126729 * r + 0.7151522 * g + 0.0721750 * b,
    0.0193339 * r + 0.1191920 * g + 0.9503041 * b,
  ]
}

function xyzToOklab(x: number, y: number, z: number): [number, number, number] {
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z)
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z)
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z)

  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ]
}

function oklabToOklch(L: number, a: number, b: number): [number, number, number] {
  const C = Math.sqrt(a * a + b * b)
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0) h += 360
  return [L, C, h]
}

/** Convert a hex color string to oklch [L, C, H] */
export function hexToOklch(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex)
  const [lr, lg, lb] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)]
  const [x, y, z] = linearRgbToXyz(lr, lg, lb)
  const [L, a, ob] = xyzToOklab(x, y, z)
  return oklabToOklch(L, a, ob)
}

function oklchStr(L: number, C: number, H: number): string {
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(3)})`
}

// ─── CSS variable generation ────────────────────────────────────

/**
 * Generate light-mode CSS variable overrides from a brand hex color.
 * Overrides: --primary, --primary-foreground, --sidebar-primary,
 * --sidebar-primary-foreground, --accent, --ring
 */
export function generateBrandCssVars(hex: string): Record<string, string> {
  const [L, C, H] = hexToOklch(hex)

  // Primary: use brand color at a readable lightness (0.45-0.55 range)
  const primaryL = Math.max(0.35, Math.min(0.55, L))
  const primaryC = Math.min(C, 0.25)

  // Foreground: white or black depending on contrast
  const fgL = primaryL < 0.6 ? 0.985 : 0.141

  // Accent: very light tint of brand color
  const accentL = 0.95
  const accentC = Math.min(C * 0.15, 0.03)

  // Ring: muted version
  const ringL = 0.65
  const ringC = Math.min(C * 0.5, 0.1)

  return {
    "--primary": oklchStr(primaryL, primaryC, H),
    "--primary-foreground": oklchStr(fgL, 0, 0),
    "--sidebar-primary": oklchStr(primaryL, primaryC, H),
    "--sidebar-primary-foreground": oklchStr(fgL, 0, 0),
    "--accent": oklchStr(accentL, accentC, H),
    "--accent-foreground": oklchStr(0.21, 0.006, H),
    "--ring": oklchStr(ringL, ringC, H),
  }
}

/**
 * Generate dark-mode CSS variable overrides from a brand hex color.
 */
export function generateDarkBrandCssVars(hex: string): Record<string, string> {
  const [, C, H] = hexToOklch(hex)

  // Dark mode primary: lighter version of brand color
  const primaryL = 0.75
  const primaryC = Math.min(C, 0.2)

  // Foreground: dark for contrast against light primary
  const fgL = 0.21

  // Sidebar primary: brighter in dark mode
  const sidebarL = 0.65
  const sidebarC = Math.min(C, 0.22)

  // Accent: dark tint
  const accentL = 0.3
  const accentC = Math.min(C * 0.2, 0.04)

  // Ring: muted
  const ringL = 0.5
  const ringC = Math.min(C * 0.4, 0.08)

  return {
    "--primary": oklchStr(primaryL, primaryC, H),
    "--primary-foreground": oklchStr(fgL, 0.006, 285),
    "--sidebar-primary": oklchStr(sidebarL, sidebarC, H),
    "--sidebar-primary-foreground": oklchStr(0.985, 0, 0),
    "--accent": oklchStr(accentL, accentC, H),
    "--accent-foreground": oklchStr(0.985, 0, 0),
    "--ring": oklchStr(ringL, ringC, H),
  }
}

/** Curated list of Google Fonts to choose from */
export const BRAND_FONTS = [
  { name: "Merriweather", description: "Elegant serif" },
  { name: "Poppins", description: "Geometric & friendly" },
  { name: "Montserrat", description: "Bold & stylish" },
  { name: "DM Sans", description: "Compact & professional" },
] as const

export type BrandFont = (typeof BRAND_FONTS)[number]["name"]
