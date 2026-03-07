"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { crewRoles, crewDepartments, tShirtSizes, formatCrewRole, suggestDepartment } from "@/lib/validations/crew"
import { useState } from "react"

interface CrewFormProps {
  action: (formData: FormData) => Promise<void>
  crewMember?: {
    roleTitle: string | null
    role: string
    department: string | null
    dailyRate: { toString(): string } | number | null
    perDiem: { toString(): string } | number | null
    currency: string
    dateOfBirth: Date | null
    nationality: string | null
    passportNumber: string | null
    passportExpiry: Date | null
    dietaryNeeds: string | null
    tShirtSize: string | null
    allergies: string | null
    emergencyName: string | null
    emergencyPhone: string | null
    emergencyRelation: string | null
    startDate: Date | null
    endDate: Date | null
    notes: string | null
  }
  submitLabel?: string
}

function formatDate(date: Date | null): string {
  if (!date) return ""
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function CrewForm({ action, crewMember, submitLabel = "Add Crew Member" }: CrewFormProps) {
  const [selectedRole, setSelectedRole] = useState(crewMember?.role || "OTHER")
  const [department, setDepartment] = useState(crewMember?.department || undefined as string | undefined)

  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    if (!department || department === suggestDepartment(selectedRole)) {
      setDepartment(suggestDepartment(role))
    }
  }

  return (
    <form action={action} className="space-y-6">
      {/* Role & Position */}
      <Card>
        <CardHeader>
          <CardTitle>Role & Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roleTitle">Title / Name *</Label>
              <Input
                id="roleTitle"
                name="roleTitle"
                placeholder="e.g. John Smith — FOH Engineer"
                defaultValue={crewMember?.roleTitle ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Crew Role</Label>
              <Select name="role" value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {crewRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {formatCrewRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select name="department" value={department} onValueChange={(v) => setDepartment(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {crewDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select name="currency" defaultValue={crewMember?.currency ?? "USD"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyRate">Daily Rate</Label>
              <Input
                id="dailyRate"
                name="dailyRate"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={crewMember?.dailyRate?.toString() ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perDiem">Per Diem</Label>
              <Input
                id="perDiem"
                name="perDiem"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={crewMember?.perDiem?.toString() ?? ""}
              />
            </div>
            <div />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={formatDate(crewMember?.startDate ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={formatDate(crewMember?.endDate ?? null)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={formatDate(crewMember?.dateOfBirth ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                name="nationality"
                placeholder="e.g. British"
                defaultValue={crewMember?.nationality ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tShirtSize">T-Shirt Size</Label>
              <Select name="tShirtSize" defaultValue={crewMember?.tShirtSize ?? undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {tShirtSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passportNumber">Passport Number</Label>
              <Input
                id="passportNumber"
                name="passportNumber"
                placeholder="Passport number"
                defaultValue={crewMember?.passportNumber ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passportExpiry">Passport Expiry</Label>
              <Input
                id="passportExpiry"
                name="passportExpiry"
                type="date"
                defaultValue={formatDate(crewMember?.passportExpiry ?? null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dietaryNeeds">Dietary Requirements</Label>
              <Input
                id="dietaryNeeds"
                name="dietaryNeeds"
                placeholder="e.g. Vegetarian, No gluten"
                defaultValue={crewMember?.dietaryNeeds ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                name="allergies"
                placeholder="e.g. Peanuts, Penicillin"
                defaultValue={crewMember?.allergies ?? ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Name</Label>
              <Input
                id="emergencyName"
                name="emergencyName"
                placeholder="Emergency contact name"
                defaultValue={crewMember?.emergencyName ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Phone</Label>
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                placeholder="Emergency phone"
                defaultValue={crewMember?.emergencyPhone ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelation">Relationship</Label>
              <Input
                id="emergencyRelation"
                name="emergencyRelation"
                placeholder="e.g. Spouse, Parent"
                defaultValue={crewMember?.emergencyRelation ?? ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="notes"
            placeholder="Any additional notes about this crew member..."
            defaultValue={crewMember?.notes ?? ""}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
