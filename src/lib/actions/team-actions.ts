"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { updateTeamBrandingSchema, createInviteSchema } from "@/lib/validations/team"
import { revalidatePath } from "next/cache"
import type { TeamRole } from "@prisma/client"

async function getSessionUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user
}

async function requireTeamAdmin(userId: string) {
  const membership = await prisma.teamMember.findFirst({
    where: {
      userId,
      role: { in: ["OWNER", "ADMIN"] },
    },
    select: { teamId: true, role: true },
  })
  if (!membership) throw new Error("Admin access required")
  return membership
}

async function getUserTeamId(userId: string) {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
    orderBy: { createdAt: "asc" },
  })
  if (!membership) throw new Error("No team found")
  return membership.teamId
}

export async function updateTeamName(name: string) {
  const user = await getSessionUser()
  const { teamId } = await requireTeamAdmin(user.id!)

  if (!name || name.length > 200) throw new Error("Invalid team name")

  await prisma.team.update({
    where: { id: teamId },
    data: { name },
  })

  revalidatePath("/", "layout")
}

export async function updateTeamBranding(data: {
  brandColor: string | null
  brandFont: string | null
  showLogoInSidebar: boolean
  showLogoInPrint: boolean
}) {
  const user = await getSessionUser()
  const { teamId } = await requireTeamAdmin(user.id!)

  const validated = updateTeamBrandingSchema.parse(data)

  await prisma.team.update({
    where: { id: teamId },
    data: {
      brandColor: validated.brandColor,
      brandFont: validated.brandFont,
      showLogoInSidebar: validated.showLogoInSidebar,
      showLogoInPrint: validated.showLogoInPrint,
    },
  })

  revalidatePath("/", "layout")
}

export async function removeTeamLogo() {
  const user = await getSessionUser()
  const { teamId } = await requireTeamAdmin(user.id!)

  await prisma.team.update({
    where: { id: teamId },
    data: { logoUrl: null },
  })

  revalidatePath("/", "layout")
}

// ─── Team Invitation Actions ─────────────────────────────────

export async function createTeamInvite(role: string, email?: string) {
  const user = await getSessionUser()
  const { teamId } = await requireTeamAdmin(user.id!)

  const validated = createInviteSchema.parse({ role, email: email || undefined })

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7-day expiry

  const invite = await prisma.teamInvitation.create({
    data: {
      role: validated.role as TeamRole,
      email: validated.email || null,
      teamId,
      createdBy: user.id!,
      expiresAt,
    },
  })

  revalidatePath("/settings")
  return invite.token
}

export async function revokeTeamInvite(inviteId: string) {
  const user = await getSessionUser()
  const { teamId } = await requireTeamAdmin(user.id!)

  // Verify invite belongs to this team
  const invite = await prisma.teamInvitation.findFirst({
    where: { id: inviteId, teamId },
  })
  if (!invite) throw new Error("Invite not found")

  await prisma.teamInvitation.delete({
    where: { id: inviteId },
  })

  revalidatePath("/settings")
}

export async function getTeamMembers() {
  const user = await getSessionUser()
  const teamId = await getUserTeamId(user.id!)

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return members
}

export async function getTeamInvites() {
  const user = await getSessionUser()
  const { teamId } = await requireTeamAdmin(user.id!)

  const invites = await prisma.teamInvitation.findMany({
    where: {
      teamId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  return invites
}

export async function updateMemberRole(memberId: string, newRole: string) {
  const user = await getSessionUser()
  const { teamId, role: callerRole } = await requireTeamAdmin(user.id!)

  // Cannot promote to OWNER unless you're the owner
  if (newRole === "OWNER" && callerRole !== "OWNER") {
    throw new Error("Only the team owner can transfer ownership")
  }

  // Verify member belongs to this team
  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, teamId },
  })
  if (!member) throw new Error("Member not found")

  // Cannot change the owner's role
  if (member.role === "OWNER") {
    throw new Error("Cannot change the team owner's role")
  }

  await prisma.teamMember.update({
    where: { id: memberId },
    data: { role: newRole as TeamRole },
  })

  revalidatePath("/settings")
}

export async function removeMember(memberId: string) {
  const user = await getSessionUser()
  const { teamId } = await requireTeamAdmin(user.id!)

  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, teamId },
  })
  if (!member) throw new Error("Member not found")

  // Cannot remove the owner
  if (member.role === "OWNER") {
    throw new Error("Cannot remove the team owner")
  }

  // Cannot remove yourself
  if (member.userId === user.id) {
    throw new Error("Cannot remove yourself")
  }

  await prisma.teamMember.delete({
    where: { id: memberId },
  })

  revalidatePath("/settings")
}

export async function acceptInvite(token: string) {
  const user = await getSessionUser()

  const invite = await prisma.teamInvitation.findUnique({
    where: { token },
    include: { team: { select: { name: true } } },
  })

  if (!invite) throw new Error("Invite not found")
  if (invite.usedAt) throw new Error("This invite has already been used")
  if (invite.expiresAt < new Date()) throw new Error("This invite has expired")
  if (invite.email && invite.email !== user.email) {
    throw new Error("This invite was sent to a different email address")
  }

  // Check if already a team member
  const existing = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: user.id!, teamId: invite.teamId } },
  })
  if (existing) throw new Error("You are already a member of this team")

  // Join team + mark invite as used in a transaction
  await prisma.$transaction([
    prisma.teamMember.create({
      data: {
        userId: user.id!,
        teamId: invite.teamId,
        role: invite.role,
      },
    }),
    prisma.teamInvitation.update({
      where: { id: invite.id },
      data: { usedAt: new Date(), usedBy: user.id! },
    }),
  ])

  revalidatePath("/", "layout")
  return invite.team.name
}
