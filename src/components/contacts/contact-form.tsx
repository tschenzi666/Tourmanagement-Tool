"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  mobile: string | null
  company: string | null
  jobTitle: string | null
  category: string
  notes: string | null
}

const categories = [
  { value: "PROMOTER", label: "Promoter" },
  { value: "AGENT", label: "Agent" },
  { value: "VENUE_STAFF", label: "Venue Staff" },
  { value: "PRODUCTION", label: "Production" },
  { value: "CATERING", label: "Catering" },
  { value: "SECURITY", label: "Security" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "ACCOMMODATION", label: "Accommodation" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "LABEL", label: "Label" },
  { value: "PR", label: "PR / Press" },
  { value: "MERCH", label: "Merch" },
  { value: "OTHER", label: "Other" },
]

export function ContactForm({
  action,
  contact,
  submitLabel = "Create Contact",
}: {
  action: (formData: FormData) => Promise<void>
  contact?: Contact
  submitLabel?: string
}) {
  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" required defaultValue={contact?.firstName} placeholder="First name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="lastName" required defaultValue={contact?.lastName} placeholder="Last name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={contact?.company ?? ""} placeholder="Company or organization" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" name="jobTitle" defaultValue={contact?.jobTitle ?? ""} placeholder="e.g. Production Manager" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue={contact?.category ?? "OTHER"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={contact?.phone ?? ""} placeholder="Office phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input id="mobile" name="mobile" type="tel" defaultValue={contact?.mobile ?? ""} placeholder="Mobile phone" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea id="notes" name="notes" defaultValue={contact?.notes ?? ""} placeholder="Any additional notes..." rows={4} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">{submitLabel}</Button>
      </div>
    </form>
  )
}
