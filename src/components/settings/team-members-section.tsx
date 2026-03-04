"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Users,
  UserPlus,
  Copy,
  Check,
  X,
  Shield,
  ShieldCheck,
  Crown,
  Eye,
  User,
  Link2,
  Clock,
  Trash2,
} from "lucide-react"
import {
  createTeamInvite,
  revokeTeamInvite,
  updateMemberRole,
  removeMember,
} from "@/lib/actions/team-actions"

interface TeamMember {
  id: string
  role: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface TeamInvite {
  id: string
  token: string
  email: string | null
  role: string
  expiresAt: string
  createdAt: string
}

interface TeamMembersSectionProps {
  members: TeamMember[]
  invites: TeamInvite[]
  currentUserId: string
  isAdmin: boolean
}

const ROLE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  OWNER: { label: "Owner", icon: Crown, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  ADMIN: { label: "Admin", icon: ShieldCheck, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  MANAGER: { label: "Manager", icon: Shield, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" },
  MEMBER: { label: "Member", icon: User, color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30" },
  VIEWER: { label: "Viewer", icon: Eye, color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30" },
}

function getInitials(name: string | null, email: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return (email?.[0] || "?").toUpperCase()
}

function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.MEMBER
  const Icon = config.icon
  return (
    <Badge variant="outline" className={`${config.color} gap-1 font-medium`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

export function TeamMembersSection({
  members,
  invites,
  currentUserId,
  isAdmin,
}: TeamMembersSectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteRole, setInviteRole] = useState("MEMBER")
  const [inviteEmail, setInviteEmail] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [copied, setCopied] = useState(false)

  function handleCreateInvite() {
    startTransition(async () => {
      try {
        const token = await createTeamInvite(inviteRole, inviteEmail || undefined)
        const baseUrl = window.location.origin
        setGeneratedLink(`${baseUrl}/join/${token}`)
        toast.success("Invite link created!")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create invite")
      }
    })
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  function handleRevokeInvite(inviteId: string) {
    startTransition(async () => {
      try {
        await revokeTeamInvite(inviteId)
        toast.success("Invite revoked")
        router.refresh()
      } catch {
        toast.error("Failed to revoke invite")
      }
    })
  }

  function handleUpdateRole(memberId: string, newRole: string) {
    startTransition(async () => {
      try {
        await updateMemberRole(memberId, newRole)
        toast.success("Role updated")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update role")
      }
    })
  }

  function handleRemoveMember(memberId: string, memberName: string | null) {
    if (!confirm(`Remove ${memberName || "this member"} from the team?`)) return
    startTransition(async () => {
      try {
        await removeMember(memberId)
        toast.success("Member removed")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to remove member")
      }
    })
  }

  function resetInviteDialog() {
    setInviteRole("MEMBER")
    setInviteEmail("")
    setGeneratedLink("")
    setCopied(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              {members.length} member{members.length !== 1 ? "s" : ""} in your
              team
            </CardDescription>
          </div>
          {isAdmin && (
            <Dialog
              open={inviteOpen}
              onOpenChange={(open) => {
                setInviteOpen(open)
                if (!open) resetInviteDialog()
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite a Team Member</DialogTitle>
                  <DialogDescription>
                    Create an invite link to share with your team. The link
                    expires after 7 days.
                  </DialogDescription>
                </DialogHeader>

                {!generatedLink ? (
                  <>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={inviteRole}
                          onValueChange={setInviteRole}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">
                              Admin — Can manage team & settings
                            </SelectItem>
                            <SelectItem value="MANAGER">
                              Manager — Can manage tours & crew
                            </SelectItem>
                            <SelectItem value="MEMBER">
                              Member — Can view & edit tours
                            </SelectItem>
                            <SelectItem value="VIEWER">
                              Viewer — Read-only access
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Email{" "}
                          <span className="text-muted-foreground font-normal">
                            (optional)
                          </span>
                        </Label>
                        <Input
                          type="email"
                          placeholder="Restrict to specific email..."
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          If set, only this email can use the invite link.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleCreateInvite}
                        disabled={isPending}
                      >
                        <Link2 className="h-4 w-4 mr-2" />
                        {isPending ? "Creating..." : "Create Invite Link"}
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <p className="text-sm font-medium mb-2">
                        Share this link:
                      </p>
                      <div className="flex gap-2">
                        <Input
                          value={generatedLink}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyLink}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        This link will expire in 7 days. The person will join as{" "}
                        <span className="font-medium">
                          {ROLE_CONFIG[inviteRole]?.label || inviteRole}
                        </span>
                        .
                      </p>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setInviteOpen(false)
                          resetInviteDialog()
                        }}
                      >
                        Done
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Members List */}
        <div className="space-y-2">
          {members.map((member) => {
            const isCurrentUser = member.user.id === currentUserId
            const isOwner = member.role === "OWNER"

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {getInitials(member.user.name, member.user.email)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {member.user.name || "Unnamed"}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs text-muted-foreground">
                        (You)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.user.email}
                  </p>
                </div>

                {/* Role */}
                {isAdmin && !isOwner && !isCurrentUser ? (
                  <Select
                    value={member.role}
                    onValueChange={(val) => handleUpdateRole(member.id, val)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <RoleBadge role={member.role} />
                )}

                {/* Remove button */}
                {isAdmin && !isOwner && !isCurrentUser && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                    onClick={() =>
                      handleRemoveMember(member.id, member.user.name)
                    }
                    disabled={isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Pending Invites */}
        {isAdmin && invites.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Pending Invites
              </h4>
              <div className="space-y-2">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center gap-3 rounded-lg border border-dashed p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {invite.email || "Anyone with the link"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires{" "}
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <RoleBadge role={invite.role} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleRevokeInvite(invite.id)}
                      disabled={isPending}
                      title="Revoke invite"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
