"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CrewRoleBadge } from "@/components/crew/crew-role-badge"
import {
  LayoutGrid,
  LayoutList,
  TableIcon,
  Search,
  BadgeDollarSign,
  Plane,
  Hotel,
  Mail,
  Filter,
} from "lucide-react"

interface CrewMember {
  id: string
  roleTitle: string | null
  role: string
  department: string | null
  isActive: boolean
  dailyRate: number | null
  currency: string
  email: string | null
  userName: string | null
  travelCount: number
  roomCount: number
}

type ViewMode = "department" | "table" | "cards"
type SortBy = "name" | "department" | "role" | "rate"

export function CrewListClient({ crew, tourId }: { crew: CrewMember[]; tourId: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>("department")
  const [search, setSearch] = useState("")
  const [filterDept, setFilterDept] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("active")
  const [sortBy, setSortBy] = useState<SortBy>("name")

  const departments = useMemo(() => {
    const depts = new Set(crew.map((m) => m.department || "Other"))
    return Array.from(depts).sort()
  }, [crew])

  const filteredCrew = useMemo(() => {
    let result = [...crew]

    // Status filter
    if (filterStatus === "active") result = result.filter((m) => m.isActive)
    else if (filterStatus === "inactive") result = result.filter((m) => !m.isActive)

    // Department filter
    if (filterDept !== "all") {
      result = result.filter((m) => (m.department || "Other") === filterDept)
    }

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.roleTitle?.toLowerCase().includes(q) ||
          m.userName?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.department?.toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.roleTitle || "").localeCompare(b.roleTitle || "")
        case "department":
          return (a.department || "Other").localeCompare(b.department || "Other")
        case "role":
          return a.role.localeCompare(b.role)
        case "rate":
          return (b.dailyRate || 0) - (a.dailyRate || 0)
        default:
          return 0
      }
    })

    return result
  }, [crew, search, filterDept, filterStatus, sortBy])

  // Group by department for department view
  const grouped = useMemo(() => {
    const map = new Map<string, CrewMember[]>()
    for (const m of filteredCrew) {
      const dept = m.department || "Other"
      if (!map.has(dept)) map.set(dept, [])
      map.get(dept)!.push(m)
    }
    return map
  }, [filteredCrew])

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crew..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort: Name</SelectItem>
              <SelectItem value="department">Sort: Dept</SelectItem>
              <SelectItem value="role">Sort: Role</SelectItem>
              <SelectItem value="rate">Sort: Rate</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "department" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode("department")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-none border-x"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredCrew.length} of {crew.length} crew members
      </p>

      {filteredCrew.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No crew members match your filters.
          </CardContent>
        </Card>
      ) : viewMode === "department" ? (
        /* ─── Department View ───────────────────── */
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([deptName, members]) => (
            <Card key={deptName}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{deptName}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{members.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {members.map((member) => (
                    <CrewListItem key={member.id} member={member} tourId={tourId} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "cards" ? (
        /* ─── Card Grid View ────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrew.map((member) => (
            <CrewCard key={member.id} member={member} tourId={tourId} />
          ))}
        </div>
      ) : (
        /* ─── Table View ────────────────────────── */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-right p-3 font-medium">Rate/Day</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCrew.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <Link
                          href={`/tours/${tourId}/crew/${member.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {member.roleTitle || "Untitled"}
                        </Link>
                      </td>
                      <td className="p-3">
                        <CrewRoleBadge role={member.role} />
                      </td>
                      <td className="p-3 text-muted-foreground">{member.department || "Other"}</td>
                      <td className="p-3 text-muted-foreground truncate max-w-[200px]">
                        {member.email || "—"}
                      </td>
                      <td className="p-3 text-right tabular-nums">
                        {member.dailyRate
                          ? `${member.dailyRate.toLocaleString()} ${member.currency}`
                          : "—"}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={member.isActive ? "default" : "outline"} className="text-xs">
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CrewListItem({ member, tourId }: { member: CrewMember; tourId: string }) {
  const name = member.roleTitle || "Untitled"
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link
      href={`/tours/${tourId}/crew/${member.id}`}
      className="flex items-center gap-4 py-3 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback className="text-xs bg-primary/10">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{name}</p>
          {!member.isActive && (
            <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <CrewRoleBadge role={member.role} />
          {member.email && (
            <span className="text-xs text-muted-foreground truncate">{member.email}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {member.dailyRate && (
          <span className="flex items-center gap-1">
            <BadgeDollarSign className="h-3.5 w-3.5" />
            {member.dailyRate.toLocaleString()}/{member.currency}
          </span>
        )}
        {member.travelCount > 0 && (
          <span className="flex items-center gap-1">
            <Plane className="h-3.5 w-3.5" />
            {member.travelCount}
          </span>
        )}
        {member.roomCount > 0 && (
          <span className="flex items-center gap-1">
            <Hotel className="h-3.5 w-3.5" />
            {member.roomCount}
          </span>
        )}
      </div>
    </Link>
  )
}

function CrewCard({ member, tourId }: { member: CrewMember; tourId: string }) {
  const name = member.roleTitle || "Untitled"
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link href={`/tours/${tourId}/crew/${member.id}`}>
      <Card className="hover:bg-muted/30 transition-colors cursor-pointer h-full">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{name}</p>
                {!member.isActive && (
                  <Badge variant="outline" className="text-xs">Inactive</Badge>
                )}
              </div>
              <CrewRoleBadge role={member.role} />
              <p className="text-xs text-muted-foreground mt-1">
                {member.department || "Other"}
              </p>
              {member.email && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.dailyRate && (
                <p className="text-sm font-medium mt-2">
                  {member.dailyRate.toLocaleString()} {member.currency}/day
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
