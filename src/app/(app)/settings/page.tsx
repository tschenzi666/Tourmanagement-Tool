import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { BrandingSettingsForm } from "@/components/settings/branding-settings-form"
import { TeamMembersSection } from "@/components/settings/team-members-section"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await prisma.teamMember.findFirst({
    where: { userId: session.user.id },
    include: { team: true },
    orderBy: { createdAt: "asc" },
  })

  if (!membership) redirect("/dashboard")

  const isAdmin = ["OWNER", "ADMIN"].includes(membership.role)

  // Fetch team members
  const members = await prisma.teamMember.findMany({
    where: { teamId: membership.teamId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  // Fetch pending invites (admin only)
  const invites = isAdmin
    ? await prisma.teamInvitation.findMany({
        where: {
          teamId: membership.teamId,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      })
    : []

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Team Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and customize branding.
          </p>
        </div>

        {/* Team Members Section — visible to all, editing for admins only */}
        <div className="max-w-2xl">
          <TeamMembersSection
            members={JSON.parse(JSON.stringify(members))}
            invites={JSON.parse(JSON.stringify(invites))}
            currentUserId={session.user.id}
            isAdmin={isAdmin}
          />
        </div>

        {/* Branding Section — admin only */}
        {isAdmin ? (
          <BrandingSettingsForm
            team={{
              id: membership.team.id,
              name: membership.team.name,
              logoUrl: membership.team.logoUrl,
              brandColor: membership.team.brandColor,
              brandFont: membership.team.brandFont,
              showLogoInSidebar: membership.team.showLogoInSidebar,
              showLogoInPrint: membership.team.showLogoInPrint,
            }}
          />
        ) : (
          <div className="rounded-lg border p-6 text-center text-muted-foreground max-w-2xl">
            Only team owners and admins can change branding settings.
          </div>
        )}
      </div>
    </>
  )
}
