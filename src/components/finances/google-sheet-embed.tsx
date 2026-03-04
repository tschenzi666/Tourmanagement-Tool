"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sheet, ExternalLink, X } from "lucide-react"

export function GoogleSheetEmbed() {
  const [sheetUrl, setSheetUrl] = useState("")
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  function handleEmbed() {
    if (!sheetUrl) return

    // Convert Google Sheets URL to embed URL
    // Input: https://docs.google.com/spreadsheets/d/SHEET_ID/edit...
    // Output: https://docs.google.com/spreadsheets/d/SHEET_ID/htmlembed
    let url = sheetUrl.trim()

    // Extract sheet ID
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (match) {
      const sheetId = match[1]
      url = `https://docs.google.com/spreadsheets/d/${sheetId}/htmlembed?widget=true`
      setEmbedUrl(url)
      setIsExpanded(true)
    } else {
      // Try using the URL directly if it looks like an embed URL
      if (url.includes("google.com/spreadsheets")) {
        setEmbedUrl(url)
        setIsExpanded(true)
      }
    }
  }

  function handleRemove() {
    setEmbedUrl(null)
    setSheetUrl("")
    setIsExpanded(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sheet className="h-5 w-5 text-green-600" />
          Google Sheet
        </CardTitle>
        <CardDescription>
          Embed a Google Sheet for merch sales tracking or other financial data.
          Make sure the sheet is set to &quot;Anyone with the link can view&quot;.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!embedUrl ? (
          <div className="flex gap-2">
            <Input
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Paste Google Sheets URL here..."
              className="flex-1"
            />
            <Button onClick={handleEmbed} disabled={!sheetUrl}>
              <Sheet className="mr-2 h-4 w-4" />
              Embed
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sheet className="h-4 w-4 text-green-600" />
                Google Sheet embedded
                <a
                  href={sheetUrl || embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Open in new tab <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? "Collapse" : "Expand"}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRemove}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {isExpanded && (
              <div className="rounded-lg border overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full"
                  style={{ height: "500px" }}
                  title="Embedded Google Sheet"
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
