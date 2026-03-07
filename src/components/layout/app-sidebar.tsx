"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Music,
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  Contact,
  Settings,
  LogOut,
  ChevronUp,
  Ticket,
  Route,
  Plane,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { TourSwitcher } from "@/components/layout/tour-switcher"
import { useBranding } from "@/components/providers/branding-provider"

interface AppSidebarProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  teams: {
    id: string
    name: string
    slug: string
  }[]
  tours: {
    id: string
    name: string
    artist?: string | null
    status: string
    teamId: string
  }[]
  currentTourId?: string
}

export function AppSidebar({ user, teams, tours, currentTourId: initialTourId }: AppSidebarProps) {
  const pathname = usePathname()
  const branding = useBranding()

  // Detect current tour ID from URL (more reliable than server-side detection)
  const tourMatch = pathname.match(/\/tours\/([^/]+)/)
  const currentTourId = tourMatch?.[1] ?? initialTourId
  const currentTour = tours.find((t) => t.id === currentTourId)

  const mainNav = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ]

  const tourNav = currentTourId
    ? [
        { title: "Overview", href: `/tours/${currentTourId}`, icon: CalendarDays },
        { title: "Schedule", href: `/tours/${currentTourId}/schedule`, icon: CalendarDays },
        { title: "Route", href: `/tours/${currentTourId}/route`, icon: Route },
        { title: "Crew", href: `/tours/${currentTourId}/crew`, icon: Users },
        { title: "Finances", href: `/tours/${currentTourId}/finances`, icon: DollarSign },
        { title: "Guest Lists", href: `/tours/${currentTourId}/guests`, icon: Ticket },
        { title: "Travel", href: `/tours/${currentTourId}/flights`, icon: Plane },
      ]
    : []

  const resourceNav = [
    { title: "Venues", href: "/venues", icon: MapPin },
    { title: "Contacts", href: "/contacts", icon: Contact },
  ]

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                {branding?.logoUrl && branding.showLogoInSidebar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={branding.logoUrl}
                    alt={branding.teamName}
                    className="h-8 w-8 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Music className="h-4 w-4" />
                  </div>
                )}
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">
                    {branding?.teamName ?? "TourManager"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {teams[0]?.name !== branding?.teamName
                      ? teams[0]?.name ?? "No team"
                      : "Tour Management"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <TourSwitcher tours={tours} currentTourId={currentTourId} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentTour && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {currentTour.name}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {tourNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
