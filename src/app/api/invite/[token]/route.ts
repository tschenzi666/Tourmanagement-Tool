import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invite = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        team: { select: { name: true } },
      },
    })

    if (!invite) {
      return NextResponse.json(
        { error: "Invite not found" },
        { status: 404 }
      )
    }

    if (invite.usedAt) {
      return NextResponse.json(
        { error: "This invite has already been used" },
        { status: 410 }
      )
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 410 }
      )
    }

    return NextResponse.json({
      teamName: invite.team.name,
      role: invite.role,
      email: invite.email,
      expiresAt: invite.expiresAt.toISOString(),
    })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
