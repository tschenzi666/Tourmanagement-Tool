import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { getCrewMember } from "@/lib/queries/crew-queries"
import { prisma } from "@/lib/prisma"
import { deleteCrewMember, toggleCrewMemberActive } from "@/lib/actions/crew-actions"
import { CrewRoleBadge, DepartmentBadge } from "@/components/crew/crew-role-badge"
import { CrewContactsList } from "@/components/crew/crew-contacts-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import {
  Pencil,
  Trash2,
  BadgeDollarSign,
  Plane,
  Hotel,
  UserCheck,
  UserX,
  Shield,
  Shirt,
  Utensils,
  AlertTriangle,
  Phone,
  CalendarDays,
  Globe,
  CreditCard,
  Train,
  Car,
  Ship,
} from "lucide-react"

const travelModeIcons: Record<string, typeof Plane> = {
  FLY: Plane,
  BUS: Car,
  DRIVE: Car,
  TRAIN: Train,
  FERRY: Ship,
}

export default async function CrewMemberDetailPage({
  params,
}: {
  params: Promise<{ tourId: string; crewId: string }>
}) {
  const { tourId, crewId } = await params
  const [member, crewContacts] = await Promise.all([
    getCrewMember(crewId),
    prisma.crewContact.findMany({
      where: { crewMemberId: crewId },
      orderBy: { createdAt: "desc" },
    }),
  ])

  if (!member) notFound()

  const deleteCrewMemberWithIds = deleteCrewMember.bind(null, tourId, crewId)
  const toggleActiveWithIds = toggleCrewMemberActive.bind(null, tourId, crewId)

  const name = member.roleTitle || "Untitled"
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const currencySymbol = { USD: "$", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$" }[member.currency] || member.currency

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: member.tour.name, href: `/tours/${tourId}` },
          { label: "Crew", href: `/tours/${tourId}/crew` },
          { label: name },
        ]}
      />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg bg-primary/10">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
                {!member.isActive && (
                  <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <CrewRoleBadge role={member.role} />
                {member.department && <DepartmentBadge department={member.department} />}
              </div>
              {member.user?.email && (
                <p className="text-sm text-muted-foreground mt-1">{member.user.email}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <form action={toggleActiveWithIds}>
              <Button variant="outline" size="sm" type="submit">
                {member.isActive ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </Button>
            </form>
            <Button variant="outline" asChild>
              <Link href={`/tours/${tourId}/crew/${crewId}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <form action={deleteCrewMemberWithIds}>
              <Button variant="destructive" size="icon" type="submit">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financials */}
            {(member.dailyRate || member.perDiem) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BadgeDollarSign className="h-5 w-5" />
                    Financials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {member.dailyRate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Daily Rate</p>
                        <p className="text-lg font-semibold">
                          {currencySymbol}{Number(member.dailyRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    {member.perDiem && (
                      <div>
                        <p className="text-sm text-muted-foreground">Per Diem</p>
                        <p className="text-lg font-semibold">
                          {currencySymbol}{Number(member.perDiem).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>
                  {member.startDate && (
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {format(new Date(member.startDate), "MMM d, yyyy")}
                        {member.endDate && ` — ${format(new Date(member.endDate), "MMM d, yyyy")}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Travel Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Travel Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {member.travelAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No travel assignments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {member.travelAssignments.map((ta) => {
                      const leg = ta.travelLeg
                      const ModeIcon = travelModeIcons[leg.mode] || Plane
                      return (
                        <div
                          key={ta.id}
                          className="flex items-center gap-3 p-3 rounded-lg border"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 text-blue-700">
                            <ModeIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {leg.departureCity} → {leg.arrivalCity}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {leg.tourDay.date && format(new Date(leg.tourDay.date), "MMM d, yyyy")}
                              {leg.carrier && ` · ${leg.carrier}`}
                              {leg.flightNumber && ` ${leg.flightNumber}`}
                            </p>
                          </div>
                          {leg.departureTime && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(leg.departureTime), "HH:mm")}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Room Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Room Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {member.roomAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No room assignments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {member.roomAssignments.map((ra) => {
                      const hotel = ra.hotelStay
                      return (
                        <div
                          key={ra.id}
                          className="flex items-center gap-3 p-3 rounded-lg border"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-100 text-amber-700">
                            <Hotel className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{hotel.hotelName}</p>
                            <p className="text-xs text-muted-foreground">
                              {hotel.tourDay.city}
                              {hotel.checkIn && ` · ${format(new Date(hotel.checkIn), "MMM d")}`}
                              {hotel.checkOut && ` - ${format(new Date(hotel.checkOut), "MMM d")}`}
                            </p>
                          </div>
                          <div className="text-right">
                            {ra.roomNumber && (
                              <p className="text-sm font-medium">Room {ra.roomNumber}</p>
                            )}
                            {ra.roomType && (
                              <p className="text-xs text-muted-foreground">{ra.roomType}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {member.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{member.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {member.nationality && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{member.nationality}</span>
                  </div>
                )}
                {member.dateOfBirth && (
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(member.dateOfBirth), "MMM d, yyyy")}</span>
                  </div>
                )}
                {member.passportNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span>{member.passportNumber}</span>
                      {member.passportExpiry && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {format(new Date(member.passportExpiry), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {member.tShirtSize && (
                  <div className="flex items-center gap-3 text-sm">
                    <Shirt className="h-4 w-4 text-muted-foreground" />
                    <span>Size {member.tShirtSize}</span>
                  </div>
                )}
                {member.dietaryNeeds && (
                  <div className="flex items-center gap-3 text-sm">
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                    <span>{member.dietaryNeeds}</span>
                  </div>
                )}
                {member.allergies && (
                  <div className="flex items-center gap-3 text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600 font-medium">{member.allergies}</span>
                  </div>
                )}
                {!member.nationality && !member.dateOfBirth && !member.tShirtSize && !member.dietaryNeeds && !member.allergies && !member.passportNumber && (
                  <p className="text-sm text-muted-foreground">No personal details added.</p>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {member.emergencyName ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{member.emergencyName}</p>
                    {member.emergencyRelation && (
                      <p className="text-xs text-muted-foreground">{member.emergencyRelation}</p>
                    )}
                    {member.emergencyPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <a href={`tel:${member.emergencyPhone}`} className="hover:underline">
                          {member.emergencyPhone}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No emergency contact added.</p>
                )}
              </CardContent>
            </Card>

            {/* General Contacts */}
            <CrewContactsList
              tourId={tourId}
              crewMemberId={crewId}
              contacts={crewContacts.map((c) => ({
                id: c.id,
                name: c.name,
                role: c.role,
                company: c.company,
                phone: c.phone,
                email: c.email,
                notes: c.notes,
              }))}
            />

            {/* Per Diem Summary */}
            {member.perDiemPayments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BadgeDollarSign className="h-5 w-5" />
                    Per Diem Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {member.perDiemPayments.slice(0, 10).map((pd) => (
                      <div
                        key={pd.id}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span className="text-muted-foreground">
                          {format(new Date(pd.date), "MMM d")}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {currencySymbol}{Number(pd.amount).toFixed(2)}
                          </span>
                          <Badge
                            variant={pd.isPaid ? "default" : "outline"}
                            className="text-xs"
                          >
                            {pd.isPaid ? "Paid" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {member.perDiemPayments.length > 10 && (
                      <p className="text-xs text-muted-foreground pt-2">
                        +{member.perDiemPayments.length - 10} more payments
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
