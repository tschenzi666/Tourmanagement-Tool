"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { BookUser, Plus, Trash2, Phone, Mail, Building2, X } from "lucide-react"
import { createCrewContact, deleteCrewContact } from "@/lib/actions/crew-actions"

interface CrewContact {
  id: string
  name: string
  role: string
  company: string | null
  phone: string | null
  email: string | null
  notes: string | null
}

export function CrewContactsList({
  tourId,
  crewMemberId,
  contacts,
}: {
  tourId: string
  crewMemberId: string
  contacts: CrewContact[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await createCrewContact(tourId, crewMemberId, {
          name: form.get("name") as string,
          role: form.get("role") as string,
          company: (form.get("company") as string) || undefined,
          phone: (form.get("phone") as string) || undefined,
          email: (form.get("email") as string) || undefined,
          notes: (form.get("notes") as string) || undefined,
        })
        toast.success("Contact added!")
        setShowForm(false)
        router.refresh()
      } catch {
        toast.error("Failed to add contact")
      }
    })
  }

  function handleDelete(contactId: string) {
    startTransition(async () => {
      try {
        await deleteCrewContact(tourId, crewMemberId, contactId)
        toast.success("Contact removed")
        router.refresh()
      } catch {
        toast.error("Failed to remove contact")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookUser className="h-5 w-5" />
            Contacts
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <form onSubmit={handleAdd} className="space-y-3 p-3 rounded-lg border bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="cname" className="text-xs">Name *</Label>
                <Input id="cname" name="name" placeholder="Contact name" required className="h-8 text-sm" />
              </div>
              <div>
                <Label htmlFor="crole" className="text-xs">Role *</Label>
                <Input id="crole" name="role" placeholder="e.g. Equipment Rental" required className="h-8 text-sm" />
              </div>
            </div>
            <div>
              <Label htmlFor="ccompany" className="text-xs">Company</Label>
              <Input id="ccompany" name="company" placeholder="Company name" className="h-8 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="cphone" className="text-xs">Phone</Label>
                <Input id="cphone" name="phone" placeholder="+49..." className="h-8 text-sm" />
              </div>
              <div>
                <Label htmlFor="cemail" className="text-xs">Email</Label>
                <Input id="cemail" name="email" type="email" placeholder="email" className="h-8 text-sm" />
              </div>
            </div>
            <Button type="submit" size="sm" disabled={isPending} className="w-full">
              {isPending ? "Adding..." : "Add Contact"}
            </Button>
          </form>
        )}

        {contacts.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">
            No contacts added yet. Add equipment vendors, rental companies, or other useful contacts.
          </p>
        )}

        {contacts.map((contact) => (
          <div key={contact.id} className="flex items-start gap-3 p-2 rounded-lg border">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 shrink-0 mt-0.5">
              <BookUser className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{contact.name}</p>
              <p className="text-xs text-muted-foreground">{contact.role}</p>
              {contact.company && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Building2 className="h-3 w-3" />
                  {contact.company}
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Phone className="h-3 w-3" />
                  <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Mail className="h-3 w-3" />
                  <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              disabled={isPending}
              onClick={() => handleDelete(contact.id)}
            >
              <Trash2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
