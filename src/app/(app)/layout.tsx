import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getTeamsForUser } from "@/lib/queries/team-queries"
import { getToursForUser } from "@/lib/queries/tour-queries"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { CommandPalette } from "@/components/layout/command-palette"
import { BrandingProvider } from "@/components/providers/branding-provider"
import type { TeamBranding } from "@/lib/types/team-branding"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const [teams, tours] = await Promise.all([
    getTeamsForUser(session.user.id),
    getToursForUser(session.user.id),
  ])

  // Build branding from the user's active team
  const activeTeam = teams[0]
  const branding: TeamBranding | null = activeTeam
    ? {
        teamId: activeTeam.id,
        teamName: activeTeam.name,
        logoUrl: activeTeam.logoUrl,
        brandColor: activeTeam.brandColor,
        brandFont: activeTeam.brandFont,
        showLogoInSidebar: activeTeam.showLogoInSidebar,
        showLogoInPrint: activeTeam.showLogoInPrint,
      }
    : null

  return (
    <BrandingProvider branding={branding}>
      <SidebarProvider>
        <AppSidebar
          user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
          teams={teams.map((t) => ({ id: t.id, name: t.name, slug: t.slug }))}
          tours={tours.map((t) => ({
            id: t.id,
            name: t.name,
            artist: t.artist,
            status: t.status,
            teamId: t.teamId,
          }))}
        />
        <SidebarInset>
          {children}
        </SidebarInset>
        <CommandPalette />
        <Toaster />
      </SidebarProvider>
    </BrandingProvider>
  )
}
