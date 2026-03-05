/**
 * Normalize logo URLs so that old paths (/uploads/logos/...)
 * are rewritten to the API serving route (/api/uploads/logos/...).
 * Next.js in production does not serve files added to public/ after build.
 */
export function normalizeLogoUrl(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith("/uploads/logos/")) {
    return url.replace("/uploads/logos/", "/api/uploads/logos/")
  }
  return url
}
