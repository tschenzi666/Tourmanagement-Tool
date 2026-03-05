import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  webp: "image/webp",
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // Prevent path traversal
  const safeName = path.basename(filename)
  const filePath = path.join(process.cwd(), "public", "uploads", "logos", safeName)

  try {
    const buffer = await readFile(filePath)
    const ext = safeName.split(".").pop()?.toLowerCase() || ""
    const contentType = MIME_TYPES[ext] || "application/octet-stream"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
