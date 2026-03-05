import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
]
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Check user is OWNER or ADMIN
    const membership = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
      select: { teamId: true },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Only team owners and admins can upload logos" },
        { status: 403 }
      )
    }

    // 3. Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // 4. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPG, SVG, WebP" },
        { status: 400 }
      )
    }

    // 5. Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 2MB" },
        { status: 400 }
      )
    }

    // 6. Generate unique filename
    const ext = file.name.split(".").pop() || "png"
    const filename = `${crypto.randomUUID()}.${ext}`

    // 7. Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos")
    await mkdir(uploadDir, { recursive: true })

    // 8. Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(path.join(uploadDir, filename), buffer)

    // 9. Update team logoUrl in database
    const logoUrl = `/api/uploads/logos/${filename}`
    await prisma.team.update({
      where: { id: membership.teamId },
      data: { logoUrl },
    })

    return NextResponse.json({ url: logoUrl })
  } catch (error) {
    console.error("Logo upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    )
  }
}
