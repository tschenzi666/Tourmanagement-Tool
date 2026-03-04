import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, email, password, invite } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if there's a valid invite token
    if (invite) {
      const invitation = await prisma.teamInvitation.findUnique({
        where: { token: invite },
        include: { team: true },
      })

      if (!invitation) {
        return NextResponse.json(
          { error: "Invalid invite link" },
          { status: 400 }
        )
      }

      if (invitation.usedAt) {
        return NextResponse.json(
          { error: "This invite has already been used" },
          { status: 400 }
        )
      }

      if (invitation.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "This invite has expired" },
          { status: 400 }
        )
      }

      if (invitation.email && invitation.email !== email) {
        return NextResponse.json(
          { error: "This invite was sent to a different email address" },
          { status: 400 }
        )
      }

      // Create user and join existing team via invite
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })

      // Join team + mark invite as used
      await prisma.$transaction([
        prisma.teamMember.create({
          data: {
            userId: user.id,
            teamId: invitation.teamId,
            role: invitation.role,
          },
        }),
        prisma.teamInvitation.update({
          where: { id: invitation.id },
          data: { usedAt: new Date(), usedBy: user.id },
        }),
      ])

      return NextResponse.json(
        {
          user: { id: user.id, name: user.name, email: user.email },
          teamId: invitation.teamId,
        },
        { status: 201 }
      )
    }

    // No invite — create user with a new default team
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    const team = await prisma.team.create({
      data: {
        name: `${name}'s Team`,
        slug: `${slug}-${user.id.slice(0, 6)}`,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    })

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email }, teamId: team.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
