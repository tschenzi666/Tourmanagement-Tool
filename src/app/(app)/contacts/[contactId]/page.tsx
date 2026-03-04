import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { getContact } from "@/lib/queries/contact-queries"
import { deleteContact } from "@/lib/actions/contact-actions"
import { ContactCategoryBadge } from "@/components/contacts/contact-category-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Smartphone, Building2, MapPin, Pencil, Trash2 } from "lucide-react"

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ contactId: string }>
}) {
  const { contactId } = await params
  const contact = await getContact(contactId)

  if (!contact) notFound()

  const deleteContactWithId = deleteContact.bind(null, contactId)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Contacts", href: "/contacts" },
          { label: `${contact.firstName} ${contact.lastName}` },
        ]}
      />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {contact.firstName} {contact.lastName}
              </h1>
              <ContactCategoryBadge category={contact.category} />
            </div>
            {contact.jobTitle && (
              <p className="mt-1 text-lg text-muted-foreground">{contact.jobTitle}</p>
            )}
            {contact.company && (
              <p className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {contact.company}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/contacts/${contactId}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <form action={deleteContactWithId}>
              <Button variant="destructive" size="icon" type="submit">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.mobile && (
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${contact.mobile}`} className="text-sm hover:underline">
                      {contact.mobile}
                    </a>
                  </div>
                )}
                {!contact.email && !contact.phone && !contact.mobile && (
                  <p className="text-sm text-muted-foreground">No contact details added.</p>
                )}
              </CardContent>
            </Card>

            {contact.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Linked Venues */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Linked Venues
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contact.venueContacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Not linked to any venues.</p>
                ) : (
                  <div className="space-y-2">
                    {contact.venueContacts.map((vc) => (
                      <Link
                        key={vc.id}
                        href={`/venues/${vc.venue.id}`}
                        className="flex items-center justify-between text-sm hover:bg-muted/50 rounded p-1.5 -mx-1.5"
                      >
                        <div>
                          <p className="font-medium">{vc.venue.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {vc.role} · {vc.venue.city}, {vc.venue.country}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
