"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Upload, Trash2, Palette, Type, ImageIcon, Pencil } from "lucide-react"
import { BRAND_FONTS } from "@/lib/brand-colors"
import { updateTeamBranding, updateTeamName, removeTeamLogo } from "@/lib/actions/team-actions"

interface BrandingSettingsFormProps {
  team: {
    id: string
    name: string
    logoUrl: string | null
    brandColor: string | null
    brandFont: string | null
    showLogoInSidebar: boolean
    showLogoInPrint: boolean
  }
}

export function BrandingSettingsForm({ team }: BrandingSettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [teamName, setTeamName] = useState(team.name)
  const [logoUrl, setLogoUrl] = useState(team.logoUrl)
  const [brandColor, setBrandColor] = useState(team.brandColor || "")
  const [brandFont, setBrandFont] = useState(team.brandFont || "")
  const [showLogoInSidebar, setShowLogoInSidebar] = useState(
    team.showLogoInSidebar
  )
  const [showLogoInPrint, setShowLogoInPrint] = useState(team.showLogoInPrint)
  const [isUploading, setIsUploading] = useState(false)

  // ─── Team Name ──────────────────────────────────────────────

  function handleSaveTeamName() {
    if (!teamName.trim() || teamName === team.name) return
    startTransition(async () => {
      try {
        await updateTeamName(teamName.trim())
        toast.success("Team name updated!")
        router.refresh()
      } catch {
        toast.error("Failed to update team name")
      }
    })
  }

  // ─── Logo Upload ──────────────────────────────────────────────

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      })

      let errorMessage = "Upload failed"
      if (!res.ok) {
        try {
          const data = await res.json()
          errorMessage = data.error || errorMessage
        } catch {
          errorMessage = `Upload failed: ${res.status} ${res.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      if (!data.url) {
        throw new Error("No URL returned from server")
      }
      setLogoUrl(data.url)
      toast.success("Logo uploaded!")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function handleRemoveLogo() {
    startTransition(async () => {
      try {
        await removeTeamLogo()
        setLogoUrl(null)
        toast.success("Logo removed")
        router.refresh()
      } catch {
        toast.error("Failed to remove logo")
      }
    })
  }

  // ─── Save Branding ───────────────────────────────────────────

  function handleSave() {
    startTransition(async () => {
      try {
        await updateTeamBranding({
          brandColor: brandColor || null,
          brandFont: brandFont || null,
          showLogoInSidebar,
          showLogoInPrint,
        })
        toast.success("Branding updated!")
        router.refresh()
      } catch {
        toast.error("Failed to save branding")
      }
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ─── Team Name Section ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Team Name
          </CardTitle>
          <CardDescription>
            The name of your team or production company. Shown in the sidebar and on printed documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Demo Productions"
              className="max-w-sm"
            />
            <Button
              variant="outline"
              onClick={handleSaveTeamName}
              disabled={isPending || !teamName.trim() || teamName === team.name}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Logo Section ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Team Logo
          </CardTitle>
          <CardDescription>
            Upload your band or team logo. It will appear in the sidebar and on
            printed documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            {logoUrl ? (
              <div className="relative h-20 w-20 rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={team.name}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Logo"}
              </Button>
              {logoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  disabled={isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                PNG, JPG, SVG or WebP. Max 2MB.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show logo in sidebar</Label>
                <p className="text-xs text-muted-foreground">
                  Display your logo at the top of the navigation
                </p>
              </div>
              <Switch
                checked={showLogoInSidebar}
                onCheckedChange={setShowLogoInSidebar}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show logo on printed pages</Label>
                <p className="text-xs text-muted-foreground">
                  Include your logo on day sheets, schedules, and crew lists
                </p>
              </div>
              <Switch
                checked={showLogoInPrint}
                onCheckedChange={setShowLogoInPrint}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Brand Color Section ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Brand Color
          </CardTitle>
          <CardDescription>
            Pick your brand color. It will be applied to buttons, the sidebar,
            and accent elements throughout the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="color"
                value={brandColor || "#000000"}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-12 w-12 cursor-pointer rounded-lg border-2 border-input bg-transparent p-0.5"
              />
            </div>
            <div className="flex-1">
              <Input
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                placeholder="#e11d48"
                className="font-mono"
                maxLength={7}
              />
            </div>
            {brandColor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBrandColor("")}
              >
                Reset
              </Button>
            )}
          </div>
          {brandColor && (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Preview:</span>
              <div
                className="h-8 w-8 rounded-md border"
                style={{ backgroundColor: brandColor }}
              />
              <div
                className="h-8 w-16 rounded-md border flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: brandColor }}
              >
                Button
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Font Section ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Font
          </CardTitle>
          <CardDescription>
            Choose a font for the app. This changes all text throughout the
            interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={brandFont || "default"}
            onValueChange={(val) => setBrandFont(val === "default" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a font..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default (Geist)</SelectItem>
              {BRAND_FONTS.map((font) => (
                <SelectItem key={font.name} value={font.name}>
                  {font.name} — {font.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {brandFont && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Preview:</p>
              <link
                rel="stylesheet"
                href={`https://fonts.googleapis.com/css2?family=${brandFont.replace(/ /g, "+")}:wght@400;600;700&display=swap`}
              />
              <p
                className="text-lg"
                style={{ fontFamily: `"${brandFont}", sans-serif` }}
              >
                The quick brown fox jumps over the lazy dog
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ fontFamily: `"${brandFont}", sans-serif` }}
              >
                {team.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Save Button ──────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} size="lg">
          {isPending ? "Saving..." : "Save Branding"}
        </Button>
      </div>
    </div>
  )
}
