import { notFound } from "next/navigation"
import { getTourCrew } from "@/lib/queries/crew-queries"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { formatCrewRole } from "@/lib/validations/crew"
import { PrintButton } from "@/components/print/print-button"

export default async function PrintCrewRosterPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: {
      name: true,
      artist: true,
      team: {
        select: { logoUrl: true, showLogoInPrint: true, name: true },
      },
    },
  })

  if (!tour) notFound()

  const crew = await getTourCrew(tourId)

  // Group by department
  const departments = new Map<string, typeof crew>()
  for (const member of crew) {
    const dept = member.department || "Other"
    if (!departments.has(dept)) departments.set(dept, [])
    departments.get(dept)!.push(member)
  }

  return (
    <div className="p-8 print:p-4">
      <PrintButton />

      {/* Header */}
      <div className="border-b-2 border-black pb-3 mb-4">
        {tour.team.logoUrl && tour.team.showLogoInPrint && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tour.team.logoUrl}
              alt={tour.team.name}
              className="h-12 w-auto object-contain"
            />
          </div>
        )}
        <h1 className="text-2xl font-bold">{tour.artist || tour.name}</h1>
        <p className="text-lg">{tour.name} — Crew Roster</p>
        <p className="text-sm text-gray-600">
          {crew.filter(m => m.isActive).length} active crew members
        </p>
      </div>

      {/* Crew by Department */}
      {Array.from(departments.entries()).map(([deptName, members]) => (
        <div key={deptName} className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 mb-1">
            {deptName} ({members.length})
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Name</th>
                <th className="text-left py-1">Role</th>
                <th className="text-left py-1">Contact</th>
                <th className="text-left py-1">Dietary / Allergies</th>
                <th className="text-left py-1">T-Shirt</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className={`border-b border-gray-200 ${!member.isActive ? "text-gray-400 line-through" : ""}`}>
                  <td className="py-1.5 font-medium">{member.roleTitle}</td>
                  <td className="py-1.5">{formatCrewRole(member.role)}</td>
                  <td className="py-1.5">
                    {member.user?.email && <span className="block">{member.user.email}</span>}
                  </td>
                  <td className="py-1.5">
                    {member.dietaryNeeds && <span>{member.dietaryNeeds}</span>}
                    {member.allergies && (
                      <span className="font-bold text-red-600"> ⚠ {member.allergies}</span>
                    )}
                    {!member.dietaryNeeds && !member.allergies && "—"}
                  </td>
                  <td className="py-1.5">{member.tShirtSize || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Emergency Contacts */}
      <div className="mt-6 print:break-before-page">
        <h2 className="text-sm font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 mb-1">
          Emergency Contacts
        </h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Crew Member</th>
              <th className="text-left py-1">Emergency Contact</th>
              <th className="text-left py-1">Relationship</th>
              <th className="text-left py-1">Phone</th>
            </tr>
          </thead>
          <tbody>
            {crew
              .filter((m) => m.emergencyName)
              .map((member) => (
                <tr key={member.id} className="border-b border-gray-200">
                  <td className="py-1.5 font-medium">{member.roleTitle}</td>
                  <td className="py-1.5">{member.emergencyName}</td>
                  <td className="py-1.5">{member.emergencyRelation || "—"}</td>
                  <td className="py-1.5 font-mono">{member.emergencyPhone || "—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-2 border-t text-xs text-gray-400 flex justify-between print:mt-4">
        <span>{tour.name} — Crew Roster</span>
        <span>Printed {format(new Date(), "MMM d, yyyy HH:mm")}</span>
      </div>
    </div>
  )
}
