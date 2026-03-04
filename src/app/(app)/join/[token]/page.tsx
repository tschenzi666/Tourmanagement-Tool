import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { acceptInvite } from "@/lib/actions/team-actions"

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const session = await auth()

  // If not logged in, redirect to register with invite token
  if (!session?.user?.id) {
    redirect(`/register?invite=${token}`)
  }

  // Validate the invite
  const invite = await prisma.teamInvitation.findUnique({
    where: { token },
    include: { team: { select: { name: true } } },
  })

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    redirect("/dashboard?error=invalid-invite")
  }

  // Check if email restriction applies
  if (invite.email && invite.email !== session.user.email) {
    redirect("/dashboard?error=invite-email-mismatch")
  }

  // Check if already a member
  const existing = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: session.user.id,
        teamId: invite.teamId,
      },
    },
  })

  if (existing) {
    redirect("/dashboard")
  }

  // Accept the invite
  try {
    await acceptInvite(token)
  } catch {
    redirect("/dashboard?error=invite-failed")
  }

  redirect("/dashboard?joined=true")
}
